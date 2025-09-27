import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StatePanel } from './StatePanel';
import { Header } from './Header';
import { IconError } from '../atoms/icons';
import { useDragResize, useSocketActions } from '../../composables';

import InitiationStore from '../../store/InitiationStore';
import SettingsStore from '../../store/SettingsStore';
import { Toast } from '../atoms/feedback';
import { EventLog } from './EventLog';

interface MainLayoutProps {
    assistantName: string;
    children?: React.ReactNode;
    mode: 'waiting' | 'listening' | 'initializing' | 'thinking';
    messages: {type:string;topic:string;payload:any;from?:string}[];
    apps: Record<string, any>;
    toasts?: { id:string; message:string }[];
    transcript: string;
    systemReady: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = observer(( { children, assistantName, mode, transcript, systemReady, messages, apps, toasts=[] } ) => {
    
    const { initDownloadingVoiceModel } = useSocketActions();

    const [logOpen, setLogOpen] = useState(SettingsStore.data.settings['current.interface.event_panel.state'] || false);
    const [logHeight, setLogHeight] = useState(256);
    const [dragging, setDragging] = useState(false);

    const { onDragStart, didDragRef } = useDragResize(
        logHeight, 
        120, 
        0.9,
        'vertical'
    );
    
    const handleDragStart = (e: React.MouseEvent) => {
    if (!logOpen) return;
        onDragStart(e, setLogHeight, setDragging);
    };

    const toggleLog = () => {
      setLogOpen(!logOpen);
    }
    
    return (
        <div className='h-screen flex flex-col bg-ui-bg-primary text-ui-text-primary font-sans overflow-hidden relative'>
            <Header assistantName={assistantName} logOpened={logOpen} onToggleLog={toggleLog} />
            <div className='flex-1 relative overflow-hidden flex'>
                <div className='w-60 bg-ui-bg-secondary border-r border-ui-border-primary flex flex-col text-xs'>
                    <div className='flex-1 overflow-hidden'>
                        <StatePanel mode={mode} transcript={transcript} systemReady={systemReady} />
                    </div>
                    <hr className='border-ui-border-primary' />
                    <div className='mt-auto'>
                        {!InitiationStore.state.voskModel.exists && (
                        <div className='flex flex-col m-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-[11px] text-red-400 items-center gap-2'>
                            <div className='flex items-center gap-2'>
                                <IconError size={36}/>
                                <span>Модель распознавания голоса не загружена</span>
                            </div>
                            <hr className='border-red-500/20 w-full' />
                            <button
                                disabled={InitiationStore.state.voskModel.isDownloading}
                                onClick={() => {
                                    InitiationStore.state.voskModel.isDownloading = true;
                                    initDownloadingVoiceModel();
                                }} 
                                className={`py-2 px-4 rounded-md w-full bg-ui-bg-primary-light hover:bg-ui-bg-secondary-light border border-red-500/30 ${InitiationStore.state.voskModel.isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {InitiationStore.state.voskModel.isDownloading ? 'Загрузка...' : 'Загрузить модель'}
                            </button>
                        </div>
                        )}
                    </div>
                </div>
                {children}
            </div>
            { SettingsStore.data.settings['current.interface.event_panel.state'] && (
                <div className={`absolute left-0 right-0 bottom-0 z-20 bg-ui-bg-primary/95 backdrop-blur-[2px] flex flex-col`} style={{height: logOpen ? logHeight : 32, transition: dragging ? 'none':'height 0.25s ease'}}>
                {logOpen && (
                    <div
                    onMouseDown={handleDragStart}
                        className={`absolute top-0 left-0 right-0 h-2 -translate-y-full cursor-row-resize ${dragging? 'bg-draghandle-bg-active/20' : 'bg-transparent hover:bg-draghandle-bg-hover/5'}`}
                    >
                        <div className={`w-full h-px bg-gradient-to-r from-widget-accent-a/30 via-widget-accent-b/30 to-widget-accent-a/30 translate-y-[7px] pointer-events-none ${dragging? 'animate-pulse':''}`}></div>
                    </div>
                    )}
                    <div
                    onMouseDown={handleDragStart}
                    className={`relative flex items-center justify-between px-4 text-[11px] uppercase tracking-wider text-ui-text-secondary select-none h-8 ${dragging? 'cursor-row-resize':'cursor-pointer'}`}
                    onClick={(e)=>{ if(!didDragRef.current) setLogOpen(o=>!o); }}
                    >
                    <div className={`absolute left-0 right-0 top-0 h-[2px] -translate-y-full ${dragging? 'bg-gradient-to-r from-draghandle-bg-active via-widget-accent-b to-draghandle-bg-active animate-pulse':'bg-transparent'}`}></div>
                    <div className='flex items-center gap-2'>
                        <span className='font-semibold text-ui-text-accent'>Лог событий</span>
                        <span className='text-ui-text-muted'>{logOpen? (dragging ? '⇕' :'▼'):'▲'}</span>
                    </div>
                    <div className='text-ui-text-muted'>{messages.length}</div>
                    </div>
                    {logOpen && (
                    <>
                        <div className='flex-1 overflow-auto px-4 pb-2 custom-scrollbar bg-ui-bg-secondary/80'>
                        <EventLog messages={messages} />
                        </div>
                    </>
                    )}
                </div>
                )
            }
            <div className='pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm'>
                {toasts.map(t => (
                <Toast id={t.id} key={t.id} title={t.message} />
                ))}
            </div>
        </div>
    )
});

export { MainLayout };