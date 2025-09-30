import React, { useState, useEffect } from "react";
import { usePermissionContext } from '../context/PermissionContext.js'
import { get_user_courses } from '../api/requests.js';
import DisciplineList from "./DisciplineList.js";
import DisciplineManager from "./DisciplineManager.js";
import DisciplineCreate from "./DisciplineCreate.js";
import "./TelaDashboard.css";

const TelaDashboard = ({ currentView, setCurrentView, coursesUpdateTrigger }) => {
    const { isUserMonitor, getUserData } = usePermissionContext();
    const [disciplines, setDisciplines] = useState([]);

    const userData = getUserData();

    useEffect(() => {
        const fetchDisciplinas = async () => {
            const data = await get_user_courses(userData.id);
            setDisciplines(data);
        };

        fetchDisciplinas();
    }, [userData, coursesUpdateTrigger]);

    return (
        <main>
            {currentView === "list" && (
                <DisciplineList
                    disciplines={disciplines}
                    setCurrentView={setCurrentView}
                />
            )}
            {isUserMonitor() && currentView === "manage" && (
                <DisciplineManager disciplines={disciplines} setDisciplines={setDisciplines} />
            )}
            {isUserMonitor() && currentView === "create" && (
                <DisciplineCreate
                    setDisciplines={setDisciplines}
                    setCurrentView={setCurrentView}
                />
            )}
        </main>
    );
};

export default TelaDashboard;