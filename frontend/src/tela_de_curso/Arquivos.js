import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePermissionContext } from '../context/PermissionContext.js';
import { X, AlertTriangle } from 'lucide-react';
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
                    key={group.id_modulo || group.id}
                    group={group}
                    onEdit={handleEditGroup}
                />
            )) : (
                <div className="no-groups-message">
                    Nenhum grupo de conteúdo encontrado.
                </div>
            )}

            {showCreateModal && (
                <GroupModal
                    title="Criar Novo Grupo"
                    onSave={handleCreateGroup}
                    onCancel={() => setShowCreateModal(false)}
                />
            )}

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

            {showRemoveModal && (
                <RemoveGroupsModal
                    groups={groups}
                    selectedForRemoval={selectedForRemoval}
                    onToggleSelection={handleGroupRemovalSelection}
                    onConfirm={handleConfirmRemoveSelection}
                    onCancel={handleCancelRemoveSelection}
                />
            )}

            {showRemoveConfirmation && (
                <ConfirmRemovalModal
                    title="Confirmar Remoção de Grupos"
                    items={groupsToRemove}
                    itemType="grupo"
                    itemsType="grupos"
                    getItemName={(group) => group.nome}
                    getItemMeta={(group) => `${group.contents.length} arquivo(s)`}
                    onConfirm={handleConfirmRemove}
                    onCancel={handleCancelRemoveConfirmation}
                />
            )}
        </div>
    );
}

