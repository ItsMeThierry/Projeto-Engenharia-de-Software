import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { is_user_real, get_user, create_user } from '../api/requests.js';
import { usePermissionContext } from '../context/PermissionContext.js';
import logo from '../icones/logo.png';
import './TelaLogin.css'

const TelaLogin = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [showCadastro, setShowCadastro] = useState(false);
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [cadastroSucesso, setCadastroSucesso] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [nomeCadastro, setNomeCadastro] = useState('');
  const [emailCadastro, setEmailCadastro] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('aluno');

  const navigate = useNavigate();
  const { setUserData } = usePermissionContext();

  const handleEntrar = async () => {
    const result = await is_user_real(nome, email);

    if (result) {
      const user_data = await get_user(email);

      if (user_data) {
        setUserData({
          user_id: user_data.id,
          username: user_data.nome,
          user_type: user_data.cargo,
          user_email: user_data.email
        });
      }

      navigate('/');
      return;
    }
  };

  const handleCadastrar = () => {
    setShowCadastro(true);
  };

  const handleCloseCadastro = () => {
    setShowCadastro(false);
    setNomeCadastro('');
    setEmailCadastro('');
    setTipoUsuario('aluno');
  };

  const handleCadastroSubmit = async () => {
    console.log('Cadastro:', { nomeCadastro, emailCadastro, tipoUsuario });
    const result = await create_user(nomeCadastro, emailCadastro, tipoUsuario);
    console.log(result);
    
    // Verificar se o cadastro foi bem-sucedido
    if (result && result.id) {
      // Cadastro com sucesso
      setCadastroSucesso(true);
      setMensagemErro('');
    } else {
      // Cadastro com erro
      setCadastroSucesso(false);
      setMensagemErro(result?.message || 'Erro ao cadastrar usuário. Tente novamente.');
    }
    
    // Fechar tela de cadastro e mostrar confirmação
    setShowCadastro(false);
    setShowConfirmacao(true);
    
    // Limpar campos após cadastro
    setNomeCadastro('');
    setEmailCadastro('');
    setTipoUsuario('aluno');
  };

  const handleCancelarCadastro = () => {
    setShowCadastro(false);
    setNomeCadastro('');
    setEmailCadastro('');
    setTipoUsuario('aluno');
  };

  const handleCloseConfirmacao = () => {
    setShowConfirmacao(false);
    setCadastroSucesso(false);
    setMensagemErro('');
  };

  return (
    <>
      <div className="login-container">
        <div className="login-form">
          {/* Placeholder para logo */}
          <div className="logo-placeholder">
              <img 
                  src={logo} 
                  alt='logo'
                  style={{ width: '80px', height: '80px', objectFit: 'contain' }}
              />
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

              {/* Switch de Tipo de Usuário */}
              <div className="user-type-container">
                <label className="user-type-label">Tipo de Usuário</label>
                <div className="switch-container">
                  <button
                    type="button"
                    className={`switch-option ${tipoUsuario === 'aluno' ? 'active' : ''}`}
                    onClick={() => setTipoUsuario('aluno')}
                  >
                    Aluno
                  </button>
                  <button
                    type="button"
                    className={`switch-option ${tipoUsuario === 'monitor' ? 'active' : ''}`}
                    onClick={() => setTipoUsuario('monitor')}
                  >
                    Monitor
                  </button>
                </div>
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
              <div className={`icon-${cadastroSucesso ? 'success' : 'error'}`}>
                {cadastroSucesso ? '✓' : '✕'}
              </div>
              <h2>{cadastroSucesso ? 'Cadastro Realizado!' : 'Erro no Cadastro'}</h2>
              <p>
                {cadastroSucesso 
                  ? 'Usuário cadastrado com sucesso. Agora você já pode fazer login.'
                  : mensagemErro
                }
              </p>
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