import React, { useRef } from "react";
import TonerBar from "./TonerBar";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaCartShopping } from "react-icons/fa6";
import { BsInfoCircleFill } from "react-icons/bs";
import { FaPrint } from "react-icons/fa";

export default function PrinterTable({
  impresoras,
  tipo,
  onEdit,
  onDelete,
  onInfo,
  onCopy,
}) {
  // 🔹 Función para subir archivo e imprimir
  const handlePrint = async (impresoraId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `http://192.168.8.166:3001/api/impresoras/${impresoraId}/print`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("✅ Archivo enviado a imprimir");
      } else {
        alert("❌ Error: " + data.error);
      }
    } catch (error) {
      alert("❌ Error de conexión: " + error.message);
    }
  };

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
            <th>Pedido</th>
            <th>Imprimir</th> {/* 🔹 Nueva columna */}
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
                  {impresora.toner_anterior <= 0 ? (
                    "No disponible"
                  ) : (
                    <TonerBar value={impresora.toner_anterior} />
                  )}
                </td>
                <td>
                  <button
                    className="info-button"
                    onClick={() => onInfo(impresora)}
                    title="Ver información"
                  >
                    <BsInfoCircleFill />
                  </button>
                </td>
                <td>
                  <button
                    className="edit-btn"
                    title="Editar Impresora"
                    onClick={() => onEdit(impresora)}
                  >
                    <FaRegEdit />
                  </button>
                  <button
                    className="delete-btn"
                    title="Eliminar Impresora"
                    onClick={() => onDelete(impresora.id)}
                  >
                    <RiDeleteBin6Line />
                  </button>
                </td>
                <td>
                  <button
                    className="pedido-btn"
                    onClick={() => onCopy(impresora)}
                    title="Generar pedido de tóner"
                  >
                    <FaCartShopping />
                  </button>
                </td>
                <td>
                  {/* 🔹 Input oculto para elegir archivo */}
                  <input
                    type="file"
                    id={`file-${impresora.id}`}
                    style={{ display: "none" }}
                    onChange={(e) =>
                      handlePrint(impresora.id, e.target.files[0])
                    }
                  />
                  <button
                    className="print-btn"
                    title="Imprimir archivo"
                    onClick={() =>
                      document.getElementById(`file-${impresora.id}`).click()
                    }
                  >
                    <FaPrint />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
}
