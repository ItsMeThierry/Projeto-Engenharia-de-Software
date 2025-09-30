import React, { useState } from 'react';
import { User, Settings, Bell } from 'lucide-react';
import './TelaPerfil.css';

const TelaPerfil = ({ user, setUser }) => {
    const [activeTab, setActiveTab] = useState('personal');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUser(prev => ({ ...prev, avatar: event.target.result }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'personal':
                return (
                    <div className="profile-form">
                        <h3>Informações Pessoais</h3>
                        <div className="avatar-section">
                            {user.avatar ? (
                                <img src={user.avatar} alt="Avatar" className="avatar-preview" />
                            ) : (
                                <div className="avatar-preview avatar-fallback">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <input
                                type="file"
                                id="avatarUpload"
                                onChange={handleAvatarChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="avatarUpload" className="upload-btn">
                                Trocar Foto
                            </label>
                        </div>
                        <div className="form-group">
                            <label htmlFor="name">Nome Completo</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={user.name}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={user.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <button className="save-btn">Salvar Alterações</button>
                    </div>
                );
            case 'account':
                return (
                    <div className="profile-form">
                        <h3>Configurações da Conta</h3>
                        <div className="form-group">
                            <label htmlFor="password">Nova Senha</label>
                            <input type="password" id="password" placeholder="********" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
                            <input type="password" id="confirmPassword" placeholder="********" />
                        </div>
                        <button className="save-btn">Atualizar Senha</button>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="profile-form">
                        <h3>Preferências de Notificação</h3>
                        <div className="notification-option">
                            <label>
                                <input type="checkbox" defaultChecked />
                                Notificações por e-mail sobre novas monitorias.
                            </label>
                        </div>
                        <div className="notification-option">
                            <label>
                                <input type="checkbox" defaultChecked />
                                Avisos sobre materiais de apoio adicionados.
                            </label>
                        </div>
                        <div className="notification-option">
                            <label>
                                <input type="checkbox" />
                                Resumo semanal de atividades.
                            </label>
                        </div>
                        <button className="save-btn">Salvar Preferências</button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="profile-container">
            <aside className="profile-sidebar">
                <h2>Configurações</h2>
                <nav className="profile-nav">
                    <a
                        href="#"
                        className={activeTab === 'personal' ? 'active' : ''}
                        onClick={() => setActiveTab('personal')}
                    >
                        <User size={18} />
                        <span>Informações Pessoais</span>
                    </a>
                    <a
                        href="#"
                        className={activeTab === 'account' ? 'active' : ''}
                        onClick={() => setActiveTab('account')}
                    >
                        <Settings size={18} />
                        <span>Conta</span>
                    </a>
                    <a
                        href="#"
                        className={activeTab === 'notifications' ? 'active' : ''}
                        onClick={() => setActiveTab('notifications')}
                    >
                        <Bell size={18} />
                        <span>Notificações</span>
                    </a>
                </nav>
            </aside>
            <main className="profile-content">{renderContent()}</main>
        </div>
    );
};

export default TelaPerfil;