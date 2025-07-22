const express = require("express");
const cors = require("cors");
const snmp = require("net-snmp");
const { Pool } = require("pg");

const app = express();
const PORT = 3001;
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "192.168.8.166",
  database: "Impresoras",
  password: "123",
  port: 5432,
});

app.post("/api/impresoras", async (req, res) => {
  const { ip, sucursal, modelo, drivers_url, tipo, toner_reserva, direccion } =
    req.body;
  try {
    await pool.query(
      "INSERT INTO impresoras (ip, sucursal, modelo, drivers_url, tipo, toner_reserva, direccion) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [ip, sucursal, modelo, drivers_url, tipo, toner_reserva, direccion]
    );
    res.status(201).json({ message: "Impresora agregada" });
  } catch (err) {
    console.error("Error al agregar impresora:", err);
    res.status(500).json({ error: "Error al insertar impresora" });
  }
});

// OIDs SNMP comunes para impresoras
const oids = [
  "1.3.6.1.2.1.43.11.1.1.9.1.1", // toner negro
  "1.3.6.1.2.1.43.5.1.1.17.1", // número de serie
  "1.3.6.1.2.1.43.10.2.1.4.1.1", // contador total de páginas
];

function consultarToner(ip) {
  return new Promise((resolve) => {
    const session = snmp.createSession(ip, "public", { timeout: 3000 });

    try {
      session.get(oids, (error, varbinds) => {
        if (error) {
          resolve({ error: true, mensaje: "Error SNMP: " + error.message });
        } else {
          const tonerRaw = varbinds[0]?.value;
          const numeroSerieRaw = varbinds[1]?.value;
          const contadorRaw = varbinds[2]?.value;

          // Procesar valores
          const toner =
            tonerRaw !== null && !isNaN(tonerRaw)
              ? parseInt(tonerRaw, 10)
              : null;

          const numero_serie = numeroSerieRaw
            ? String(numeroSerieRaw).trim()
            : null;

          const contador =
            contadorRaw !== null && !isNaN(contadorRaw)
              ? parseInt(contadorRaw, 10)
              : null;

          // Validación final
          if (toner === null && numero_serie === null && contador === null) {
            resolve({
              error: true,
              mensaje: "No se pudo obtener información SNMP válida.",
            });
          } else {
            resolve({ toner, numero_serie, contador });
          }
        }

        session.close();
      });
    } catch (err) {
      resolve({ error: true, mensaje: "Excepción SNMP: " + err.message });
      session.close();
    }
  });
}

module.exports = consultarToner;

setInterval(async () => {
  try {
    const { rows: impresoras } = await pool.query("SELECT * FROM impresoras");

    for (const impresora of impresoras) {
      const resultado = await consultarToner(impresora.ip);

      if (!resultado.error && resultado.toner !== null) {
        const tonerActual = resultado.toner;
        const tonerAnterior = impresora.toner_anterior;

        // Si se repuso el tóner (el valor subió)
        if (tonerAnterior !== null && tonerActual > tonerAnterior) {
          await pool.query(
            `UPDATE impresoras
             SET cambios_toner = cambios_toner + 1,
                 fecha_ultimo_cambio = NOW(),
                 toner_anterior = $1,
                 toner_reserva = GREATEST(toner_reserva - 1, 0)
             WHERE id = $2`,
            [tonerActual, impresora.id]
          );
          console.log(`🟢 Cambio de tóner detectado en IP ${impresora.ip}`);
        } else {
          // Solo actualiza el toner_anterior sin contar como cambio
          await pool.query(
            `UPDATE impresoras
             SET toner_anterior = $1
             WHERE id = $2`,
            [tonerActual, impresora.id]
          );
        }
      }
    }
  } catch (error) {
    console.error("Error en la verificación automática de tóner:", error);
  }
}, 300000); // 5 minutos

app.get("/api/toners", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM impresoras ORDER BY id");
    const impresoras = result.rows;

    const impresorasConToner = await Promise.all(
      impresoras.map(async (impresora) => {
        const resultado = await consultarToner(impresora.ip);
        return {
          ...impresora,
          toner: resultado.toner,
          contador_paginas: resultado.contador, // 👈 Agregado
          numero_serie: resultado.numero_serie, // 👈 Agregado
          error: resultado.error,
        };
      })
    );

    app.delete("/api/impresoras/:id", async (req, res) => {
      const { id } = req.params;

      try {
        const result = await pool.query(
          "DELETE FROM impresoras WHERE id = $1 RETURNING *",
          [id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: "Impresora no encontrada" });
        }

        res.json({ mensaje: "Impresora eliminada correctamente" });
      } catch (error) {
        console.error("Error al eliminar impresora:", error);
        res.status(500).json({ error: "Error al eliminar impresora" });
      }
    });

    res.json({ impresoras: impresorasConToner });
  } catch (error) {
    console.error("Error consultando la base de datos:", error);
    res.status(500).json({ error: "Error consultando base de datos" });
  }
});

app.put("/api/impresoras/:id", async (req, res) => {
  const { id } = req.params;
  const { ip, sucursal, modelo, drivers_url, tipo, toner_reserva, direccion } =
    req.body;

  try {
    const result = await pool.query(
      `UPDATE impresoras 
       SET ip = $1, sucursal = $2, modelo = $3, drivers_url = $4, tipo = $5, toner_reserva = $6, direccion = $7
       WHERE id = $8 RETURNING *`,
      [ip, sucursal, modelo, drivers_url, tipo, toner_reserva, direccion, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Impresora no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al editar impresora:", error);
    res.status(500).json({ error: "Error al editar impresora" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor SNMP activo en http://localhost:${PORT} ✅");
});

app.put("/api/pedido", async (req, res) => {
  const { impresora_id } = req.body;

  try {
    await pool.query(
      `UPDATE impresoras 
       SET ultimo_pedido_fecha = NOW(),
       toner_reserva = toner_reserva + 1
       WHERE id = $1`,
      [impresora_id]
    );

    res
      .status(200)
      .json({ message: "Fecha de pedido actualizada correctamente ✅" });
  } catch (error) {
    console.error("Error al actualizar pedido:", error);
    res.status(500).json({ error: "Error al actualizar el pedido ❌" });
  }
});
