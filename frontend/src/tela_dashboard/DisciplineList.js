import React from "react";
import DisciplineCard from "./DisciplineCard.js";
import "./DisciplineList.css";

const DisciplineList = ({ disciplines, onEnter, isMonitor, setCurrentView }) => {
    return (
        <div className="discipline-list-container">
            <h2>Minhas Disciplinas</h2>
            <div className="discipline-list">
                {disciplines.map((discipline) => (
                    <DisciplineCard
                        key={discipline.id}
                        disciplineName={discipline.name}
                        professor={discipline.professor}
                        studentCount={discipline.students}
                        monitorCount={discipline.monitors}
                        onEnter={() => onEnter(discipline.id)}
                    />
                ))}

                {/* Card de criar disciplina */}
                {isMonitor && (
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