import React, { createContext, useContext, useState } from 'react';

const PermissionContext = createContext();

export const usePermissionContext = () => {
    const context = useContext(PermissionContext);

    if(!context) {
        throw new Error('ERRO');
    }

    return context;
};

export const PermissionProvider = ({ children }) => {
    const [username, setUsername] = useState('ADMINISTRADOR');
    const [user_id, setUserId] = useState(-1);
    const [user_type, setUserType] = useState('monitor');

    const value = {
        username,
        setUsername,
        user_id,
        setUserId,
        user_type,
        setUserType
    }

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
};