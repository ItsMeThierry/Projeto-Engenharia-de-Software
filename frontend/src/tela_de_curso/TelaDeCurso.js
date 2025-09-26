import React, { useState, useEffect } from 'react';
import { ReactComponent as ArchiveIcon } from '../icones/pasta.svg';
import { ReactComponent as UpdateIcon } from '../icones/jornal.svg';
import { ReactComponent as ChatIcon } from '../icones/mensagens.svg';
import { ReactComponent as VirtualClassIcon } from '../icones/quadro-negro.svg';
import { ReactComponent as UsersIcon } from '../icones/usuarios-alt.svg';
import { usePermissionContext } from '../context/PermissionContext';
import io from 'socket.io-client'
import './TelaDeCurso.css';
import Updates from './Noticias.js'
import Archives from './Arquivos.js';
import Chat from './ChatGeral.js';
import VirtualClassroom from './SalaVirtual.js';
import UsersList from './Participantes.js';

function TelaDeCurso() {
    const [activePage, setActivePage] = useState('Arquivos');
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);

    const { user_id } = usePermissionContext();

    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        const room_data = {
            room_id: 1,
            user_id: user_id
        }

        newSocket.emit('joined_room', room_data);

        newSocket.on('update_rooms', (data) => {
            setOnlineUsers(data);
        });
    
        newSocket.on('recieve_message', (data) => {
            setMessages(prev => [...prev, data]);
        });
    
        return () => {
            newSocket.emit('left_room', room_data);
            newSocket.disconnect();
        };
    }, [user_id]);

    return(
        <div class='main-layout'>
            <Sidebar activePage={activePage} setActivePage={setActivePage}/>
            <CourseContent activePage={activePage} socket={socket} messages={messages} onlineUsers={onlineUsers}/>
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

function CourseContent({ activePage, socket, messages, onlineUsers }) {
    const renderContent = () => {
        switch(activePage) {
            case 'Informações':
                return <Info/>
            case 'Arquivos':
                return <Archives/>;
            case 'Noticias':
                return <Updates/>;
            case 'Chat Geral':
                return <Chat socket={socket} messages={messages} onlineUsers={onlineUsers}/>
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