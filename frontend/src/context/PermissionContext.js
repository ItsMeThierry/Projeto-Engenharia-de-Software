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
    // Inicializa os estados com os valores do localStorage, se existirem
    const [username, setUsernameState] = useState(() => {
        const saved = localStorage.getItem('username');
        return saved || null;
    });
    
    const [user_id, setUserIdState] = useState(() => {
        const saved = localStorage.getItem('user_id');
        return saved || null;
    });
    
    const [user_type, setUserTypeState] = useState(() => {
        const saved = localStorage.getItem('user_type');
        return saved || null;
    });

    // Funções wrapper que atualizam tanto o estado quanto o localStorage
    const setUsername = (value) => {
        setUsernameState(value);
        if (value === null) {
            localStorage.removeItem('username');
        } else {
            localStorage.setItem('username', value);
        }
    };

    const setUserId = (value) => {
        setUserIdState(value);
        if (value === null) {
            localStorage.removeItem('user_id');
        } else {
            localStorage.setItem('user_id', value);
        }
    };

    const setUserType = (value) => {
        setUserTypeState(value);
        if (value === null) {
            localStorage.removeItem('user_type');
        } else {
            localStorage.setItem('user_type', value);
        }
    };

    // Função auxiliar para limpar todos os dados do usuário
    const clearUserData = () => {
        setUsername(null);
        setUserId(null);
        setUserType(null);
    };

    const value = {
        username,
        setUsername,
        user_id,
        setUserId,
        user_type,
        setUserType,
        clearUserData
    };

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
};