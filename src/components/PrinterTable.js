import React from "react";
import TonerBar from "./TonerBar";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaCartShopping } from "react-icons/fa6";

import { BsInfoCircleFill } from "react-icons/bs";

export default function PrinterTable({
  impresoras,
  tipo,
  onEdit,
  onDelete,
  onInfo,
  onCopy,
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
            <th>Pedido</th>
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
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
}
