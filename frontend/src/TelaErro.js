import './TelaErro.css'

function TelaErro() {
    return(
        <div className='error-page'>
            <div className='error-card'>
                <h1>ERRO 404</h1>
                <span>A página que você tentou acessar não existe.</span>
            </div>
        </div>
    );
}

export default TelaErro;