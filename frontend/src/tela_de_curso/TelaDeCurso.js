import React, { useState } from 'react';
import './TelaDeCurso.css';
import Updates from './Noticias.js'
import Archives from './Arquivos.js';
import Chat from './ChatGeral.js';
import VirtualClassroom from './SalaVirtual.js';
import UsersList from './Participantes.js';

function TelaDeCurso() {
    const [activePage, setActivePage] = useState('Arquivos');

    return(
        <div class='main-layout'>
            <Sidebar activePage={activePage} setActivePage={setActivePage}/>
            <CourseContent activePage={activePage}/>
        </div>
    );
}

function Sidebar({ activePage, setActivePage }) {
    const menuItems = [
        'Arquivos',
        'Noticias', 
        'Chat Geral',
        'Sala Virtual',
        'Participantes'
    ];
    
    return(
        <div class='sidebar'>
            <div class='sidebar-buttons'>
                {menuItems.map(item => (
                    <button 
                        key={item}
                        className={`sidebar-btn ${activePage === item ? 'active' : ''}`}
                        onClick={() => setActivePage(item)}
                    >
                        {item}
                    </button>
                ))}
            </div>
        </div>
    );
}

function CourseContent({ activePage }) {
    const renderContent = () => {
        switch(activePage) {
            case 'Arquivos':
                return <Archives/>;
            case 'Noticias':
                return <Updates/>;
            case 'Chat Geral':
                return <Chat/>
            case 'Sala Virtual':
                return <VirtualClassroom/>;
            case 'Participantes':
                return <UsersList/>
            default:
                return <Archives/>;
        }
    };

    return(
        <div class='course-content'>
            <div class='page-title'><h1>{activePage}</h1></div>
            {renderContent()}
        </div>
    );
}

export default TelaDeCurso;