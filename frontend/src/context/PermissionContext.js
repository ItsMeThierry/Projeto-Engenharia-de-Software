import React, { createContext, useContext, useState } from 'react';

const PermissionContext = createContext();

export const usePermissionContext = () => {
    const context = useContext(PermissionContext);

    if(!context) {
        throw new Error('usePermissionContext deve ser usado dentro de PermissionProvider');
    }

    return context;
};

export const PermissionProvider = ({ children }) => {
    // Inicializa o estado com os valores do localStorage, se existirem
    const [userData, setUserDataState] = useState(() => {
        const savedUserData = localStorage.getItem('userData');
        return savedUserData ? JSON.parse(savedUserData) : {
            user_id: null,
            username: null,
            user_type: null,
            user_email: null
        };
    });

    // Função wrapper que atualiza tanto o estado quanto o localStorage
    const setUserData = (data) => {
        setUserDataState(data);
        if (data === null) {
            localStorage.removeItem('userData');
        } else {
            localStorage.setItem('userData', JSON.stringify(data));
        }
    };

    // Funções específicas para atualizar campos individuais
    const setUsername = (value) => {
        setUserData(prev => ({
            ...prev,
            username: value
        }));
    };

    const setUserId = (value) => {
        setUserData(prev => ({
            ...prev,
            user_id: value
        }));
    };

    const setUserType = (value) => {
        setUserData(prev => ({
            ...prev,
            user_type: value
        }));
    };

    const setUserEmail = (value) => {
        setUserData(prev => ({
            ...prev,
            user_email: value
        }));
    };

    // Função auxiliar para limpar todos os dados do usuário
    const clearUserData = () => {
        setUserData({
            user_id: null,
            username: null,
            user_type: null,
            user_email: null
        });
    };

    // Função para obter os dados do usuário em formato de objeto
    const getUserData = () => {
        return {
            id: userData.user_id,
            nome: userData.username,
            email: userData.user_email || "placeholder",
            cargo: userData.user_type
        };
    };

    // Função para verificar se o usuário é um monitor
    const isUserMonitor = () => {
        return userData.user_type === 'monitor';
    }

    const value = {
        setUserData,
        setUsername,
        setUserId,
        setUserType,
        setUserEmail,
        clearUserData,
        getUserData,
        isUserMonitor
    };

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
};