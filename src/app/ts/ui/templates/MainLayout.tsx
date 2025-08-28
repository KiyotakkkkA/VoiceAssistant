import React from 'react';
import { Badge, Toast } from '../atoms/feedback';
import { StatePanel } from '../molecules';
import { useState } from 'react';
import { GContext } from '../../providers';
import { Visualizer } from '../organisms/home';
import { AppsGrid } from '../organisms/applications';
import { SettingsPanel } from '../organisms/settings';
import { NotesView } from '../organisms/notes';
import { EventLog, RightNav } from '../organisms/layout';
import { observer } from 'mobx-react-lite';
import SettingsStore from '../../store/SettingsStore';
import { useDragResize } from '../../composables';

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

  if (!ctx?.states) return null;

  const modes = {
    'NORMAL': { 
      label: 'ОБЫЧНЫЙ', 
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30'
    },
  }

  const currentMode = SettingsStore.data.runtime['runtime.current.mode'] as keyof typeof modes;
  const modeInfo = modes[currentMode] || modes.NORMAL;

  const pages: Record<string, Record<string, React.ReactNode>> = {
    home: {
      component: <Visualizer mode={mode} systemReady={systemReady} />,
      fullmode: false
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
    'home' | 'apps' | 'settings'
  >('home');
  const modeClass: Record<string,string> = {
    'waiting': 'bg-badge-waiting text-white',
    'listening': 'bg-badge-listening text-white',
    'initializing': 'bg-badge-initializing text-white',
    'thinking': 'bg-badge-thinking text-black'
  };
  return (
    <div className='h-screen flex flex-col bg-ui-bg-primary text-ui-text-primary font-sans overflow-hidden relative'>
      <div className='h-9 flex items-center justify-between px-4 text-[11px] bg-ui-bg-secondary border-b border-ui-border-primary select-none shadow-inner'>
        <div className='flex items-center gap-3'>
          <Badge label={ctx.states[mode]} className={modeClass[mode]||'bg-badge-default text-white'} />
          <span className='tracking-wider uppercase text-ui-text-secondary text-[14px]'>Голосовой ассистент</span>
          <span className='text-sm text-ui-text-accent'>{assistantName||'—'}</span>
          <span className='text-sm text-gray-400'> | </span>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${modeInfo.bg} ${modeInfo.color} ${modeInfo.border} border backdrop-blur-sm`}>
            <span className="font-semibold tracking-wide">{modeInfo.label}</span>
          </div>
        </div>
        <div className='flex items-center gap-4 text-ui-text-secondary'>
          <span className='opacity-70'>ws:{__SOCKET_PORT__}</span>
          { SettingsStore.data.settings['ui.current.event.panel.state'] && (
            <button onClick={()=>setLogOpen(o=>!o)} className='px-2 py-0.5 rounded bg-ui-bg-primary-light hover:bg-ui-bg-secondary-light text-xs border border-ui-border-primary transition-colors'>{logOpen?'Скрыть лог':'Показать лог'}</button>
          )}
        </div>
      </div>
      <div className='flex-1 relative overflow-hidden flex'>
        <div className='w-60 bg-ui-bg-secondary border-r border-ui-border-primary flex flex-col text-xs'>
          <div className='px-4 py-3 font-semibold text-ui-text-accent tracking-wide'>Состояния</div>
          <div className='px-4 pb-4 overflow-y-auto custom-scrollbar'>
            <StatePanel assistantName={assistantName} mode={mode} transcript={transcript} />
          </div>
        </div>
        <div className='flex-1 relative flex'>
          <div className='flex-1 relative'>
            <div className={`${pages[activeTab].fullmode ? 'h-full' : ''}`}>
              {pages[activeTab].component}
            </div>
          </div>
          <RightNav active={activeTab} onChange={(t: string)=>setActiveTab(t as 'home' | 'apps')} />
        </div>
      </div>
      { SettingsStore.data.settings['ui.current.event.panel.state'] && (
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
