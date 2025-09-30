import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePermissionContext } from '../context/PermissionContext.js';
import { ReactComponent as AddIcon } from '../icones/adicionar-documento.svg';
import { ReactComponent as RemoveFileIcon } from '../icones/excluir-documento.svg';
import { ReactComponent as EditIcon } from '../icones/editar.svg';
import { ReactComponent as AddFolderIcon } from '../icones/pasta.svg';
import { ReactComponent as RemoveFolderIcon } from '../icones/remover-pasta.svg';
import './Arquivos.css';
import '../api/requests.js';
import { get_content_groups, create_content_group, edit_content_group, delete_content_group } from '../api/requests.js';

function Archives() {
    const [groups, setGroups] = useState([]);
    const { id } = useParams();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [groupsToRemove, setGroupsToRemove] = useState([]);
    const [selectedForRemoval, setSelectedForRemoval] = useState([]);

    const { isUserMonitor } = usePermissionContext();

    useEffect(() => {
    const fetchGroups = async () => {
        try {
            const response = await get_content_groups(id);
            console.log(response);
            
            if(response) {
                setGroups(Array.isArray(response) ? response : []);
            } else {
                setGroups([]);
            }
        } catch (e) {
            console.error(e);
            setGroups([]);
        }
    };

    fetchGroups();
}, [id]);

    // Funções para criar grupo
    const handleCreateGroup = async (groupData) => {
        try{
            const result = await create_content_group(
                groupData.nome,
                groupData.descricao,
                id
            );

            if (result && result.modulo){
                const newGroup = {
                    id_modulo: result.modulo.id_modulo,
                    nome: groupData.nome,
                    descricao: groupData.descricao,
                    contents: []
                };

                setGroups(prev => Array.isArray(prev) ? [...prev, newGroup] : [newGroup]);
                setShowCreateModal(false);
                return;
            } 
                alert('Erro ao criar o grupo!');
        } catch (e) {
            console.error('Erro ao criar grupo: ', e);
        }
    };

    // Funções para editar grupo
    const handleEditGroup = (group) => {
        setEditingGroup(group);
        setShowEditModal(true);
    };

    const handleUpdateGroup = async (groupData) => {
        try {
            const result = await edit_content_group(
                editingGroup.id_modulo,
                groupData.nome,
                groupData.descricao
            );

            if (result && result.modulo) {
                setGroups(prev => prev.map(group => 
                    group.id_modulo === editingGroup.id_modulo 
                        ? { ...group, nome: groupData.nome, descricao: groupData.descricao }
                        : group
                ));
                setShowEditModal(false);
                setEditingGroup(null);
            } else {
                console.error('Erro ao atualizar o grupo: ', result);
            }
        } catch (e) {
            console.error('Erro ao atualizar grupo: ', e);
        }
    };

    // Funções para remover grupos
    const handleRemoveGroups = () => {
        setShowRemoveModal(true);
        setSelectedForRemoval([]);
    };

    const handleGroupRemovalSelection = (groupId, isChecked) => {
        if (isChecked) {
            setSelectedForRemoval(prev => [...prev, groupId]);
        } else {
            setSelectedForRemoval(prev => prev.filter(id => id !== groupId));
        }
    };

    const handleConfirmRemoveSelection = () => {
        if (selectedForRemoval.length === 0) return;
        
        const groupsToRemoveList = groups.filter(group => selectedForRemoval.includes(group.id_modulo));
        setGroupsToRemove(groupsToRemoveList);
        setShowRemoveModal(false);
        setShowRemoveConfirmation(true);
    };

    const handleConfirmRemove = async () => {
        try {
            const deletePromises = selectedForRemoval.map(groupId => delete_content_group(groupId));
            
            await Promise.all(deletePromises);
            
            setGroups(prev => prev.filter(group => !selectedForRemoval.includes(group.id_modulo)));
            setShowRemoveConfirmation(false);
            setGroupsToRemove([]);
            setSelectedForRemoval([]);
            
        } catch (e) {
            console.error('Erro ao remover grupos do banco:', e);
        }
    };

    const handleCancelRemoveSelection = () => {
        setShowRemoveModal(false);
        setSelectedForRemoval([]);
    };

    const handleCancelRemoveConfirmation = () => {
        setShowRemoveConfirmation(false);
        setGroupsToRemove([]);
        setSelectedForRemoval([]);
    };

    const renderGroupManagementControls = () => {
        if (isUserMonitor()) {
            return (
                <div className='group-management-controls'>
                    <button className='create-group-btn' onClick={() => setShowCreateModal(true)}>
                        <AddFolderIcon className='control-icon' />
                        Criar Grupo
                    </button>
                    <button className='remove-groups-btn' onClick={handleRemoveGroups}>
                        <RemoveFolderIcon className='control-icon' />
                        Remover Grupos
                    </button>
                </div>
            );
        }
        return null;
    };

    return (
        <div className='page'>
            {renderGroupManagementControls()}

            {groups.length > 0 ? groups.map(group => (
                <ContentGroup 
                    key={group.id_modulo || group.id} // Use id_modulo como fallback
                    group={group}
                    onEdit={handleEditGroup}
                />
            )) : (
                <div className="no-groups-message">
                    Nenhum grupo de conteúdo encontrado.
                </div>
            )}

            {/* Modal de Criação */}
            {showCreateModal && (
                <GroupModal
                    title="Criar Novo Grupo"
                    onSave={handleCreateGroup}
                    onCancel={() => setShowCreateModal(false)}
                />
            )}

            {/* Modal de Edição */}
            {showEditModal && editingGroup && (
                <GroupModal
                    title="Editar Grupo"
                    initialData={editingGroup}
                    onSave={handleUpdateGroup}
                    onCancel={() => {
                        setShowEditModal(false);
                        setEditingGroup(null);
                    }}
                />
            )}

            {/* Modal de Seleção para Remoção */}
            {showRemoveModal && (
                <div className='upload-overlay'>
                    <div className='upload-confirmation'>
                        <h3 className='confirmation-title'>Quais grupos deseja remover?</h3>
                        
                        <div className='file-list-confirmation'>
                            {groups.length > 0 ? groups.map((group) => (
                                <div key={group.id_modulo} className='file-item-with-checkbox'>
                                    <input 
                                        type="checkbox"
                                        className='file-checkbox'
                                        checked={selectedForRemoval.includes(group.id_modulo)}
                                        onChange={(e) => handleGroupRemovalSelection(group.id_modulo, e.target.checked)}
                                    />
                                    <div className='file-info'>
                                        <span className='file-name'>{group.nome}</span>
                                        <span className='file-size'>{group.contents.length} arquivo(s)</span>
                                    </div>
                                </div>
                            )) : 
                            (
                                <div className="no-groups-message">
                                    Nenhum grupo disponível para remoção.
                                </div>
                            )}
                        </div>

                        <div className='confirmation-buttons'>
                            <button className='cancel-btn' onClick={handleCancelRemoveSelection}>
                                Cancelar
                            </button>
                            <button 
                                className='confirm-btn' 
                                onClick={handleConfirmRemoveSelection}
                                disabled={selectedForRemoval.length === 0}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmação de Remoção */}
            {showRemoveConfirmation && (
                <div className='upload-overlay'>
                    <div className='upload-confirmation'>
                        <h3 className='confirmation-title'>Os seguintes grupos serão removidos:</h3>
                        
                        <div className='file-list-confirmation'>
                            {groupsToRemove.map((group) => (
                                <div key={group.id} className='file-item'>
                                    <div className='file-info'>
                                        <span className='file-name'>{group.nome}</span>
                                        <span className='file-size'>{group.contents.length} arquivo(s)</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className='remove-confirmation-footer'>
                            <p className='remove-question'>Deseja removê-los? Esta ação não pode ser desfeita.</p>
                            <div className='confirmation-buttons'>
                                <button className='cancel-btn' onClick={handleCancelRemoveConfirmation}>
                                    Não
                                </button>
                                <button className='confirm-btn' onClick={handleConfirmRemove}>
                                    Sim
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ContentGroup({ group, onEdit }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    
    // Estados para remoção de arquivos
    const [showRemoveSelection, setShowRemoveSelection] = useState(false);
    const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
    const [filesToRemove, setFilesToRemove] = useState([]);
    const [selectedForRemoval, setSelectedForRemoval] = useState([]);
    
    const { isUserMonitor } = usePermissionContext();
    const fileInputRef = useRef(null);

    // Converte um número de bytes em uma string com o formato legivel
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Abre o seletor de arquivos
    const handleAddFiles = () => {
        fileInputRef.current.click();
    };

    // Gera a lista de arquivos selecionados e depois abre a tela de confirmação de envio
    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        const fileList = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: formatFileSize(file.size),
            file: file
        }));
        setSelectedFiles(fileList);
        setShowConfirmation(true);
    };

    // Remove um arquivo selecionado para envio
    const removeFileFromList = (fileId) => {
        setSelectedFiles(prev => prev.filter(file => file.id !== fileId));
    };

    // Fecha a tela de confirmação
    const handleCancelUpload = () => {
        setShowConfirmation(false);
        setSelectedFiles([]);
        fileInputRef.current.value = '';
    };

    // Realiza o upload do arquivo na database
    const handleConfirmUpload = () => {
        // Aqui você implementaria a lógica de upload
        console.log('Enviando arquivos para o grupo:', group.id_modulo, selectedFiles);
        handleCancelUpload();
    };

    // Funções para remoção de arquivos
    const handleRemoveFiles = () => {
        setShowRemoveSelection(true);
        setSelectedForRemoval([]);
    };

    const handleCheckboxChange = (contentId, isChecked) => {
        if (isChecked) {
            setSelectedForRemoval(prev => [...prev, contentId]);
        } else {
            setSelectedForRemoval(prev => prev.filter(id => id !== contentId));
        }
    };


    const handleCancelRemoveSelection = () => {
        setShowRemoveSelection(false);
        setSelectedForRemoval([]);
    };

    const handleConfirmRemoveSelection = () => {
        if (selectedForRemoval.length === 0) return;
        
        const filesToRemoveList = group.contents.filter(content => 
            selectedForRemoval.includes(content.id)
        );
        setFilesToRemove(filesToRemoveList);
        setShowRemoveSelection(false);
        setShowRemoveConfirmation(true);
    };

    const handleCancelRemoveConfirmation = () => {
        setShowRemoveConfirmation(false);
        setFilesToRemove([]);
        setSelectedForRemoval([]);
    };

    const handleConfirmRemove = () => {
        // Aqui você implementaria a lógica de remoção dos arquivos
        console.log('Removendo arquivos do grupo:', group.id_modulo, filesToRemove);
        handleCancelRemoveConfirmation();
    };

    const renderListConfig = () => {
        if (isUserMonitor()) {
            return (
                <div className='content-list-config'>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        multiple
                        style={{ display: 'none' }}
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                    />
                    <button className='add-btn' onClick={handleAddFiles}>
                        <AddIcon className='add-icon'/>
                    </button>
                    <button className='remove-btn' onClick={handleRemoveFiles}>
                        <RemoveFileIcon className='remove-icon'/>
                    </button>
                </div>
            );
        }
        return null;
    };

    const renderGroupControls = () => {
        if (isUserMonitor()) {
            return (
                <button className='edit-group-btn' onClick={() => onEdit(group)}>
                    <EditIcon className='edit-icon' />
                </button>
            );
        }
        return null;
    };

    return (
        <>
            <div className='content-group'>
                <div className='content-header'>
                    <div className='content-group-info'>
                        <h3 className='content-group-title'>{group.nome}</h3>
                        <div className='header-controls'>
                            {renderGroupControls()}
                            <button className='expand-btn' onClick={() => setIsExpanded(!isExpanded)}>
                                {isExpanded ? '▼' : '▶'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className={`content-group-body ${isExpanded ? 'open' : ''}`}>
                    <div className='content-description'>
                        <p>{group.descricao}</p>
                    </div>

                    {/* TODO: TALVEZ MUDAR O CONTENT.ID DAQUI */}
                    <div className='content-list'>
                        {group.contents && group.contents.length > 0 ? group.contents.map((content, index) => (
                            <div key={content.id} className='content-card'>
                                <div className='content-icon'>
                                    📄
                                </div>
                                <div className='content-info'>
                                    <h4>{content.name}</h4>
                                    <span className='content-meta'>{content.size}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="no-contents-message">
                                Nenhum arquivo neste grupo.
                            </div>
                        )}
                    </div>

                    {renderListConfig()}
                </div>
            </div>

            {/* Overlay de Confirmação de Upload */}
            {showConfirmation && (
                <div className='upload-overlay'>
                    <div className='upload-confirmation'>
                        <h3 className='confirmation-title'>Deseja enviar os seguintes arquivos?</h3>
                        
                        <div className='file-list-confirmation'>
                            {selectedFiles.map((file) => (
                                <div key={file.id} className='file-item'>
                                    <div className='file-info'>
                                        <span className='file-name'>{file.name}</span>
                                        <span className='file-size'>{file.size}</span>
                                    </div>
                                    <button 
                                        className='remove-file-btn'
                                        onClick={() => removeFileFromList(file.id)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className='confirmation-buttons'>
                            <button className='cancel-btn' onClick={handleCancelUpload}>
                                Não
                            </button>
                            <button 
                                className='confirm-btn' 
                                onClick={handleConfirmUpload}
                                disabled={selectedFiles.length === 0}
                            >
                                Sim
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Overlay de Seleção para Remoção */}
            {showRemoveSelection && (
                <div className='upload-overlay'>
                    <div className='upload-confirmation'>
                        <h3 className='confirmation-title'>Quais arquivos deseja remover?</h3>
                        
                        <div className='file-list-confirmation'>
                            {group.contents && group.contents.length > 0 ? group.contents.map((content) => (
                                <div key={content.id} className='file-item-with-checkbox'>
                                    <input 
                                        type="checkbox"
                                        className='file-checkbox'
                                        checked={selectedForRemoval.includes(content.id)}
                                        onChange={(e) => handleCheckboxChange(content.id, e.target.checked)}
                                    />
                                    <div className='file-info'>
                                        <span className='file-name'>{content.name}</span>
                                        <span className='file-size'>{content.size}</span>
                                    </div>
                                </div>
                            )) : 
                            (
                                <div className="no-contents-message">
                                    Nenhum arquivo para remover.
                                </div>
                            )}
                        </div>

                        <div className='confirmation-buttons'>
                            <button className='cancel-btn' onClick={handleCancelRemoveSelection}>
                                Sair
                            </button>
                            <button 
                                className='confirm-btn' 
                                onClick={handleConfirmRemoveSelection}
                                disabled={selectedForRemoval.length === 0}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Overlay de Confirmação de Remoção */}
            {showRemoveConfirmation && (
                <div className='upload-overlay'>
                    <div className='upload-confirmation'>
                        <h3 className='confirmation-title'>Os seguintes arquivos serão removidos:</h3>
                        
                        <div className='file-list-confirmation'>
                            {filesToRemove.map((file, index) => (
                                <div key={index} className='file-item'>
                                    <div className='file-info'>
                                        <span className='file-name'>{file.name}</span>
                                        <span className='file-size'>{file.size}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className='remove-confirmation-footer'>
                            <p className='remove-question'>Deseja removê-los?</p>
                            <div className='confirmation-buttons'>
                                <button className='cancel-btn' onClick={handleCancelRemoveConfirmation}>
                                    Não
                                </button>
                                <button className='confirm-btn' onClick={handleConfirmRemove}>
                                    Sim
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Componente Modal para criar/editar grupos
function GroupModal({ title, initialData = null, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        nome: initialData?.nome || '',
        descricao: initialData?.descricao || ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Limpa o erro do campo quando o usuário começa a digitar
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.nome.trim()) {
            newErrors.nome = 'Nome do grupo é obrigatório';
        }
        
        if (!formData.descricao.trim()) {
            newErrors.descricao = 'Descrição é obrigatória';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSave(formData);
        }
    };

    return (
        <div className='upload-overlay'>
            <div className='upload-confirmation group-modal'>
                <h3 className='confirmation-title'>{title}</h3>
                
                <form onSubmit={handleSubmit} className='group-form'>
                    <div className='form-field'>
                        <label className='form-label'>Nome do Grupo:</label>
                        <input
                            type='text'
                            className={`form-input ${errors.nome ? 'error' : ''}`}
                            value={formData.nome}
                            onChange={(e) => handleChange('nome', e.target.value)}
                            placeholder='Digite o nome do grupo'
                        />
                        {errors.nome && <span className='error-message'>{errors.nome}</span>}
                    </div>

                    <div className='form-field'>
                        <label className='form-label'>Descrição:</label>
                        <textarea
                            className={`form-textarea ${errors.descricao ? 'error' : ''}`}
                            value={formData.descricao}
                            onChange={(e) => handleChange('descricao', e.target.value)}
                            placeholder='Digite a descrição do grupo'
                            rows={4}
                        />
                        {errors.descricao && <span className='error-message'>{errors.descricao}</span>}
                    </div>

                    <div className='confirmation-buttons'>
                        <button type='button' className='cancel-btn' onClick={onCancel}>
                            Cancelar
                        </button>
                        <button type='submit' className='confirm-btn'>
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Archives;