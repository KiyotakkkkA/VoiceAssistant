import React from 'react';
import { Badge, Toast } from '../atoms';
import { StatePanel } from '../molecules';
import { 
  EventLog,
  Visualizer,
  RightNav,
  AppsGrid,
  SettingsPanel
} from '../organisms';
import { useState } from 'react';
import { GContext } from '../../providers';

declare const __SOCKET_PORT__: number;

interface Props {
  assistantName: string;
  mode: string;
  transcript: string | Object;
  messages: {type:string;payload:any;from?:string}[];
  onSend: (text:string)=>void;
  apps: Record<string, any>;
  toasts?: { id:string; message:string }[];
  systemReady?: boolean;
  theme?: Record<string, any> | null;
  settings?: Record<string, any> | null;
  themeNames?: string[];
}

export const MainLayout: React.FC<Props> = ({ assistantName, mode, transcript, messages, onSend, apps, toasts=[], systemReady=false, theme, themeNames, settings }) => {

  const ctx = React.useContext(GContext);

  if (!ctx?.states) return null;

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
      component: <SettingsPanel themeNames={themeNames || []} currentTheme={settings?.['ui.current.theme.id'] || 'dark'} />,
      fullmode: true
    },
  };

  const [logOpen, setLogOpen] = useState(true);
  const [logHeight, setLogHeight] = useState(256);
  const [dragging, setDragging] = useState(false);
  const startRef = React.useRef<{y:number; h:number}>();
  const didDragRef = React.useRef(false);

  const onDragStart = (e: React.MouseEvent) => {
    if (!logOpen) return;
    setDragging(true);
    didDragRef.current = false;
    startRef.current = { y: e.clientY, h: logHeight };
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
  };
  const onDragMove = (e: MouseEvent) => {
    if (!startRef.current) return;
    const dy = startRef.current.y - e.clientY;
    if (Math.abs(dy) > 2) didDragRef.current = true;
    let newH = startRef.current.h + dy;
    newH = Math.max(120, Math.min(window.innerHeight*0.9, newH));
    setLogHeight(newH);
  };
  const onDragEnd = () => {
    setDragging(false);
    window.removeEventListener('mousemove', onDragMove);
    window.removeEventListener('mouseup', onDragEnd);
  };
  const [activeTab, setActiveTab] = useState<
    'home' | 'apps' | 'settings'
  >('home');
  const modeClass: Record<string,string> = {
    'waiting': 'bg-badge-waiting text-white',
    'wake': 'bg-badge-wake text-white',
    'listening': 'bg-badge-listening text-white',
    'initializing': 'bg-badge-initializing text-white'
  };
  return (
    <div className='h-screen flex flex-col bg-main-bg text-ui-text-primary font-sans overflow-hidden relative'>
      <div className='h-9 flex items-center justify-between px-4 text-[11px] bg-topbar-bg border-b border-topbar-border select-none shadow-inner'>
        <div className='flex items-center gap-3'>
          <Badge label={ctx.states[mode]} className={modeClass[mode]||'bg-badge-default text-white'} />
          <span className='tracking-wider uppercase text-ui-text-secondary'>Голосовой ассистент</span>
          <span className='text-sm text-ui-text-accent'>{assistantName||'—'}</span>
        </div>
        <div className='flex items-center gap-4 text-ui-text-secondary'>
          <span className='opacity-70'>ws:{__SOCKET_PORT__}</span>
          <button onClick={()=>setLogOpen(o=>!o)} className='px-2 py-0.5 rounded bg-button-bg hover:bg-button-bg-hover text-xs border border-button-border transition-colors'>{logOpen?'Скрыть лог':'Показать лог'}</button>
        </div>
      </div>
  <div className='flex-1 relative overflow-hidden flex'>
        <div className='w-60 bg-sidebars-bg border-r border-sidebars-border flex flex-col text-xs'>
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
      <div className={`absolute left-0 right-0 bottom-0 z-20 bg-log-bg/95 backdrop-blur-[2px] flex flex-col`} style={{height: logOpen ? logHeight : 32, transition: dragging ? 'none':'height 0.25s ease'}}>
        {logOpen && (
          <div
            onMouseDown={onDragStart}
            className={`absolute top-0 left-0 right-0 h-2 -translate-y-full cursor-row-resize ${dragging? 'bg-draghandle-bg-active/20' : 'bg-transparent hover:bg-draghandle-bg-hover/5'}`}
          >
            <div className={`w-full h-px bg-gradient-to-r from-widget-accent-a/30 via-widget-accent-b/30 to-widget-accent-a/30 translate-y-[7px] pointer-events-none ${dragging? 'animate-pulse':''}`}></div>
          </div>
        )}
        <div
          onMouseDown={onDragStart}
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
            <div className='flex-1 overflow-auto px-4 pb-2 custom-scrollbar bg-log-panel-bg/80'>
              <EventLog messages={messages} />
            </div>
          </>
        )}
      </div>
      <div className='pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm'>
        {toasts.map(t => (
          <Toast key={t.id} title={t.message} />
        ))}
      </div>
    </div>
  );
};
