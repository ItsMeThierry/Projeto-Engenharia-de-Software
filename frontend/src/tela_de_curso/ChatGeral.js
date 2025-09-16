import './ChatGeral.css'

function Chat() {
    return(
        <div class='page'>
            <div class='chat'>
                <div class='chat-body'>
                    <Message username='Usuário' date='xx/xx/xxxx' text='TESTE'/>
                    <Message username='Usuário' date='xx/xx/xxxx' text='TESTE'/>
                    <Message username='Usuário' date='xx/xx/xxxx' text='TESTE'/>
                    <Message username='Usuário' date='xx/xx/xxxx' text='TESTE'/>
                    <SenderMessage username='Usuário' date='xx/xx/xxxx' text='OLA'/>
                    <Message username='Usuário' date='xx/xx/xxxx' text='TA TUDO BEM NAOLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'/>
                </div>
                <div class='chat-buttons'>
                    <input type='text'/>
                    <button class='send-btn'>+</button>
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