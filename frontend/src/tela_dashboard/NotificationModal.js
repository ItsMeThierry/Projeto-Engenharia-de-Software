import React, { useState } from 'react';
import { X, Clock, Bell } from 'lucide-react';
import './NotificationModal.css';

const NotificationModal = ({ isOpen, onClose, disciplines }) => {
    // Estado para controlar se há notificações (mude para true para testar com notificações)
    const [hasNotifications] = useState(false);

    if (!isOpen) return null;

    // Simulando notificações baseadas nas disciplinas (só mostra se hasNotifications for true)
    const notifications = hasNotifications ? [
        {
            id: 1,
            disciplineName: disciplines.find(d => d.id === 1)?.name || "Algoritmos e Estruturas de Dados",
            message: "Nova monitoria disponível",
            time: "2 min atrás",
            isNew: true
        },
        {
            id: 2,
            disciplineName: disciplines.find(d => d.id === 2)?.name || "Engenharia de Software",
            message: "Material de apoio adicionado",
            time: "15 min atrás",
            isNew: true
        },
        {
            id: 3,
            disciplineName: disciplines.find(d => d.id === 3)?.name || "Sistemas Distribuídos",
            message: "Horário de atendimento alterado",
            time: "1 hora atrás",
            isNew: false
        },
        {
            id: 4,
            disciplineName: disciplines.find(d => d.id === 4)?.name || "Circuitos Lógicos",
            message: "Dúvida respondida no fórum",
            time: "2 horas atrás",
            isNew: false
        },
        {
            id: 5,
            disciplineName: disciplines.find(d => d.id === 5)?.name || "Mecânica dos fluidos",
            message: "Novo exercício disponível",
            time: "1 dia atrás",
            isNew: false
        }
    ] : [];

    return (
        <div className="notification-modal-overlay" onClick={onClose}>
            <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
                <div className="notification-header">
                    <h3>Notificações</h3>
                    <button className="close-button" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="notification-list">
                    {notifications.length === 0 ? (
                        <div className="no-notifications">
                            <div className="empty-icon">
                                <Bell size={48} />
                            </div>
                            <h4>Caixa de notificações vazia</h4>
                            <p>Você não tem nenhuma notificação no momento.</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`notification-item ${notification.isNew ? 'new' : ''}`}
                            >
                                <div className="notification-content">
                                    <div className="discipline-name">
                                        {notification.disciplineName}
                                    </div>
                                    <div className="notification-message">
                                        {notification.message}
                                    </div>
                                    <div className="notification-time">
                                        <Clock size={14} />
                                        {notification.time}
                                    </div>
                                </div>
                                {notification.isNew && <div className="new-indicator"></div>}
                            </div>
                        ))
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="notification-footer">
                        <button className="mark-all-read">
                            Marcar todas como lidas
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationModal;