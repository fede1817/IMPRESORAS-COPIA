import React, { useEffect, useState } from 'react';
import './App.css';
import PrinterTable from './components/PrinterTable';
import PrinterForm from './components/PrinterForm';
import InfoModal from './components/InfoModal';

function App() {
  const [impresoras, setImpresoras] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    ip: '',
    sucursal: '',
    modelo: '',
    drivers_url: '',
    tipo: 'principal',
    toner_reserva: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [infoModal, setInfoModal] = useState({ visible: false, data: null });

  useEffect(() => {
    fetch('http://localhost:3001/api/toners')
      .then(res => res.json())
      .then(data => setImpresoras(data.impresoras || []))
      .catch(err => console.error('Error al obtener datos:', err));
  }, []);

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const method = editingId ? 'PUT' : 'POST';
  const url = editingId
    ? `http://localhost:3001/api/impresoras/${editingId}`
    : 'http://localhost:3001/api/impresoras';

  try {
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    setShowModal(false);
    setFormData({ ip: '', sucursal: '', modelo: '', drivers_url: '', tipo: 'principal', toner_reserva: '' });
    setEditingId(null);
    window.location.reload(); // recargar o re-fetch
  } catch (err) {
    console.error('Error al guardar:', err);
  }
};

  const handleDelete = async (id) => {
  if (window.confirm('¿Estás seguro que deseas eliminar esta impresora?')) {
    try {
      await fetch(`http://localhost:3001/api/impresoras/${id}`, {
        method: 'DELETE',
      });
      // Volvés a cargar la lista
      setImpresoras(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error al eliminar la impresora:', error);
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
    toner_reserva: impresora.toner_reserva
  });
  setEditingId(impresora.id); // Guardamos el ID para saber si es edición
  setShowModal(true);
};
  return (
    <div className="App dark-mode">
       <h1>Estado de las impresoras Ricoh</h1>
       <button className="add-btn" onClick={() => setShowModal(true)}>
  Agregar impresora
</button>

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
  <div >
    <div >
     <PrinterForm
  formData={formData}
  onChange={handleInputChange}
  onSubmit={handleSubmit}
  onClose={() => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ ip: '', sucursal: '', modelo: '', drivers_url: '', tipo: 'principal', toner_reserva: '' });
  }}
  isEditing={editingId !== null}
/>
    </div>
  </div>
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
