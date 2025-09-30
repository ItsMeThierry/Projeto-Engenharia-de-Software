import React, { useState } from "react";
import { usePermissionContext } from "../context/PermissionContext";
import { add_course, add_user_course } from "../api/requests.js";
import { ArrowLeft, Plus } from "lucide-react";
import "./DisciplineManager.css"; // aproveita estilo

const DisciplineCreate = ({ setDisciplines, setCurrentView }) => {
    const [name, setName] = useState("");
    const { getUserData } = usePermissionContext();

    const userData = getUserData();

    const handleCreate = async () => {
        if (!name.trim()) {
            alert("Por favor, preencha todos os campos!");
            return;
        }

        const response = await add_course(name, null, userData.id);
        console.log(response);

        if(response.id_curso){ 
            // Limpa os campos
            setName("");

            // Volta para a lista
            setCurrentView("list");
            return;
        }

        alert("Deu algum problema ao cadastrar o curso.");
    };

    return (
        <div className="manager-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
                <button
                    onClick={() => setCurrentView("list")}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        background: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: '#495057',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                    }}
                >
                    <ArrowLeft size={16} />
                    Voltar
                </button>
                <h2 style={{ margin: 0, textAlign: 'center', flex: 1 }}>Criar Nova Disciplina</h2>
                <div style={{ width: '80px' }}></div> {/* Espaçador para centralizar o título */}
            </div>

            <div className="discipline-item" style={{
                flexDirection: "column",
                gap: "20px",
                alignItems: "stretch",
                padding: "30px"
            }}>
                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#2c3e50',
                        fontSize: '0.95rem'
                    }}>
                        Nome da Disciplina
                    </label>
                    <input
                        type="text"
                        placeholder="Ex: Algoritmos e Estruturas de Dados"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{
                            padding: "12px 16px",
                            width: "100%",
                            border: "2px solid #e0e6ed",
                            borderRadius: "8px",
                            fontSize: "1rem",
                            transition: "border-color 0.3s ease",
                            outline: "none"
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#699fe6"}
                        onBlur={(e) => e.target.style.borderColor = "#e0e6ed"}
                    />
                </div>

                <button
                    onClick={handleCreate}
                    className="edit-btn"
                    style={{
                        alignSelf: "center",
                        padding: "14px 32px",
                        fontSize: "1rem",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        minWidth: "140px",
                        justifyContent: "center"
                    }}
                >
                    <Plus size={18} />
                    Criar Disciplina
                </button>
            </div>
        </div>
    );
};

export default DisciplineCreate;