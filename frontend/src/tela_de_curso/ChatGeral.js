import React, { useState, useEffect } from 'react';
import io from 'socket.io-client'
import './ChatGeral.css'

function Chat() {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMesssage, setNewMessage] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('recieve_message', (data) => {
            setMessages(prev => [...prev, data]);
        });

        return () => newSocket.disconnect();
    }, []);

    const sendMessage = () => {
        if(socket) {
            const message_data = {
                username: 'Nome',
                text: newMesssage,
                date: new Date().toLocaleString('pt-BR')
            }

            socket.emit('send_message', message_data);
            setNewMessage("");
        }
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
                        <OnlineUser name='João Silva'/>
                        <OnlineUser name='Maria Santos'/>
                        <OnlineUser name='Pedro Costa'/>
                        <OnlineUser name='Ana Oliveira'/>
                        <OnlineUser name='Carlos Lima'/>
                        <OnlineUser name='Julia Ferreira'/>
                        <OnlineUser name='Roberto Alves'/>
                        <OnlineUser name='Fernanda Rocha'/>
                        <OnlineUser name='Gabriel Souza'/>
                        <OnlineUser name='Beatriz Cunha'/>
                        <OnlineUser name='Lucas Martins'/>
                        <OnlineUser name='Camila Dias'/>
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
                        {messages.map((msg, index) => (
                            <Message key={index} username={msg.username} date={msg.date} text={msg.text}/>
                        ))}
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