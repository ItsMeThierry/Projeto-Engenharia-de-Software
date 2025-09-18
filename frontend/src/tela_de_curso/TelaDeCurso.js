import React, { useState } from 'react';
import { ReactComponent as ArchiveIcon } from '../icones/pasta.svg';
import { ReactComponent as UpdateIcon } from '../icones/jornal.svg';
import { ReactComponent as ChatIcon } from '../icones/mensagens.svg';
import { ReactComponent as VirtualClassIcon } from '../icones/quadro-negro.svg';
import { ReactComponent as UsersIcon } from '../icones/usuarios.svg';
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
    const menu_items = [
        'Arquivos',
        'Noticias', 
        'Chat Geral',
        'Sala Virtual',
        'Participantes'
    ];

    const renderIcon = ({ item }) => {
        console.log(item);
        switch(item) {
            case 'Arquivos':
                return <ArchiveIcon class='sidebar-icon'/>;
            case 'Noticias':
                return <UpdateIcon class='sidebar-icon'/>;
            case 'Chat Geral':
                return <ChatIcon class='sidebar-icon'/>;
            case 'Sala Virtual':
                return <VirtualClassIcon class='sidebar-icon'/>
            case 'Participantes':
                return <UsersIcon class='sidebar-icon'/>
            default:
                return <></>;
        }
    };
    
    return(
        <div class='sidebar'>
            <div class='sidebar-buttons'>
                {menu_items.map(item => (
                    <button 
                        key={item}
                        class={`sidebar-btn ${activePage === item ? 'active' : ''}`}
                        onClick={() => setActivePage(item)}
                    >
                        {renderIcon({item})}
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