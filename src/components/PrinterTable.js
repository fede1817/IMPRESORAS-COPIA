import React from "react";
import TonerBar from "./TonerBar";

export default function PrinterTable({
  impresoras,
  tipo,
  onEdit,
  onDelete,
  onInfo,
}) {
  return (
    <>
      <table className="dark-table">
        <thead>
          <tr>
            <th>IP</th>
            <th>Sucursal</th>
            <th>Modelo</th>
            <th>Nivel de Tóner Negro</th>
            <th>Info</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {impresoras
            .filter((i) => i.tipo === tipo)
            .map((impresora, index) => (
              <tr key={`${tipo}-${index}`}>
                <td>
                  <a
                    href={`http://${impresora.ip}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {impresora.ip}
                  </a>
                </td>
                <td>{impresora.sucursal}</td>
                <td>
                  <a
                    href={impresora.drivers_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {impresora.modelo}
                  </a>
                </td>
                <td>
                  <TonerBar value={impresora.toner} />
                </td>
                <td>
                  <button
                    className="info-button"
                    onClick={() => onInfo(impresora)}
                    title="Ver información"
                  >
                    ℹ
                  </button>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => onEdit(impresora)}
                    >
                      Editar
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => onDelete(impresora.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
}
