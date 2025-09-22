import React, { useState } from 'react';
import { usePermissionContext } from '../context/PermissionContext';
import './ChatGeral.css'

function Chat({ socket, messages, onlineUsers }) {
    const [newMesssage, setNewMessage] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const { user_id } = usePermissionContext();

    const sendMessage = () => {
        if(socket) {
            const message_data = {
                user_id: user_id,
                username: 'Nome',
                text: newMesssage,
                date: new Date().toLocaleString('pt-BR')
            }

            socket.emit('send_message', message_data);
            setNewMessage("");
        }
    };

    const renderMessage = ({ index, msg }) => {
        if (msg.user_id !== user_id) {
            return (<Message key={index} username={msg.username} date={msg.date} text={msg.text}/>);
        }

        return (<SenderMessage key={index} username={msg.username} date={msg.date} text={msg.text}/>);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return(
        <div className='page'>
            <div className='chat-container'>
                <div className={`chat-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                    <h1>Participantes Online</h1>
                    <div className='chat-online-list'>
                        {onlineUsers.map((users, index) => (
                            <OnlineUser name='Nome'/>
                        ))}
                    </div>
                </div>

                <div className='chat'>
                    <div className='chat-header'>
                        <button 
                            className={`chat-online-btn ${isSidebarOpen ? 'active' : ''}`} 
                            onClick={toggleSidebar}
                        >
                            +
                        </button>
                        <h1>12 Pessoas Online</h1>
                    </div>
                    <div className='chat-body'>
                        {messages.map((msg, index) => 
                            renderMessage({ index, msg })
                        )}
                    </div>
                    <div className='chat-buttons'>
                        <input 
                            type='text' 
                            value={newMesssage} 
                            onChange={(e) => {setNewMessage(e.target.value)}} 
                            placeholder="Digite sua mensagem..."
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <button className='send-btn' onClick={sendMessage}>+</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function OnlineUser({ name }) {
    return(
        <div className='chat-user'>
            <span className='avatar'>👤</span>
            <span>{name}</span>
        </div>
    );
}

function SenderMessage({ username, date, text }) {
    return(
        <div className='sender-message'>
            <div className='info'>
                <h4 className='date'>{date}</h4>
                <h1 className='user-name'>{username}</h1>
                <div className='avatar'>👤</div>
            </div>
            <p className='text'>{text}</p>
        </div>
    );
}

function Message({ username, date, text }) {
    return(
        <div className='message'>
            <div className='info'>
                <div className='avatar'>👤</div>
                <h1 className='user-name'>{username}</h1>
                <h4 className='date'>{date}</h4>
            </div>
            <p className='text'>{text}</p>
        </div>
    );
}

export default Chat;