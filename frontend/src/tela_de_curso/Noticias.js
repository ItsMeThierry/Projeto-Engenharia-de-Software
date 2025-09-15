import './Noticias.css'

function Updates() {
    return (
        <div class='page'>
            <div class='page-top'>
                <div class='recent-update'>
                    <div class='title'><h1>Titulo</h1></div>
                    <div class='text'><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p></div>
                    <div class='info'>
                        <h4 class='owner'>Pessoa</h4>
                        <span class='date'>25/12/1987</span>
                    </div>
                </div>                
            </div>
            <div class='page-bottom'>
                <Update title='Fim do mundo' text='galera acabou a cadeira vamo fechar tudo' owner='ELE' date='20-01-2004'/>
                <Update title='Fim do mundo' text='galera acabou a cadeira vamo fechar tudo' owner='ELE' date='20-01-2004'/>
                <Update title='Fim do mundo' text='galera acabou a cadeira vamo fechar tudo' owner='ELE' date='20-01-2004'/>
                <Update title='Fim do mundo' text='galera acabou a cadeira vamo fechar tudo' owner='ELE' date='20-01-2004'/>
                <Update title='Fim do mundo' text='galera acabou a cadeira vamo fechar tudo' owner='ELE' date='20-01-2004'/>
                <Update title='Fim do mundo' text='galera acabou a cadeira vamo fechar tudo' owner='ELE' date='20-01-2004'/>  
            </div>
        </div>
    );
}

function Update({title, text, owner, date}) {
    return (
        <div class='update'>
            <div class='update-info'>
                <h1 class='update-title'>{title}</h1>
            </div>
            <div class='update-text'><p>{text}</p></div>
            <div class='update-info'>
                <div class='update-owner'><h4>{owner}</h4></div>
                <div class='update-date'><span>{date}</span></div>
            </div>
        </div>
    );
}

export default Updates;