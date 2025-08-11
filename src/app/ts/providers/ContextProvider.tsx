import React, { createContext, useState } from "react";

interface GlobalContextType {
    children?: React.ReactNode;
    states?: Record<string, string>;
}

export const GContext = createContext<GlobalContextType>({});

export const GlobalContext: React.FC<GlobalContextType> = ({ children }) => {

    const states = {
        'initializing': 'Инициализация',
        'wake': 'Пробуждение',
        'waiting': 'Ожидание',
        'listening': 'Слушание'
    }

    return (
        <GContext.Provider value={{ states }}>
            {children}
        </GContext.Provider>
    );
};

export type {
    GlobalContextType
}
