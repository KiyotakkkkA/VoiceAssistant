import React from 'react';
import { Toast } from '../atoms/feedback';
import { StatePanel } from '../molecules/panels';
import { useState } from 'react';
import { GContext } from '../../providers';
import { Visualizer } from '../organisms/home';
import { AppsGrid } from '../organisms/applications';
import { SettingsPanel } from '../organisms/settings';
import { NotesView } from '../organisms/notes';
import { ZixView } from '../organisms/zix';
import { EventLog, RightNav } from '../organisms/layout';
import { observer } from 'mobx-react-lite';
import { useDragResize } from '../../composables';
import { IconError } from '../atoms/icons';
import { useSocketActions } from '../../composables';

import SettingsStore from '../../store/SettingsStore';
import InitiationStore from '../../store/InitiationStore';

declare const __SOCKET_PORT__: number;

interface Props {
  assistantName: string;
  mode: string;
  transcript: string | Object;
  messages: {type:string;topic:string;payload:any;from?:string}[];
  apps: Record<string, any>;
  toasts?: { id:string; message:string }[];
  systemReady?: boolean;
}

export const MainLayout: React.FC<Props> = observer(({ assistantName, mode, transcript, messages, apps, toasts=[], systemReady=false }) => {

  const ctx = React.useContext(GContext);

  const { initDownloadingVoiceModel } = useSocketActions();

  if (!ctx?.states) return null;

  const modes = {
    'NORMAL': 'ОБЫЧНЫЙ',
  }

  const currentMode = SettingsStore.data.runtime['runtime.current.mode'] as keyof typeof modes;

  const pages: Record<string, Record<string, React.ReactNode>> = {
    home: {
      component: <Visualizer mode={mode} systemReady={systemReady} />,
      fullmode: false
    },
    zix: {
      component: <ZixView />,
      fullmode: true
    },
    apps: {
      component: <AppsGrid apps={apps || {}} />,
      fullmode: true
    },
    settings: {
      component: <SettingsPanel />,
      fullmode: true
    },
    notes: {
      component: <NotesView />,
      fullmode: true
    }
  };

  const [logOpen, setLogOpen] = useState(true);
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
  const [activeTab, setActiveTab] = useState<
    'home' | 'zix' | 'apps' | 'settings' | 'notes'
  >('home');
  return (
    <div className='h-screen flex flex-col bg-ui-bg-primary text-ui-text-primary font-sans overflow-hidden relative'>
      <div className='h-9 flex items-center justify-between px-4 text-[11px] bg-ui-bg-secondary border-b border-ui-border-primary select-none shadow-inner'>
        <div className='flex items-center gap-3'>
          <span className='text-xs text-ui-text-secondary uppercase tracking-wider'>Голосовой ассистент - <span className='text-ui-text-accent font-medium'>{assistantName}</span></span>
        </div>
        <div className='flex items-center gap-2 text-ui-text-secondary'>
          { SettingsStore.data.settings['current.interface.event_panel.state'] && (
            <button onClick={()=>setLogOpen(o=>!o)} className='px-2 py-0.5 rounded bg-ui-bg-secondary-light/50 hover:bg-ui-bg-secondary-light text-xs border border-ui-border-primary transition-colors'>{logOpen?'Закрыть панель событий':'Открыть панель событий'}</button>
          )}
        </div>
      </div>
      <div className='flex-1 relative overflow-hidden flex'>
        <div className='w-60 bg-ui-bg-secondary border-r border-ui-border-primary flex flex-col text-xs'>
          <div className='flex-1 overflow-hidden'>
            <StatePanel assistantName={assistantName} mode={mode} transcript={transcript} systemReady={systemReady} />
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
        <div className='flex-1 relative flex'>
          <div className='flex-1 relative'>
            <div className={`${pages[activeTab].fullmode ? 'h-full' : ''}`}>
              {pages[activeTab].component}
            </div>
          </div>
          <RightNav active={activeTab} onChange={(t: string)=>setActiveTab(t as 'home' | 'zix' | 'apps' | 'settings' | 'notes')} />
        </div>
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
  );
});
