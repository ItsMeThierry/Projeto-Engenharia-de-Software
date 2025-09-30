import React from "react";
import { useNavigate } from 'react-router-dom';
import { usePermissionContext } from "../context/PermissionContext.js";
import DisciplineCard from "./DisciplineCard.js";
import "./DisciplineList.css";

const DisciplineList = ({ disciplines, setCurrentView }) => {
    const { isUserMonitor } = usePermissionContext();
    const navigate = useNavigate();

    return (
        <div className="discipline-list-container">
            <h2>Minhas Disciplinas</h2>
            <div className="discipline-list">
                {disciplines && disciplines.map((discipline) => (
                    <DisciplineCard
                        key={discipline.id}
                        disciplineName={discipline.name}
                        professor={discipline.name_owner}
                        onEnter={() => navigate(`curso/${discipline.id}`)}
                    />
                ))}

                {/* Card de criar disciplina */}
                {isUserMonitor() && (
                    <div
                        className="discipline-card"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "3rem",
                            color: "#699fe6",
                            cursor: "pointer",
                            fontWeight: "bold",
                        }}
                        onClick={() => setCurrentView("create")}
                    >
                        +
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisciplineList;