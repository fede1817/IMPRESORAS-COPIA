const express = require('express');
const cors = require('cors');
const snmp = require('net-snmp');
const { Pool } = require('pg');

const app = express();
const PORT = 3001;
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Impresoras',
  password: '123',
  port: 5432,
});


app.post('/api/impresoras', async (req, res) => {
  const { ip, sucursal, modelo, drivers_url, tipo, toner_reserva } = req.body;
  try {
    await pool.query(
      'INSERT INTO impresoras (ip, sucursal, modelo, drivers_url, tipo, toner_reserva) VALUES ($1, $2, $3, $4, $5, $6)',
      [ip, sucursal, modelo, drivers_url, tipo, toner_reserva]
    );
    res.status(201).json({ message: 'Impresora agregada' });
  } catch (err) {
    console.error('Error al agregar impresora:', err);
    res.status(500).json({ error: 'Error al insertar impresora' });
  }
});

// OID para tóner negro
const OID_TONER_NEGRO = '1.3.6.1.2.1.43.11.1.1.9.1.1';

function consultarToner(ip) {
  return new Promise((resolve) => {
    const session = snmp.createSession(ip, "public", { timeout: 2000 });

    session.get([OID_TONER_NEGRO], (error, varbinds) => {
      if (error || !varbinds || varbinds[0].type === snmp.ObjectType.NoSuchInstance) {
        resolve({ toner: null, error: true });
      } else {
        const value = varbinds[0].value;
        resolve({ toner: value, error: false });
      }
      session.close();
    });
  });
}

setInterval(async () => {
  try {
    const { rows: impresoras } = await pool.query('SELECT * FROM impresoras');

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
    console.error('Error en la verificación automática de tóner:', error);
  }
}, 300000); // 5 minutos


app.get('/api/toners', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM impresoras ORDER BY id');
    const impresoras = result.rows;

    const impresorasConToner = await Promise.all(
      impresoras.map(async (impresora) => {
        const resultado = await consultarToner(impresora.ip);
        return {
          ...impresora,
          toner: resultado.toner,
          error: resultado.error,
        };
      })
    );
app.delete('/api/impresoras/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM impresoras WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Impresora no encontrada' });
    }

    res.json({ mensaje: 'Impresora eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar impresora:', error);
    res.status(500).json({ error: 'Error al eliminar impresora' });
  }
});

    res.json({ impresoras: impresorasConToner });
  } catch (error) {
    console.error('Error consultando la base de datos:', error);
    res.status(500).json({ error: 'Error consultando base de datos' });
  }
});

app.put('/api/impresoras/:id', async (req, res) => {
  const { id } = req.params;
  const { ip, sucursal, modelo, drivers_url, tipo, toner_reserva } = req.body;

  try {
    const result = await pool.query(
      `UPDATE impresoras 
       SET ip = $1, sucursal = $2, modelo = $3, drivers_url = $4, tipo = $5, toner_reserva = $6 
       WHERE id = $7 RETURNING *`,
      [ip, sucursal, modelo, drivers_url, tipo, toner_reserva, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Impresora no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al editar impresora:', error);
    res.status(500).json({ error: 'Error al editar impresora' });
  }
});



app.listen(PORT, '0.0.0.0', () => {
  console.log('Servidor SNMP activo en http://localhost:${PORT} ✅');
});
