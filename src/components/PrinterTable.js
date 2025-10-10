import TonerBar from "./TonerBar";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaCartShopping } from "react-icons/fa6";
import { BsInfoCircleFill } from "react-icons/bs";
import { FaPrint } from "react-icons/fa";
import Swal from "sweetalert2";

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
    // Crear y mostrar el spinner
    const spinner = document.createElement("div");
    spinner.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    ">
      <div style="
        padding: 30px;
        border-radius: 10px;
        text-align: center;
        color: white;
      ">
        <div style="
          width: 50px;
          height: 50px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #3085d6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        "></div>
        <p>Enviando a imprimir...</p>
      </div>
    </div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  `;

    document.body.appendChild(spinner);

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

      // Remover el spinner antes de mostrar el mensaje
      document.body.removeChild(spinner);

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Impresión enviada",
          text: "✅ Archivo enviado a imprimir correctamente",
          timer: 2500,
          showConfirmButton: false,
          background: "#2c2c2c",
          color: "#fff",
          confirmButtonColor: "#3085d6",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error en impresión",
          text: data.error || "Ocurrió un problema",
          background: "#2c2c2c",
          color: "#fff",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      // Remover el spinner en caso de error también
      document.body.removeChild(spinner);

      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: error.message,
        background: "#2c2c2c",
        color: "#fff",
        confirmButtonColor: "#d33",
      });
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
