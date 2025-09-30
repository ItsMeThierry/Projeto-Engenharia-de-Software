import React from 'react';
import { LogIn } from 'lucide-react';
import './DisciplineCard.css';

const DisciplineCard = ({ disciplineName, professor, onEnter }) => {
    
    return (
        <div className="discipline-card">
            <h3>{disciplineName}</h3>
            <p>Professor(a): {professor}</p>
            <button onClick={onEnter} className="enter-button">
                <LogIn size={16} />
                <span>Entrar</span>
            </button>
        </div>
    );
};

export default DisciplineCard;