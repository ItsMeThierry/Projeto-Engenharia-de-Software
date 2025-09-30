import React, { useState } from "react";
import "./DisciplineManager.css";

const DisciplineManager = ({ disciplines, setDisciplines }) => {
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ name: "", professor: "" });
    const [confirming, setConfirming] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const handleRemove = () => {
        setDisciplines((prev) => prev.filter((d) => d.id !== selectedId));
        setSelectedId(null);
        setConfirming(false);
    };

    const handleEdit = (discipline) => {
        setEditingId(discipline.id);
        setEditData({ name: discipline.name, professor: discipline.professor });
    };

    const saveEdit = () => {
        setDisciplines((prev) =>
            prev.map((d) =>
                d.id === editingId ? { ...d, ...editData } : d
            )
        );
        setEditingId(null);
    };

    return (
        <div className="manager-container">
            <h2>Gerenciar Disciplinas</h2>
            {disciplines.map((d) => (
                <div key={d.id} className="discipline-item">
                    {editingId === d.id ? (
                        <>
                            <input
                                type="text"
                                value={editData.name}
                                onChange={(e) =>
                                    setEditData({ ...editData, name: e.target.value })
                                }
                            />
                            <input
                                type="text"
                                value={editData.professor}
                                onChange={(e) =>
                                    setEditData({ ...editData, professor: e.target.value })
                                }
                            />
                            <button className="edit-btn" onClick={saveEdit}>Salvar</button>
                        </>
                    ) : (
                        <>
              <span>
                <strong>{d.name}</strong> — {d.professor}
              </span>
                            <div className="actions">
                                <button className="edit-btn" onClick={() => handleEdit(d)}>Editar</button>
                                <button
                                    className="remove-btn"
                                    onClick={() => { setSelectedId(d.id); setConfirming(true); }}
                                >
                                    Remover
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}

            {confirming && (
                <div className="confirm-modal">
                    <div className="confirm-box">
                        <p>Tem certeza que deseja remover esta disciplina?</p>
                        <button className="yes-btn" onClick={handleRemove}>Sim</button>
                        <button className="no-btn" onClick={() => setConfirming(false)}>Não</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DisciplineManager;