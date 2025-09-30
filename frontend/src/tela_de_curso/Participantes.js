import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePermissionContext } from '../context/PermissionContext';
import './Participantes.css';

function UsersList() {
    const { id: courseId } = useParams(); // ID do curso vindo da URL
    const { user_type, user_id } = usePermissionContext();
    
    // Estados para lista de participantes
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Estados para adicionar participante
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchEmail, setSearchEmail] = useState('');
    const [foundUser, setFoundUser] = useState(null);
    const [showAddConfirmation, setShowAddConfirmation] = useState(false);
    const [addError, setAddError] = useState('');
    
    // Estados para remover participantes
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [selectedForRemoval, setSelectedForRemoval] = useState([]);
    const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
    const [usersToRemove, setUsersToRemove] = useState([]);

    // Carregar participantes do curso
    useEffect(() => {
        fetchParticipants();
    }, [courseId]);

    const fetchParticipants = async () => {
        try {
            setLoading(true);
            // TODO: Substituir por chamada real à API
            const response = await fetch(`/api/usuarios-em-curso?curso_id=${courseId}`);
            const data = await response.json();
            
            // Filtrar apenas os participantes deste curso
            const courseParticipants = data.filter(item => item.curso_id === parseInt(courseId));
            
            setParticipants(courseParticipants);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao buscar participantes:', error);
            setLoading(false);
            // Dados mockados para desenvolvimento
            setParticipants([
                { 
                    id: 1, 
                    usuario_id: 1, 
                    usuario_nome: 'João Silva', 
                    usuario_email: 'joao@email.com',
                    cargo: 'monitor'
                },
                { 
                    id: 2, 
                    usuario_id: 2, 
                    usuario_nome: 'Maria Santos', 
                    usuario_email: 'maria@email.com',
                    cargo: 'aluno'
                },
                { 
                    id: 3, 
                    usuario_id: 3, 
                    usuario_nome: 'Pedro Costa', 
                    usuario_email: 'pedro@email.com',
                    cargo: 'aluno'
                }
            ]);
        }
    };

    // ========== FUNÇÕES DE ADICIONAR PARTICIPANTE ==========
    
    const handleSearchUser = async () => {
        setAddError('');
        setFoundUser(null);
        
        if (!searchEmail.trim()) {
            setAddError('Digite um e-mail para buscar');
            return;
        }

        try {
            // TODO: Substituir por chamada real à API
            const response = await fetch(`/api/usuarios?email=${searchEmail}`);
            const users = await response.json();
            
            if (users.length === 0) {
                setAddError('Usuário não encontrado no sistema');
                return;
            }

            const user = users[0];
            
            // Verificar se já está no curso
            const alreadyInCourse = participants.some(p => p.usuario_id === user.id);
            if (alreadyInCourse) {
                setAddError('Este usuário já está matriculado no curso');
                return;
            }

            setFoundUser(user);
            setShowAddConfirmation(true);
            
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            setAddError('Erro ao buscar usuário. Tente novamente.');
        }
    };

    const handleConfirmAdd = async () => {
        try {
            // TODO: Implementar chamada real à API
            const response = await fetch('/api/usuarios-em-curso', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_id: foundUser.id,
                    curso_id: parseInt(courseId)
                })
            });

            if (response.ok) {
                // Adicionar à lista local
                const newParticipant = {
                    id: Date.now(),
                    usuario_id: foundUser.id,
                    usuario_nome: foundUser.nome,
                    usuario_email: foundUser.email,
                    cargo: foundUser.cargo
                };
                
                setParticipants(prev => [...prev, newParticipant]);
                handleCancelAdd();
                
                console.log('Usuário adicionado ao curso:', newParticipant);
            } else {
                setAddError('Erro ao adicionar usuário ao curso');
            }
        } catch (error) {
            console.error('Erro ao adicionar participante:', error);
            setAddError('Erro ao adicionar usuário. Tente novamente.');
        }
    };

    const handleCancelAdd = () => {
        setShowAddModal(false);
        setShowAddConfirmation(false);
        setSearchEmail('');
        setFoundUser(null);
        setAddError('');
    };

    // ========== FUNÇÕES DE REMOVER PARTICIPANTES ==========

    const handleRemoveParticipants = () => {
        setShowRemoveModal(true);
        setSelectedForRemoval([]);
    };

    const handleRemovalSelection = (participantId, isChecked) => {
        if (isChecked) {
            setSelectedForRemoval(prev => [...prev, participantId]);
        } else {
            setSelectedForRemoval(prev => prev.filter(id => id !== participantId));
        }
    };

    const handleConfirmRemovalSelection = () => {
        if (selectedForRemoval.length === 0) return;
        
        const usersToRemoveList = participants.filter(p => 
            selectedForRemoval.includes(p.id)
        );
        setUsersToRemove(usersToRemoveList);
        setShowRemoveModal(false);
        setShowRemoveConfirmation(true);
    };

    const handleConfirmRemove = async () => {
        try {
            // TODO: Implementar chamada real à API para remover múltiplos
            const response = await fetch('/api/usuarios-em-curso/bulk-delete', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedForRemoval })
            });

            if (response.ok) {
                // Remover da lista local
                setParticipants(prev => 
                    prev.filter(p => !selectedForRemoval.includes(p.id))
                );
                handleCancelRemove();
                
                console.log('Usuários removidos do curso:', selectedForRemoval);
            }
        } catch (error) {
            console.error('Erro ao remover participantes:', error);
        }
    };

    const handleCancelRemove = () => {
        setShowRemoveModal(false);
        setShowRemoveConfirmation(false);
        setSelectedForRemoval([]);
        setUsersToRemove([]);
    };

    // ========== RENDERIZAÇÃO ==========

    const renderManagementControls = () => {
        if (user_type === 'monitor') {
            return (
                <div className='participants-management'>
                    <button 
                        className='add-participant-btn'
                        onClick={() => setShowAddModal(true)}
                    >
                        ➕ Adicionar Participante
                    </button>
                    <button 
                        className='remove-participants-btn'
                        onClick={handleRemoveParticipants}
                        disabled={participants.length === 0}
                    >
                        ➖ Remover Participantes
                    </button>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className='page'>
                <div className='loading-container'>
                    <p>Carregando participantes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='page'>
            {renderManagementControls()}

            <div className='participants-list'>
                {participants.length === 0 ? (
                    <div className='empty-state'>
                        <p>Nenhum participante cadastrado neste curso.</p>
                    </div>
                ) : (
                    participants.map(participant => (
                        <ParticipantCard 
                            key={participant.id} 
                            participant={participant} 
                        />
                    ))
                )}
            </div>

            {/* Modal de Adicionar Participante */}
            {showAddModal && !showAddConfirmation && (
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <h3 className='modal-title'>Adicionar Participante</h3>
                        
                        <div className='search-section'>
                            <label className='form-label'>E-mail do Usuário:</label>
                            <input
                                type='email'
                                className='form-input'
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                placeholder='Digite o e-mail do usuário'
                                onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
                            />
                            {addError && (
                                <p className='error-message'>{addError}</p>
                            )}
                        </div>

                        <div className='modal-buttons'>
                            <button className='cancel-btn' onClick={handleCancelAdd}>
                                Cancelar
                            </button>
                            <button className='confirm-btn' onClick={handleSearchUser}>
                                Buscar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmação de Adicionar */}
            {showAddConfirmation && foundUser && (
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <h3 className='modal-title'>Confirmar Adição</h3>
                        
                        <div className='user-info-preview'>
                            <p><strong>Nome:</strong> {foundUser.nome}</p>
                            <p><strong>E-mail:</strong> {foundUser.email}</p>
                            <p><strong>Cargo:</strong> {foundUser.cargo}</p>
                        </div>

                        <p className='confirmation-question'>
                            Deseja adicionar este usuário ao curso?
                        </p>

                        <div className='modal-buttons'>
                            <button className='cancel-btn' onClick={handleCancelAdd}>
                                Não
                            </button>
                            <button className='confirm-btn' onClick={handleConfirmAdd}>
                                Sim
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Seleção para Remover */}
            {showRemoveModal && (
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <h3 className='modal-title'>Selecionar Participantes para Remover</h3>
                        
                        <div className='selection-list'>
                            {participants.map(participant => (
                                <div key={participant.id} className='selection-item'>
                                    <input
                                        type='checkbox'
                                        className='selection-checkbox'
                                        checked={selectedForRemoval.includes(participant.id)}
                                        onChange={(e) => handleRemovalSelection(participant.id, e.target.checked)}
                                    />
                                    <div className='selection-info'>
                                        <span className='selection-name'>{participant.usuario_nome}</span>
                                        <span className='selection-email'>{participant.usuario_email}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className='modal-buttons'>
                            <button className='cancel-btn' onClick={handleCancelRemove}>
                                Cancelar
                            </button>
                            <button 
                                className='confirm-btn' 
                                onClick={handleConfirmRemovalSelection}
                                disabled={selectedForRemoval.length === 0}
                            >
                                Confirmar Seleção
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmação de Remover */}
            {showRemoveConfirmation && (
                <div className='modal-overlay'>
                    <div className='modal-content'>
                        <h3 className='modal-title'>Confirmar Remoção</h3>
                        
                        <div className='removal-list'>
                            <p className='removal-warning'>
                                Os seguintes participantes serão removidos do curso:
                            </p>
                            {usersToRemove.map(user => (
                                <div key={user.id} className='removal-item'>
                                    <span>{user.usuario_nome}</span>
                                    <span className='removal-email'>{user.usuario_email}</span>
                                </div>
                            ))}
                        </div>

                        <p className='confirmation-question'>
                            Deseja realmente removê-los?
                        </p>

                        <div className='modal-buttons'>
                            <button className='cancel-btn' onClick={handleCancelRemove}>
                                Não
                            </button>
                            <button className='confirm-btn danger' onClick={handleConfirmRemove}>
                                Sim, Remover
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ParticipantCard({ participant }) {
    return (
        <div className='participant-card'>
            <div className='participant-avatar'>
                {participant.usuario_nome.charAt(0).toUpperCase()}
            </div>
            <div className='participant-info'>
                <h3 className='participant-name'>{participant.usuario_nome}</h3>
                <p className='participant-email'>{participant.usuario_email}</p>
                <span className='participant-role'>{participant.cargo}</span>
            </div>
        </div>
    );
}

export default UsersList;