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

// OIDs SNMP comunes para impresoras Ricoh
const oids = [
  "1.3.6.1.2.1.43.11.1.1.9.1.1", // Toner negro
  "1.3.6.1.2.1.43.5.1.1.17.1", // Número de serie
  "1.3.6.1.2.1.43.10.2.1.4.1.1", // Contador total de páginas
];

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mail.surcomercial.com.py", // ejemplo: mail.zimbra.tuempresa.com
  port: 587,
  secure: false, // usa true si tienes SSL en puerto 465
  auth: {
    user: "federico.britez@surcomercial.com.py", // correo desde donde se envía
    pass: "Surcomercial.fbb",
  },
});

function consultarToner(ip) {
  return new Promise((resolve) => {
    const session = snmp.createSession(ip, "public", { timeout: 3000 });

    session.get(oids, (error, varbinds) => {
      if (error) {
        resolve({ error: true, mensaje: "SNMP Error: " + error.message });
      } else {
        const tonerRaw = varbinds[0]?.value;
        const numeroSerieRaw = varbinds[1]?.value;
        const contadorRaw = varbinds[2]?.value;

        const toner =
          tonerRaw !== null && !isNaN(tonerRaw) ? parseInt(tonerRaw, 10) : null;
        const numero_serie = numeroSerieRaw
          ? String(numeroSerieRaw).trim()
          : null;
        const contador =
          contadorRaw !== null && !isNaN(contadorRaw)
            ? parseInt(contadorRaw, 10)
            : null;

        resolve({ toner, numero_serie, contador, error: false });
      }

      session.close();
    });
  });
}

// 🟢 Actualiza SNMP cada 5 minutos y guarda en BD
setInterval(async () => {
  try {
    const { rows: impresoras } = await pool.query("SELECT * FROM impresoras");

    for (const impresora of impresoras) {
      const resultado = await consultarToner(impresora.ip);

      if (!resultado.error && resultado.toner !== null) {
        const tonerActual = resultado.toner;
        const tonerAnterior = impresora.toner_anterior;
        const ahora = new Date();
        const ultimaAlerta = impresora.ultima_alerta;
        const pasaron7Dias =
          !ultimaAlerta ||
          ahora - new Date(ultimaAlerta) > 7 * 24 * 60 * 60 * 1000;

        // ACTUALIZACIÓN DE TÓNER Y CONTADOR
        if (tonerAnterior !== null && tonerActual > tonerAnterior) {
          await pool.query(
            `UPDATE impresoras SET
              cambios_toner = cambios_toner + 1,
              fecha_ultimo_cambio = NOW(),
              toner_anterior = $1,
              toner_reserva = GREATEST(toner_reserva - 1, 0),
              numero_serie = $2,
              contador_paginas = $3
             WHERE id = $4`,
            [
              tonerActual,
              resultado.numero_serie,
              resultado.contador,
              impresora.id,
            ]
          );
        } else {
          await pool.query(
            `UPDATE impresoras SET
              toner_anterior = $1,
              numero_serie = $2,
              contador_paginas = $3
             WHERE id = $4`,
            [
              tonerActual,
              resultado.numero_serie,
              resultado.contador,
              impresora.id,
            ]
          );
        }

        // ENVÍO DE CORREO SI EL TÓNER ES BAJO
        if (
          tonerActual !== null &&
          tonerActual > 0 &&
          tonerActual <= 20 &&
          pasaron7Dias
        ) {
          const correoDestino = "bryan.medina@surcomercial.com.py"; // Cambiar si se requiere

          const info = {
            modelo: impresora.modelo,
            numero_serie: resultado.numero_serie ?? "N/A",
            contador_total: resultado.contador ?? "N/A",
            sucursal: impresora.sucursal || "Sucursal Desconocida",
            direccion: impresora.direccion || "Dirección no especificada",
            telefono: "0987 200316",
            correo: "bryan.medina@surcomercial.com.py",
            tipo: impresora.tipo,
          };

          const htmlBody = `
            <h3>⚠ Nivel bajo de tóner detectado ${tonerAnterior}%</h3>
            <h3>⚠ tipo ${impresora.tipo}</h3>
            <h3>⚠ ip: ${impresora.ip}</h3>
            <ul>
              <li><strong>Sucursal:</strong> ${info.sucursal}</li>
              <li><strong>Dirección:</strong> ${info.direccion}</li>
              <li><strong>Modelo:</strong> ${info.modelo}</li>
              <li><strong>N° de serie:</strong> ${info.numero_serie}</li>
              <li><strong>Contador total:</strong> ${info.contador_total}</li>
              <li><strong>Teléfono:</strong> ${info.telefono}</li>
              <li><strong>Correo:</strong> ${info.correo}</li>
            </ul>
          `;

          await transporter.sendMail({
            from: '"Alerta de Tóner" <federico.britez@surcomercial.com.py>',
            to: correoDestino,
            cc: ["federico.britez@surcomercial.com.py"],
            subject: `🖨 Tóner bajo en ${info.sucursal} - ${info.modelo} - ${info.tipo}`,
            html: htmlBody,
          });

          await pool.query(
            `UPDATE impresoras SET ultima_alerta = NOW() WHERE id = $1`,
            [impresora.id]
          );

          console.log(
            `📧 Alerta enviada para ${info.modelo} (${info.sucursal})`
          );
        }
      }
    }

    console.log("✅ SNMP actualizado");
  } catch (error) {
    console.error("❌ Error en actualización SNMP:", error);
  }
}, 5 * 60 * 1000); // cada 5 minutos

