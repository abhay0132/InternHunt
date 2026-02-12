// src/components/ApplicationModal.jsx
import React, { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import '../styles/ApplicationModal.css';

const ApplicationModal = ({ internship, onClose, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handleApplyClick = async () => {
    try {
      setLoading(true);
      
      // Initiate application (creates pending status)
      await axiosInstance.post(`/applications/${internship.id}/initiate`);
      
      // Open application link in new tab
      if (internship.applyLink) {
        window.open(internship.applyLink, '_blank');
      }
      
      // Show confirmation modal
      setTimeout(() => {
        showConfirmationModal();
      }, 500);
      
    } catch (error) {
      console.error('Error initiating application:', error);
      alert('Failed to initiate application');
    } finally {
      setLoading(false);
    }
  };

  const showConfirmationModal = () => {
    const applied = window.confirm('Did you successfully apply for this internship?');
    
    handleStatusUpdate(applied ? 'applied' : 'not_applied');
  };

  const handleStatusUpdate = async (status) => {
    try {
      await axiosInstance.put(`/applications/${internship.id}/status`, { status });
      
      if (onStatusUpdate) {
        onStatusUpdate(status);
      }
      
      onClose();
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update application status');
    }
  };

  return (
    <>
      <div className="overlay" onClick={onClose}></div>
      <div className="modal">
        <div className="modal-content">
          <button className="close-modal" onClick={onClose}>✕</button>
          
          <h3>{internship.title}</h3>
          <p className="modal-company">{internship.company}</p>
          
          <div className="modal-info">
            {internship.location && <p>📍 {internship.location}</p>}
            {internship.type && <p>💼 {internship.type}</p>}
            {internship.stipend && <p>💰 {internship.stipend}</p>}
          </div>

          <div className="modal-actions">
            <button 
              onClick={handleApplyClick} 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'opening...' : 'apply now'}
            </button>
            <button onClick={onClose} className="btn">
              cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplicationModal;