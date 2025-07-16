import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import PrinterTable from "./components/PrinterTable";
import PrinterForm from "./components/PrinterForm";
import InfoModal from "./components/InfoModal";
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
  const topRef = useRef(null);

  // ✅ FUNCION para cargar impresoras
  const fetchImpresoras = (showMessage = false) => {
    if (showMessage) {
      setShowLoadingMessage(true);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
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

      fetchImpresoras(true); // ⏳ Mostrar spinner y hacer scroll

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

        fetchImpresoras(true); // ⏳ Mostrar spinner y hacer scroll

        Swal.fire({
          title: "¡Eliminado!",
          text: "La impresora fue eliminada correctamente.",
          icon: "success",
          background: "#2c2c2c",
          color: "#fff",
        });
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
    });
    setEditingId(impresora.id);
    setShowModal(true);
  };

  return (
    <div className="App dark-mode">
      <div ref={topRef}>
        <h1>Estado de las impresoras Ricoh</h1>
      </div>
      <button className="add-btn" onClick={() => setShowModal(true)}>
        Agregar impresora
      </button>

      {showLoadingMessage && (
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <div className="spinner" />
          <p className="loading-text">Cargando impresoras...</p>
        </div>
      )}

      <PrinterTable
        impresoras={impresoras}
        tipo="principal"
        onEdit={handleEdit}
        onDelete={handleDelete}
        onInfo={(data) => setInfoModal({ visible: true, data })}
      />

      <PrinterTable
        impresoras={impresoras}
        tipo="backup"
        onEdit={handleEdit}
        onDelete={handleDelete}
        onInfo={(data) => setInfoModal({ visible: true, data })}
      />

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
