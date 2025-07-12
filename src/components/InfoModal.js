import React from 'react';
import { X } from 'lucide-react'; // Asegurate de tener instalado lucide-react
export default function InfoModal({ visible, data, onClose }) {
  if (!visible || !data) return null;

  return (
    <div className="info-modal-overlay">
      <div className="info-modal-content">
        <div className="info-modal-header">
          <h3>Información del Tóner</h3>
          <button className="info-close-icon" onClick={onClose} title="Cerrar">
            <X size={20} />
          </button>
        </div>
        <div className="info-modal-body">
          <p><strong>Sucursal:</strong> {data.sucursal}</p>
          <p><strong>Modelo:</strong> {data.modelo}</p>
          <p><strong>Tipo:</strong> {data.tipo}</p>
           <p><strong>Último cambio de tóner:</strong> {data.fecha_ultimo_cambio ? new Date(data.fecha_ultimo_cambio).toLocaleString() : 'N/A'}</p>
          <p><strong>Tóner de reserva:</strong> {data.toner_reserva || 0}</p>
        </div>
      </div>
    </div>
  );
}
