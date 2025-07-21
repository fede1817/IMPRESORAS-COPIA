import React, { useEffect, useState } from "react";
import "./App.css";
import PrinterTable from "./components/PrinterTable";
import PrinterForm from "./components/PrinterForm";
import InfoModal from "./components/InfoModal";
import LoadingModal from "./components/LoadingModal";
import Swal from "sweetalert2";

function App() {
  const [impresoras, setImpresoras] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    ip: "",
    sucursal: "",
    modelo: "",
    drivers_url: "",
    tipo: "principal",
    toner_reserva: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [infoModal, setInfoModal] = useState({ visible: false, data: null });
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  const [tablaActiva, setTablaActiva] = useState("principal");

  // ✅ Función para cargar impresoras
  const fetchImpresoras = (showMessage = false) => {
    if (showMessage) {
      setShowLoadingMessage(true);
    }

    fetch("http://192.168.8.166:3001/api/toners")
      .then((res) => res.json())
      .then((data) => setImpresoras(data.impresoras || []))
      .catch((err) => console.error("Error al obtener datos:", err))
      .finally(() => {
        if (showMessage) {
          setTimeout(() => setShowLoadingMessage(false), 1000); // Oculta luego de 1 segundo
        }
      });
  };

  useEffect(() => {
    fetchImpresoras();
  }, []);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: editingId
        ? "¿Quieres guardar los cambios en la impresora?"
        : "¿Quieres agregar esta nueva impresora?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "No, cancelar",
      background: "#2c2c2c",
      color: "#fff",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://192.168.8.166:3001/api/impresoras/${editingId}`
      : "http://192.168.8.166:3001/api/impresoras";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Error en la respuesta del servidor");

      await Swal.fire({
        title: editingId ? "¡Cambios guardados!" : "¡Impresora agregada!",
        text: editingId
          ? "Los datos fueron actualizados correctamente."
          : "La nueva impresora fue guardada correctamente.",
        icon: "success",
        background: "#2c2c2c",
        color: "#fff",
        confirmButtonColor: "#3085d6",
      });

      fetchImpresoras(true); // ⏳ Mostrar spinner

      // Limpiar y cerrar modal
      setShowModal(false);
      setFormData({
        ip: "",
        sucursal: "",
        modelo: "",
        drivers_url: "",
        tipo: "principal",
        toner_reserva: "",
      });
      setEditingId(null);
    } catch (err) {
      console.error("Error al guardar:", err);
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al guardar la impresora.",
        icon: "error",
        background: "#2c2c2c",
        color: "#fff",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción eliminará la impresora.",
      icon: "warning",
      background: "#2c2c2c",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await fetch(`http://192.168.8.166:3001/api/impresoras/${id}`, {
          method: "DELETE",
        });

        // ✅ Primero mostrar el mensaje de éxito
        await Swal.fire({
          title: "¡Eliminado!",
          text: "La impresora fue eliminada correctamente.",
          icon: "success",
          background: "#2c2c2c",
          color: "#fff",
          confirmButtonColor: "#3085d6",
        });

        // ✅ Después mostrar spinner y recargar datos
        fetchImpresoras(true);
      } catch (error) {
        console.error("Error al eliminar la impresora:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar la impresora.",
          icon: "error",
          background: "#2c2c2c",
          color: "#fff",
        });
      }
    }
  };

  const handleEdit = (impresora) => {
    setFormData({
      ip: impresora.ip,
      sucursal: impresora.sucursal,
      modelo: impresora.modelo,
      drivers_url: impresora.drivers_url,
      tipo: impresora.tipo,
      toner_reserva: impresora.toner_reserva,
      direccion: impresora.direccion,
    });
    setEditingId(impresora.id);
    setShowModal(true);
  };

  const handleCopyPedido = async (impresora) => {
    const pedidoData = {
      impresora_id: impresora.id,
      modelo: impresora.modelo,
      numero_serie: impresora.numero_serie ?? "N/A",
      contador_total: impresora.contador_paginas ?? "N/A",
      nombre: impresora.sucursal || "Sucursal Desconocida",
      direccion: impresora.direccion || "Dirección no especificada",
      telefono: "0987 200316",
      correo: "bryan.medina@surcomercial.com.py",
      ultimo_pedido_fecha: impresora.ultimo_pedido_fecha,
    };

    let fechaFormateada = "N/A";
    if (pedidoData.ultimo_pedido_fecha) {
      const fecha = new Date(pedidoData.ultimo_pedido_fecha);
      const dia = String(fecha.getDate()).padStart(2, "0");
      const mes = String(fecha.getMonth() + 1).padStart(2, "0");
      const anio = String(fecha.getFullYear()).slice(-2);
      fechaFormateada = `${dia}/${mes}/${anio}`;
    }

    const textoParaCopiar = `
Sucursal: ${pedidoData.nombre}
Modelo: ${pedidoData.modelo}
Número de Serie: ${pedidoData.numero_serie}
Contador: ${pedidoData.contador_total}
Dirección: ${pedidoData.direccion}
Teléfono: ${pedidoData.telefono}
Correo: ${pedidoData.correo}
Último Pedido: ${fechaFormateada}
  `.trim();

    // Mostrar confirmación con SweetAlert2
    const confirmacion = await Swal.fire({
      title: "¿Confirmar pedido de tóner?",
      html: `<pre style="text-align:left">${textoParaCopiar}</pre>`,
      icon: "question",
      background: "#2c2c2c",
      color: "#fff",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: "swal2-popup swal2-preformatted-text",
      },
    });

    if (confirmacion.isConfirmed) {
      try {
        // Copiar al portapapeles
        await navigator.clipboard.writeText(textoParaCopiar);

        // Enviar al backend
        const response = await fetch("http://192.168.8.166:3001/api/pedido", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ impresora_id: pedidoData.impresora_id }),
        });

        if (!response.ok) {
          throw new Error("Error al guardar el pedido en el backend");
        }

        // Éxito
        await Swal.fire({
          icon: "success",
          title: "Pedido confirmado",
          text: "Los datos fueron copiados al portapapeles y enviados correctamente.",
          background: "#2c2c2c",
          color: "#fff",
          confirmButtonColor: "#3085d6",
          timer: 3000,
          showConfirmButton: false,
        });

        fetchImpresoras(true);
      } catch (error) {
        console.error("Error al procesar el pedido:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error al procesar el pedido. Intenta nuevamente.",
        });
      }
    }
  };

  return (
    <div className="App dark-mode">
      <h1>PrinterManager</h1>

      <button className="add-btn" onClick={() => setShowModal(true)}>
        ➕Agregar impresora
      </button>
      <div className="tab-column-header">
        <div
          className={`tab-column ${
            tablaActiva === "principal" ? "active" : ""
          }`}
          onClick={() => setTablaActiva("principal")}
        >
          Principales
        </div>
        <div
          className={`tab-column ${tablaActiva === "backup" ? "active" : ""}`}
          onClick={() => setTablaActiva("backup")}
        >
          Backup
        </div>
        <div
          className={`tab-column ${
            tablaActiva === "comercial" ? "active" : ""
          }`}
          onClick={() => setTablaActiva("comercial")}
        >
          Comercial
        </div>
      </div>

      {showLoadingMessage && <LoadingModal />}

      <div>
        {tablaActiva === "principal" && (
          <PrinterTable
            impresoras={impresoras}
            tipo="principal"
            onEdit={handleEdit}
            onDelete={handleDelete}
            onInfo={(data) => setInfoModal({ visible: true, data })}
            onCopy={handleCopyPedido}
          />
        )}

        {tablaActiva === "backup" && (
          <PrinterTable
            impresoras={impresoras}
            tipo="backup"
            onEdit={handleEdit}
            onDelete={handleDelete}
            onInfo={(data) => setInfoModal({ visible: true, data })}
            onCopy={handleCopyPedido}
          />
        )}

        {tablaActiva === "comercial" && (
          <PrinterTable
            impresoras={impresoras}
            tipo="comercial"
            onEdit={handleEdit}
            onDelete={handleDelete}
            onInfo={(data) => setInfoModal({ visible: true, data })}
            onCopy={handleCopyPedido}
          />
        )}
      </div>

      {showModal && (
        <PrinterForm
          formData={formData}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowModal(false);
            setEditingId(null);
            setFormData({
              ip: "",
              sucursal: "",
              modelo: "",
              drivers_url: "",
              tipo: "principal",
              toner_reserva: "",
            });
          }}
          isEditing={editingId !== null}
        />
      )}

      <InfoModal
        visible={infoModal.visible}
        data={infoModal.data}
        onClose={() => setInfoModal({ visible: false, data: null })}
      />
    </div>
  );
}

export default App;
