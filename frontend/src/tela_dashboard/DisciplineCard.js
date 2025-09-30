import React from 'react';
import { LogIn } from 'lucide-react';
import './DisciplineCard.css';

const DisciplineCard = ({ disciplineName, professor, studentCount, monitorCount, onEnter }) => {
    return (
        <div className="discipline-card">
            <h3>{disciplineName}</h3>
            <p>Professor(a): {professor}</p>
            <div className="stats">
                <span>Alunos: {studentCount}</span>
                <span>Monitores: {monitorCount}</span>
            </div>
            <button onClick={onEnter} className="enter-button">
                <LogIn size={16} />
                <span>Entrar</span>
            </button>
        </div>
    );
};

export default DisciplineCard;