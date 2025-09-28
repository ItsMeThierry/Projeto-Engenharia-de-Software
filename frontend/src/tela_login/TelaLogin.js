import React, { useState } from 'react';
import './TelaLogin.css'

const TelaLogin = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [showCadastro, setShowCadastro] = useState(false);
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  
  // Estados para o formulário de cadastro
  const [nomeCadastro, setNomeCadastro] = useState('');
  const [emailCadastro, setEmailCadastro] = useState('');

  const handleEntrar = () => {
    console.log('Login:', { nome, email });
  };

  const handleCadastrar = () => {
    setShowCadastro(true);
  };

  const handleCloseCadastro = () => {
    setShowCadastro(false);
    // Limpar os campos do cadastro quando fechar
    setNomeCadastro('');
    setEmailCadastro('');
  };

  const handleCadastroSubmit = () => {
    // Aqui será implementada a lógica com database
    console.log('Cadastro:', { nomeCadastro, emailCadastro });
    
    // Fechar tela de cadastro e mostrar confirmação
    setShowCadastro(false);
    setShowConfirmacao(true);
    
    // Limpar campos após cadastro
    setNomeCadastro('');
    setEmailCadastro('');
  };

  const handleCancelarCadastro = () => {
    setShowCadastro(false);
    setNomeCadastro('');
    setEmailCadastro('');
  };

  const handleCloseConfirmacao = () => {
    setShowConfirmacao(false);
  };

  return (
    <>
      <div className="login-container">
        <div className="login-form">
          {/* Placeholder para logo */}
          <div className="logo-placeholder">
            <div className="logo-box">
              LOGO
            </div>
          </div>

          {/* Inputs */}
          <div className="inputs-container">
            <input
              type="text"
              placeholder="Digite seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="input-field"
            />
            <input
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Botões */}
          <div className="buttons-container">
            <button 
              onClick={handleEntrar}
              className="btn-entrar"
            >
              Entrar
            </button>
            <button 
              onClick={handleCadastrar}
              className="btn-cadastrar"
            >
              Cadastrar
            </button>
          </div>
        </div>
      </div>

      {/* Overlay de cadastro */}
      {showCadastro && (
        <div className="overlay">
          <div className="overlay-content">
            <button 
              className="close-btn"
              onClick={handleCloseCadastro}
            >
              ×
            </button>
            <div className="cadastro-form">
              <h2>Criar Conta</h2>
              <p>Preencha os dados abaixo para se cadastrar</p>
              
              <div className="inputs-container">
                <input
                  type="text"
                  placeholder="Digite seu nome"
                  value={nomeCadastro}
                  onChange={(e) => setNomeCadastro(e.target.value)}
                  className="input-field"
                />
                <input
                  type="email"
                  placeholder="Digite seu email"
                  value={emailCadastro}
                  onChange={(e) => setEmailCadastro(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="buttons-container-cadastro">
                <button 
                  onClick={handleCadastroSubmit}
                  className="btn-cadastrar-submit"
                  disabled={!nomeCadastro || !emailCadastro}
                >
                  Cadastrar
                </button>
                <button 
                  onClick={handleCancelarCadastro}
                  className="btn-cancelar"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tela de confirmação */}
      {showConfirmacao && (
        <div className="overlay">
          <div className="overlay-content">
            <button 
              className="close-btn"
              onClick={handleCloseConfirmacao}
            >
              ×
            </button>
            <div className="confirmacao-content">
              <div className="icon-success">✓</div>
              <h2>Cadastro Realizado!</h2>
              <p>Usuário cadastrado com sucesso. Agora você já pode fazer login.</p>
              <button 
                onClick={handleCloseConfirmacao}
                className="btn-ok"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TelaLogin;