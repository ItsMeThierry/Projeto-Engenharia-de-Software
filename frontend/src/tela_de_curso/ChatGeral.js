import React, { useState, useEffect} from 'react';
import io from 'socket.io-client'
import './ChatGeral.css'

function Chat() {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMesssage, setNewMessage] = useState("");

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

    return(
        <div class='page'>
            <div class='chat'>
                <div class='chat-body'>
                    {messages.map((msg, index) => (
                        <Message key={index} username={msg.username} date={msg.date} text={msg.text}/>
                    ))}
                </div>
                <div class='chat-buttons'>
                    <input type='text' value={newMesssage} onChange={(e) => {setNewMessage(e.target.value)}} placeholder="Digite sua mensagem..."/>
                    <button class='send-btn' onClick={sendMessage}>+</button>
                </div>
            </div>
        </div>
    );
}

function SenderMessage({ username, date, text }) {
    return(
        <div class='sender-message'>
            <div class='info'>
                <h4 class='date'>{date}</h4>
                <h1 class='user-name'>{username}</h1>
                <div class='avatar'>👤</div>
            </div>
            <p class='text'>{text}</p>
        </div>
    );
}

function Message({ username, date, text }) {
    return(
        <div class='message'>
            <div class='info'>
                <div class='avatar'>👤</div>
                <h1 class='user-name'>{username}</h1>
                <h4 class='date'>{date}</h4>
            </div>
            <p class='text'>{text}</p>
        </div>
    );
}

export default Chat;