import React, { useState, useRef } from 'react';
import { usePermissionContext } from '../context/PermissionContext';
import { ReactComponent as AddIcon } from '../icones/adicionar-documento.svg';
import { ReactComponent as RemoveFileIcon } from '../icones/excluir-documento.svg';
import { ReactComponent as EditIcon } from '../icones/editar.svg'; // Assumindo que existe este ícone
import { ReactComponent as AddFolderIcon } from '../icones/pasta.svg';
import { ReactComponent as RemoveFolderIcon } from '../icones/remover-pasta.svg';
import './Arquivos.css';

function Archives() {
    const [groups, setGroups] = useState([
        {
            id: 1,
            title: 'Circuito RC',
            description: 'Nesse conteúdo vemos o circuito RC, suas fórmulas e utilidades como filtros',
            contents: [
                { id: 1, name: "Exercícios Práticos", type: "pdf", size: "3 MB" },
                { id: 2, name: "Exercícios Práticos", type: "pdf", size: "3 MB" },
                { id: 3, name: "Exercícios Práticos", type: "pdf", size: "3 MB" },
                { id: 4, name: "Exercícios Práticos", type: "pdf", size: "3 MB" },
                { id: 5, name: "Exercícios Práticos", type: "pdf", size: "3 MB" },
                { id: 6, name: "Exercícios Práticos", type: "pdf", size: "3 MB" },
                { id: 7, name: "Exercícios Práticos", type: "pdf", size: "3 MB" }
            ]
        },
        {
            id: 2,
            title: 'Leis de Kirchhoff',
            description: 'Estudo das leis fundamentais de circuitos elétricos',
            contents: [
                { id: 8, name: "Teoria Básica", type: "pdf", size: "2 MB" },
                { id: 9, name: "Exemplos Práticos", type: "pdf", size: "1.5 MB" }
            ]
        },
        {
            id: 3,
            title: 'Análise de Malhas',
            description: 'Métodos para análise de circuitos complexos usando malhas',
            contents: [
                { id: 10, name: "Material Teórico", type: "pdf", size: "4 MB" }
            ]
        }
    ]);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [groupsToRemove, setGroupsToRemove] = useState([]);
    const [selectedForRemoval, setSelectedForRemoval] = useState([]);

    const { user_type } = usePermissionContext();

    // Funções para criar grupo
    const handleCreateGroup = (groupData) => {
        const newGroup = {
            id: Date.now(), // Substituir por ID do banco futuramente
            title: groupData.title,
            description: groupData.description,
            contents: []
        };
        setGroups(prev => [...prev, newGroup]);
        setShowCreateModal(false);
        
        // TODO: Implementar request para o banco de dados
        console.log('Criando grupo no banco:', newGroup);
    };

    // Funções para editar grupo
    const handleEditGroup = (group) => {
        setEditingGroup(group);
        setShowEditModal(true);
    };

    const handleUpdateGroup = (groupData) => {
        setGroups(prev => prev.map(group => 
            group.id === editingGroup.id 
                ? { ...group, title: groupData.title, description: groupData.description }
                : group
        ));
        setShowEditModal(false);
        setEditingGroup(null);
        
        // TODO: Implementar request para o banco de dados
        console.log('Atualizando grupo no banco:', { id: editingGroup.id, ...groupData });
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
        
        const groupsToRemoveList = groups.filter(group => selectedForRemoval.includes(group.id));
        setGroupsToRemove(groupsToRemoveList);
        setShowRemoveModal(false);
        setShowRemoveConfirmation(true);
    };

    const handleConfirmRemove = () => {
        setGroups(prev => prev.filter(group => !selectedForRemoval.includes(group.id)));
        setShowRemoveConfirmation(false);
        setGroupsToRemove([]);
        setSelectedForRemoval([]);
        
        // TODO: Implementar request para o banco de dados
        console.log('Removendo grupos do banco:', selectedForRemoval);
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
        if (user_type === 'monitor') {
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
            
            {groups.map(group => (
                <ContentGroup 
                    key={group.id}
                    group={group}
                    onEdit={handleEditGroup}
                />
            ))}

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
                            {groups.map((group) => (
                                <div key={group.id} className='file-item-with-checkbox'>
                                    <input 
                                        type="checkbox"
                                        className='file-checkbox'
                                        checked={selectedForRemoval.includes(group.id)}
                                        onChange={(e) => handleGroupRemovalSelection(group.id, e.target.checked)}
                                    />
                                    <div className='file-info'>
                                        <span className='file-name'>{group.title}</span>
                                        <span className='file-size'>{group.contents.length} arquivo(s)</span>
                                    </div>
                                </div>
                            ))}
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
                                        <span className='file-name'>{group.title}</span>
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
    
    const { user_type } = usePermissionContext();
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
        console.log('Enviando arquivos para o grupo:', group.id, selectedFiles);
        handleCancelUpload();
    };

    // Funções para remoção de arquivos
    const handleRemoveFiles = () => {
        setShowRemoveSelection(true);
        setSelectedForRemoval([]);
    };

    const handleCheckboxChange = (index, isChecked) => {
        if (isChecked) {
            setSelectedForRemoval(prev => [...prev, index]);
        } else {
            setSelectedForRemoval(prev => prev.filter(i => i !== index));
        }
    };

    const handleCancelRemoveSelection = () => {
        setShowRemoveSelection(false);
        setSelectedForRemoval([]);
    };

    const handleConfirmRemoveSelection = () => {
        if (selectedForRemoval.length === 0) return;
        
        const filesToRemoveList = selectedForRemoval.map(index => group.contents[index]);
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
        console.log('Removendo arquivos do grupo:', group.id, filesToRemove);
        handleCancelRemoveConfirmation();
    };

    const renderListConfig = () => {
        if (user_type === 'monitor') {
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
        if (user_type === 'monitor') {
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
                        <h3 className='content-group-title'>{group.title}</h3>
                        <div className='header-controls'>
                            {renderGroupControls()}
                            <button className='expand-btn' onClick={() => setIsExpanded(!isExpanded)}>
                                {isExpanded ? '▼' : '▶'}
                            </button>
                        </div>
                    </div>
                </div>

                {isExpanded && (
                    <div className='content-group-body'>
                        <div className='content-description'>
                            <p>{group.description}</p>
                        </div>

                        <div className='content-list'>
                            {group.contents.map((content, index) => (
                                <div key={content.id} className='content-card'>
                                    <div className='content-icon'>
                                        📄
                                    </div>
                                    <div className='content-info'>
                                        <h4>{content.name}</h4>
                                        <span className='content-meta'>{content.size}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {renderListConfig()}
                    </div>
                )}
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
                            {group.contents.map((content, index) => (
                                <div key={content.id} className='file-item-with-checkbox'>
                                    <input 
                                        type="checkbox"
                                        className='file-checkbox'
                                        checked={selectedForRemoval.includes(index)}
                                        onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                                    />
                                    <div className='file-info'>
                                        <span className='file-name'>{content.name}</span>
                                        <span className='file-size'>{content.size}</span>
                                    </div>
                                </div>
                            ))}
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
        title: initialData?.title || '',
        description: initialData?.description || ''
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
        
        if (!formData.title.trim()) {
            newErrors.title = 'Nome do grupo é obrigatório';
        }
        
        if (!formData.description.trim()) {
            newErrors.description = 'Descrição é obrigatória';
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
                            className={`form-input ${errors.title ? 'error' : ''}`}
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder='Digite o nome do grupo'
                        />
                        {errors.title && <span className='error-message'>{errors.title}</span>}
                    </div>

                    <div className='form-field'>
                        <label className='form-label'>Descrição:</label>
                        <textarea
                            className={`form-textarea ${errors.description ? 'error' : ''}`}
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder='Digite a descrição do grupo'
                            rows={4}
                        />
                        {errors.description && <span className='error-message'>{errors.description}</span>}
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