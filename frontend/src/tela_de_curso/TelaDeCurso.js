import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
    const { id } = useParams();
    const { getUserData } = usePermissionContext();

    const userData = getUserData();

    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        const room_data = {
            room_id: parseInt(id),
            username: userData.nome
        }

        newSocket.emit('joined_room', room_data);

        newSocket.on('update_rooms', (data) => {
            setOnlineUsers(data);
        });
    
        newSocket.on('recieve_message', (data) => {
            setMessages(prev => [...prev, data]);
        });
    
        return () => {
            newSocket.disconnect();
        };
    }, [id]);

    return(
        <div className='main-layout'>
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
        switch(item) {
            case 'Arquivos':
                return <ArchiveIcon className='sidebar-icon'/>;
            case 'Noticias':
                return <UpdateIcon className='sidebar-icon'/>;
            case 'Chat Geral':
                return <ChatIcon className='sidebar-icon'/>;
            case 'Sala Virtual':
                return <VirtualClassIcon className='sidebar-icon'/>
            case 'Participantes':
                return <UsersIcon className='sidebar-icon'/>
            default:
                return <></>;
        }
    };
    
    return(
        <div className='sidebar'>
            <div className='sidebar-buttons'>
                {menu_items.map(item => (
                    <button 
                        key={item}
                        className={`sidebar-btn ${activePage === item ? 'active' : ''}`}
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
        <div className='course-content'>
            <div className='page-title'><h1>{activePage}</h1></div>
            {renderContent()}
        </div>
    );
}

function Info() {
    return (
        <div className='page'>
            <h1 className='course-name'>NOME DO CURSO</h1>
            <span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</span>
        </div>
    );
}

export default TelaDeCurso;