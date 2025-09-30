import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import './RemoveCoursesModal.css';

const RemoveCoursesModal = ({ isOpen, onClose, disciplines, onRemoveCourses }) => {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!isOpen) return null;

  const handleToggleCourse = (courseId) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleConfirmClick = () => {
    if (selectedCourses.length === 0) return;
    setShowConfirmation(true);
  };

  const handleFinalConfirm = async () => {
    await onRemoveCourses(selectedCourses);
    setSelectedCourses([]);
    setShowConfirmation(false);
    onClose();
  };

  const handleCancel = () => {
    if (showConfirmation) {
      setShowConfirmation(false);
    } else {
      setSelectedCourses([]);
      onClose();
    }
  };

  return (
    <div className="remove-courses-overlay" onClick={handleCancel}>
      <div className="remove-courses-modal" onClick={(e) => e.stopPropagation()}>
        {!showConfirmation ? (
          <>
            {/* Header */}
            <div className="remove-courses-header">
              <h3>Remover Cursos</h3>
              <button className="close-button" onClick={handleCancel}>
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="remove-courses-content">
              <p className="remove-courses-question">Quais cursos deseja remover?</p>
              
              <div className="courses-list">
                {disciplines.length === 0 ? (
                  <div className="no-courses">
                    <p>Nenhum curso disponível para remover.</p>
                  </div>
                ) : (
                  disciplines.map((discipline) => (
                    <label key={discipline.id} className="course-checkbox-item">
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(discipline.id)}
                        onChange={() => handleToggleCourse(discipline.id)}
                      />
                      <span className="course-name">{discipline.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="remove-courses-footer">
              <button className="cancel-button" onClick={handleCancel}>
                Sair
              </button>
              <button 
                className="confirm-button" 
                onClick={handleConfirmClick}
                disabled={selectedCourses.length === 0}
              >
                Confirmar
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Confirmation Screen */}
            <div className="remove-courses-header">
              <h3>Confirmar Remoção</h3>
              <button className="close-button" onClick={handleCancel}>
                <X size={20} />
              </button>
            </div>

            <div className="remove-courses-content confirmation-content">
              <div className="warning-icon">
                <AlertTriangle size={48} />
              </div>
              <p className="confirmation-text">
                Tem certeza que deseja remover {selectedCourses.length} {selectedCourses.length === 1 ? 'curso' : 'cursos'}?
              </p>
              <p className="confirmation-subtext">
                Esta ação não pode ser desfeita.
              </p>
              
              <div className="selected-courses-preview">
                {disciplines
                  .filter(d => selectedCourses.includes(d.id))
                  .map(discipline => (
                    <div key={discipline.id} className="course-preview-item">
                      • {discipline.name}
                    </div>
                  ))
                }
              </div>
            </div>

            <div className="remove-courses-footer">
              <button className="cancel-button" onClick={handleCancel}>
                Cancelar
              </button>
              <button className="confirm-delete-button" onClick={handleFinalConfirm}>
                Remover Cursos
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RemoveCoursesModal;