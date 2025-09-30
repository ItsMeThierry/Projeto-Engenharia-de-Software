import React, { useState } from "react";
import DisciplineList from "./DisciplineList.js";
import DisciplineManager from "./DisciplineManager.js";
import DisciplineCreate from "./DisciplineCreate.js";
import "./TelaDashboard.css";

const TelaDashboard = ({ user, setUser, isMonitor, currentView, setCurrentView }) => {
    const [disciplines, setDisciplines] = useState([
        { id: 1, name: "Algoritmos e Estruturas de Dados", professor: "Dr. Silva", students: 45, monitors: 3 },
        { id: 2, name: "Engenharia de Software", professor: "Dra. Oliveira", students: 60, monitors: 5 },
        { id: 3, name: "Sistemas Distribuídos", professor: "Dr. Santos", students: 30, monitors: 2 },
        { id: 4, name: "Circuitos Lógicos", professor: "Milton Lacerda", students: 30, monitors: 2 },
        { id: 5, name: "Mecânica dos fluidos", professor: "Hugo Cavalcante", students: 50, monitors: 1 },
        { id: 6, name: "Física Geral", professor: "Alexandre Lirios", students: 40, monitors: 2 },
    ]);

    const handleEnterDiscipline = (disciplineId) => {
        console.log("Entrando na disciplina:", disciplineId);
    };

    return (
        <main>
            {currentView === "list" && (
                <DisciplineList
                    disciplines={disciplines}
                    onEnter={handleEnterDiscipline}
                    isMonitor={isMonitor}
                    setCurrentView={setCurrentView}
                />
            )}
            {isMonitor && currentView === "manage" && (
                <DisciplineManager disciplines={disciplines} setDisciplines={setDisciplines} />
            )}
            {isMonitor && currentView === "create" && (
                <DisciplineCreate
                    setDisciplines={setDisciplines}
                    setCurrentView={setCurrentView}
                />
            )}
        </main>
    );
};

export default TelaDashboard;