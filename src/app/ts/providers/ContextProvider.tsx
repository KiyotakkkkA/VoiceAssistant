import React, { createContext, useMemo, useEffect } from "react";
import { ThemeResolver } from "../utils";

interface GlobalContextType {
    children?: React.ReactNode;
    states?: Record<string, string>;
    themes?: Record<string, string>;
}

export const GContext = createContext<GlobalContextType>({});

export const GlobalContext: React.FC<GlobalContextType> = ({ children, themes }) => {
    const resolver = useMemo(() => new ThemeResolver(), []);
    useEffect(() => {
        if (themes && Object.keys(themes).length > 0) {
            resolver.apply(themes);
        }
    }, [resolver, themes]);

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