// 🔵 Agregar impresora
app.post("/api/impresoras", async (req, res) => {
  const { ip, sucursal, modelo, drivers_url, tipo, toner_reserva, direccion } =
    req.body;

  try {
    const snmpData = await consultarToner(ip);

    const toner = snmpData.toner ?? 0; // Si no hay SNMP, inicializa con 0
    const numero_serie = snmpData.numero_serie ?? "";
    const contador = snmpData.contador ?? 0;

    await pool.query(
      `INSERT INTO impresoras 
        (ip, sucursal, modelo, drivers_url, tipo, toner_reserva, direccion,
         cambios_toner, toner_anterior, numero_serie, contador_paginas) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8, $9, $10)`,
      [
        ip,
        sucursal,
        modelo,
        drivers_url,
        tipo,
        toner_reserva,
        direccion,
        toner,
        numero_serie,
        contador,
      ]
    );

    res.status(201).json({
      message: "Impresora agregada con lectura SNMP inicial",
      toner_inicial: toner,
    });
  } catch (err) {
    console.error("❌ Error al agregar impresora:", err);
    res.status(500).json({ error: "Error al insertar impresora" });
  }
});
// 🟢 Obtener impresoras (desde BD, no SNMP en tiempo real)
app.get("/api/toners", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM impresoras ORDER BY id");
    res.json({ impresoras: result.rows });
  } catch (error) {
    console.error("❌ Error consultando BD:", error);
    res.status(500).json({ error: "Error al obtener impresoras" });
  }
});

// 🟠 Editar impresora
app.put("/api/impresoras/:id", async (req, res) => {
  const { id } = req.params;
  const { ip, sucursal, modelo, drivers_url, tipo, toner_reserva, direccion } =
    req.body;

  try {
    const result = await pool.query(
      `UPDATE impresoras SET 
        ip = $1, sucursal = $2, modelo = $3, drivers_url = $4, tipo = $5, 
        toner_reserva = $6, direccion = $7
       WHERE id = $8 RETURNING *`,
      [ip, sucursal, modelo, drivers_url, tipo, toner_reserva, direccion, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Impresora no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al editar impresora:", error);
    res.status(500).json({ error: "Error al editar impresora" });
  }
});

// 🔴 Eliminar impresora
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
    console.error("❌ Error al eliminar impresora:", error);
    res.status(500).json({ error: "Error al eliminar impresora" });
  }
});

// 📦 Registrar pedido
app.put("/api/pedido", async (req, res) => {
  const { impresora_id } = req.body;

  try {
    await pool.query(
      `UPDATE impresoras SET 
        ultimo_pedido_fecha = NOW(),
        toner_reserva = toner_reserva + 1
       WHERE id = $1`,
      [impresora_id]
    );
    res.status(200).json({ message: "Pedido registrado correctamente" });
  } catch (error) {
    console.error("❌ Error en el pedido:", error);
    res.status(500).json({ error: "Error al registrar pedido" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🟢 Servidor activo en http://localhost:${PORT}`);
});
