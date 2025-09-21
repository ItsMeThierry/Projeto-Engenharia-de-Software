import React, { useState } from 'react';
import { ReactComponent as ArchiveIcon } from '../icones/pasta.svg';
import { ReactComponent as UpdateIcon } from '../icones/jornal.svg';
import { ReactComponent as ChatIcon } from '../icones/mensagens.svg';
import { ReactComponent as VirtualClassIcon } from '../icones/quadro-negro.svg';
import { ReactComponent as UsersIcon } from '../icones/usuarios-alt.svg';
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
        'Chat Geral',
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
            case 'Informações':
                return <Info/>
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

function Info() {
    return (
        <div class='page'>
            <h1 class='course-name'>NOME DO CURSO</h1>
            <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</span>
        </div>
    );
}

export default TelaDeCurso;