function ContentGroup({ group, onEdit }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showRemoveSelection, setShowRemoveSelection] = useState(false);
    const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
    const [filesToRemove, setFilesToRemove] = useState([]);
    const [selectedForRemoval, setSelectedForRemoval] = useState([]);
    
    const { isUserMonitor } = usePermissionContext();
    const fileInputRef = useRef(null);

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleAddFiles = () => {
        fileInputRef.current.click();
    };

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

    const removeFileFromList = (fileId) => {
        setSelectedFiles(prev => prev.filter(file => file.id !== fileId));
    };

    const handleCancelUpload = () => {
        setShowConfirmation(false);
        setSelectedFiles([]);
        fileInputRef.current.value = '';
    };

    const handleConfirmUpload = () => {
        console.log('Enviando arquivos para o grupo:', group.id_modulo, selectedFiles);
        handleCancelUpload();
    };

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

                    <div className='content-list'>
                        {group.contents && group.contents.length > 0 ? group.contents.map((content) => (
                            <div key={content.id} className='content-card'>
                                <div className='content-icon'>📄</div>
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

            {showConfirmation && (
                <UploadConfirmationModal
                    files={selectedFiles}
                    onRemoveFile={removeFileFromList}
                    onConfirm={handleConfirmUpload}
                    onCancel={handleCancelUpload}
                />
            )}

            {showRemoveSelection && (
                <RemoveFilesModal
                    contents={group.contents}
                    selectedForRemoval={selectedForRemoval}
                    onToggleSelection={handleCheckboxChange}
                    onConfirm={handleConfirmRemoveSelection}
                    onCancel={handleCancelRemoveSelection}
                />
            )}

            {showRemoveConfirmation && (
                <ConfirmRemovalModal
                    title="Confirmar Remoção de Arquivos"
                    items={filesToRemove}
                    itemType="arquivo"
                    itemsType="arquivos"
                    getItemName={(file) => file.name}
                    getItemMeta={(file) => file.size}
                    onConfirm={handleConfirmRemove}
                    onCancel={handleCancelRemoveConfirmation}
                />
            )}
        </>
    );
}

// Modal para criar/editar grupos
function GroupModal({ title, initialData = null, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        nome: initialData?.nome || '',
        descricao: initialData?.descricao || ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
        <div className='modal-overlay' onClick={onCancel}>
            <div className='modal-container' onClick={(e) => e.stopPropagation()}>
                <div className='modal-header'>
                    <h3>{title}</h3>
                    <button className='close-button' onClick={onCancel}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className='modal-content'>
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

                    <div className='modal-footer'>
                        <button type='button' className='cancel-button' onClick={onCancel}>
                            Cancelar
                        </button>
                        <button type='submit' className='confirm-button'>
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Modal para selecionar grupos para remover
function RemoveGroupsModal({ groups, selectedForRemoval, onToggleSelection, onConfirm, onCancel }) {
    return (
        <div className='modal-overlay' onClick={onCancel}>
            <div className='modal-container' onClick={(e) => e.stopPropagation()}>
                <div className='modal-header'>
                    <h3>Remover Grupos</h3>
                    <button className='close-button' onClick={onCancel}>
                        <X size={20} />
                    </button>
                </div>

                <div className='modal-content'>
                    <p className='modal-question'>Quais grupos deseja remover?</p>
                    
                    <div className='items-list'>
                        {groups.length === 0 ? (
                            <div className='no-items'>
                                <p>Nenhum grupo disponível para remoção.</p>
                            </div>
                        ) : (
                            groups.map((group) => (
                                <label key={group.id_modulo} className='checkbox-item'>
                                    <input
                                        type="checkbox"
                                        checked={selectedForRemoval.includes(group.id_modulo)}
                                        onChange={(e) => onToggleSelection(group.id_modulo, e.target.checked)}
                                    />
                                    <div className='item-info'>
                                        <span className='item-name'>{group.nome}</span>
                                        <span className='item-meta'>{group.contents.length} arquivo(s)</span>
                                    </div>
                                </label>
                            ))
                        )}
                    </div>
                </div>

                <div className='modal-footer'>
                    <button className='cancel-button' onClick={onCancel}>
                        Sair
                    </button>
                    <button 
                        className='confirm-button' 
                        onClick={onConfirm}
                        disabled={selectedForRemoval.length === 0}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}

// Modal para selecionar arquivos para remover
function RemoveFilesModal({ contents, selectedForRemoval, onToggleSelection, onConfirm, onCancel }) {
    return (
        <div className='modal-overlay' onClick={onCancel}>
            <div className='modal-container' onClick={(e) => e.stopPropagation()}>
                <div className='modal-header'>
                    <h3>Remover Arquivos</h3>
                    <button className='close-button' onClick={onCancel}>
                        <X size={20} />
                    </button>
                </div>

                <div className='modal-content'>
                    <p className='modal-question'>Quais arquivos deseja remover?</p>
                    
                    <div className='items-list'>
                        {!contents || contents.length === 0 ? (
                            <div className='no-items'>
                                <p>Nenhum arquivo para remover.</p>
                            </div>
                        ) : (
                            contents.map((content) => (
                                <label key={content.id} className='checkbox-item'>
                                    <input
                                        type="checkbox"
                                        checked={selectedForRemoval.includes(content.id)}
                                        onChange={(e) => onToggleSelection(content.id, e.target.checked)}
                                    />
                                    <div className='item-info'>
                                        <span className='item-name'>{content.name}</span>
                                        <span className='item-meta'>{content.size}</span>
                                    </div>
                                </label>
                            ))
                        )}
                    </div>
                </div>

                <div className='modal-footer'>
                    <button className='cancel-button' onClick={onCancel}>
                        Sair
                    </button>
                    <button 
                        className='confirm-button' 
                        onClick={onConfirm}
                        disabled={selectedForRemoval.length === 0}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}

// Modal de confirmação de upload
function UploadConfirmationModal({ files, onRemoveFile, onConfirm, onCancel }) {
    return (
        <div className='modal-overlay' onClick={onCancel}>
            <div className='modal-container' onClick={(e) => e.stopPropagation()}>
                <div className='modal-header'>
                    <h3>Confirmar Upload</h3>
                    <button className='close-button' onClick={onCancel}>
                        <X size={20} />
                    </button>
                </div>

                <div className='modal-content'>
                    <p className='modal-question'>Deseja enviar os seguintes arquivos?</p>
                    
                    <div className='items-list'>
                        {files.map((file) => (
                            <div key={file.id} className='file-item-removable'>
                                <div className='item-info'>
                                    <span className='item-name'>{file.name}</span>
                                    <span className='item-meta'>{file.size}</span>
                                </div>
                                <button 
                                    className='remove-item-button'
                                    onClick={() => onRemoveFile(file.id)}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='modal-footer'>
                    <button className='cancel-button' onClick={onCancel}>
                        Não
                    </button>
                    <button 
                        className='confirm-button' 
                        onClick={onConfirm}
                        disabled={files.length === 0}
                    >
                        Sim
                    </button>
                </div>
            </div>
        </div>
    );
}

// Modal genérico de confirmação de remoção
function ConfirmRemovalModal({ title, items, itemType, itemsType, getItemName, getItemMeta, onConfirm, onCancel }) {
    return (
        <div className='modal-overlay' onClick={onCancel}>
            <div className='modal-container' onClick={(e) => e.stopPropagation()}>
                <div className='modal-header'>
                    <h3>{title}</h3>
                    <button className='close-button' onClick={onCancel}>
                        <X size={20} />
                    </button>
                </div>

                <div className='modal-content confirmation-content'>
                    <div className='warning-icon'>
                        <AlertTriangle size={48} />
                    </div>
                    <p className='confirmation-text'>
                        Tem certeza que deseja remover {items.length} {items.length === 1 ? itemType : itemsType}?
                    </p>
                    <p className='confirmation-subtext'>
                        Esta ação não pode ser desfeita.
                    </p>
                    
                    <div className='selected-items-preview'>
                        {items.map((item, index) => (
                            <div key={index} className='item-preview'>
                                <span className='item-preview-name'>• {getItemName(item)}</span>
                                {getItemMeta && <span className='item-preview-meta'>({getItemMeta(item)})</span>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className='modal-footer'>
                    <button className='cancel-button' onClick={onCancel}>
                        Cancelar
                    </button>
                    <button className='confirm-delete-button' onClick={onConfirm}>
                        Remover {itemsType}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Archives;