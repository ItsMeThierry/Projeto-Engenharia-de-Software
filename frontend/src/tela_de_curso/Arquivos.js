import React, { useState, useRef } from 'react';
import { usePermissionContext } from '../context/PermissionContext';
import { ReactComponent as AddIcon } from '../icones/adicionar-documento.svg';
import { ReactComponent as RemoveFileIcon } from '../icones/excluir-documento.svg'
import './Arquivos.css';

function Archives() {
    const content_groups = [
        {
            title: "Circuito RC",
            description: "Nesse conteúdo vemos o circuito RC, suas fórmulas e utilidades como filtros",
            contents: [
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }
            ]
        },
        {
            title: "Circuito RC",
            description: "Nesse conteúdo vemos o circuito RC, suas fórmulas e utilidades como filtros",
            contents: [
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }
            ]
        },
        {
            title: "Circuito RC",
            description: "Nesse conteúdo vemos o circuito RC, suas fórmulas e utilidades como filtros",
            contents: [
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }
            ]
        },
        {
            title: "Circuito RC",
            description: "Nesse conteúdo vemos o circuito RC, suas fórmulas e utilidades como filtros",
            contents: [
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }, 
                { name: "Exercícios Práticos", type: "pdf", size: "3 MB" }
            ]
        }
    ];
    return (
        <div class='page'>
            {content_groups.map(group => (<ContentGroup title={group.title} description={group.description} contents={group.contents}/>))}
        </div>
    );
}

function ContentGroup({title, description, contents}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    
    // Novos estados para remoção
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

    // Realiza o upload do arquivo na databse
    const handleConfirmUpload = () => {
        // Aqui você implementaria a lógica de upload
        //console.log('Enviando arquivos:', selectedFiles);
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
        
        const filesToRemoveList = selectedForRemoval.map(index => contents[index]);
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
        console.log('Removendo arquivos:', filesToRemove);
        handleCancelRemoveConfirmation();
    };

    const renderListConfig = ({ user_type }) => {
        if(user_type === 'monitor'){
            return(
                <div class='content-list-config'>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        multiple
                        style={{ display: 'none' }}
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                    />
                    <button class='add-btn' onClick={handleAddFiles}>
                        <AddIcon class='add-icon'/>
                    </button>
                    <button class='remove-btn' onClick={handleRemoveFiles}>
                        <RemoveFileIcon class='remove-icon'/>
                    </button>
                </div>
            );
        };
    };

    return (
        <>
            <div class='content-group'>
                <div class='content-header'>
                    <div class='content-group-info'>
                        <h3 class='content-group-title'>{title}</h3>
                        <button class='expand-btn' onClick={() => setIsExpanded(!isExpanded)}>
                            {isExpanded ? '▼' : '▶'}
                        </button>
                    </div>
                </div>

                <div class={`content-group-body ${isExpanded ? 'open' : ''}`}>
                    <div class='content-description'>
                        <p>{description}</p>
                    </div>

                    <div class='content-list'>
                        {contents.map((content, index) => (
                            <div key={index} class='content-card'>
                                <div class='content-icon'>
                                    📄
                                </div>
                                <div class='content-info'>
                                    <h4>{content.name}</h4>
                                    <span class='content-meta'>{content.size}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {renderListConfig({user_type})}
                </div>
            </div>

            {/* Overlay de Confirmação de Upload */}
            {showConfirmation && (
                <div class='upload-overlay'>
                    <div class='upload-confirmation'>
                        <h3 class='confirmation-title'>Deseja enviar os seguintes arquivos?</h3>
                        
                        <div class='file-list-confirmation'>
                            {selectedFiles.map((file) => (
                                <div key={file.id} class='file-item'>
                                    <div class='file-info'>
                                        <span class='file-name'>{file.name}</span>
                                        <span class='file-size'>{file.size}</span>
                                    </div>
                                    <button 
                                        class='remove-file-btn'
                                        onClick={() => removeFileFromList(file.id)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div class='confirmation-buttons'>
                            <button class='cancel-btn' onClick={handleCancelUpload}>
                                Não
                            </button>
                            <button 
                                class='confirm-btn' 
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
                <div class='upload-overlay'>
                    <div class='upload-confirmation'>
                        <h3 class='confirmation-title'>Quais arquivos deseja remover?</h3>
                        
                        <div class='file-list-confirmation'>
                            {contents.map((content, index) => (
                                <div key={index} class='file-item-with-checkbox'>
                                    <input 
                                        type="checkbox"
                                        class='file-checkbox'
                                        checked={selectedForRemoval.includes(index)}
                                        onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                                    />
                                    <div class='file-info'>
                                        <span class='file-name'>{content.name}</span>
                                        <span class='file-size'>{content.size}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div class='confirmation-buttons'>
                            <button class='cancel-btn' onClick={handleCancelRemoveSelection}>
                                Sair
                            </button>
                            <button 
                                class='confirm-btn' 
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
                <div class='upload-overlay'>
                    <div class='upload-confirmation'>
                        <h3 class='confirmation-title'>Os seguintes arquivos serão removidos:</h3>
                        
                        <div class='file-list-confirmation'>
                            {filesToRemove.map((file, index) => (
                                <div key={index} class='file-item'>
                                    <div class='file-info'>
                                        <span class='file-name'>{file.name}</span>
                                        <span class='file-size'>{file.size}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div class='remove-confirmation-footer'>
                            <p class='remove-question'>Deseja removê-los?</p>
                            <div class='confirmation-buttons'>
                                <button class='cancel-btn' onClick={handleCancelRemoveConfirmation}>
                                    Não
                                </button>
                                <button class='confirm-btn' onClick={handleConfirmRemove}>
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

export default Archives;