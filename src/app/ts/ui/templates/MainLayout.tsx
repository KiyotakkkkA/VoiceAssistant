import React from 'react';
import { Badge } from '../atoms';
import { StatePanel } from '../molecules';
import { 
  EventLog,
  Visualizer,
  RightNav,
  AppsGrid
} from '../organisms';
import { useState } from 'react';

declare const __SOCKET_PORT__: number;

interface Props {
  assistantName: string;
  mode: string;
  transcript: string;
  messages: {type:string;payload:any;from?:string}[];
  onSend: (text:string)=>void;
  apps: Record<string, any>;
}

export const MainLayout: React.FC<Props> = ({ assistantName, mode, transcript, messages, onSend, apps }) => {

  const pages: Record<string, React.ReactNode> = {
    home: <Visualizer mode={mode} />,
    apps: <AppsGrid apps={apps || {}} />
  };

  const [logOpen, setLogOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'home' | 'apps'
  >('home');
  const modeClass: Record<string,string> = {
    'Ожидание': 'bg-[#3c3c3c] text-gray-200',
    'wake': 'bg-[#007acc] text-white',
    'Слушание': 'bg-[#0dbc79] text-white'
  };
  return (
    <div className='h-screen flex flex-col bg-[#1e1e1e] text-gray-200 font-sans overflow-hidden relative'>
      <div className='h-9 flex items-center justify-between px-4 text-[11px] bg-[#2d2d2d] border-b border-black select-none shadow-inner'>
        <div className='flex items-center gap-3'>
          <Badge label={mode} className={modeClass[mode]||'bg-gray-600'} />
          <span className='tracking-wider uppercase text-gray-500'>Голосовой ассистент</span>
          <span className='text-sm text-gray-300'>{assistantName||'—'}</span>
        </div>
        <div className='flex items-center gap-4 text-gray-500'>
          <span className='opacity-70'>ws:{__SOCKET_PORT__}</span>
          <button onClick={()=>setLogOpen(o=>!o)} className='px-2 py-0.5 rounded bg-[#222a33] hover:bg-[#2b3540] text-xs border border-[#313c47] transition-colors'>{logOpen?'Скрыть лог':'Показать лог'}</button>
        </div>
      </div>
  <div className='flex-1 relative overflow-hidden flex'>
        <div className='w-60 bg-[#252526] border-r border-black flex flex-col text-xs'>
          <div className='px-4 py-3 font-semibold text-gray-300 tracking-wide'>Состояния</div>
          <div className='px-4 pb-4 overflow-y-auto custom-scrollbar'>
            <StatePanel assistantName={assistantName} mode={mode} transcript={transcript} />
          </div>
        </div>
        <div className='flex-1 relative flex'>
          <div className='flex-1 relative'>
            <div>
              {pages[activeTab]}
            </div>
          </div>
          <RightNav active={activeTab} onChange={(t: string)=>setActiveTab(t as 'home' | 'apps')} />
        </div>
      </div>
      <div className={`absolute left-0 right-0 bottom-0 z-20 transition-[height] duration-300 ease-in-out bg-[#1e1e1e]/95 backdrop-blur-[2px] border-t border-[#333] flex flex-col ${logOpen? 'h-64':'h-8'}`}>        
        <div className='h-8 flex items-center justify-between px-4 text-[11px] uppercase tracking-wider text-gray-500 cursor-pointer select-none' onClick={()=>setLogOpen(o=>!o)}>
          <div className='flex items-center gap-2'>
            <span className='font-semibold text-gray-300'>Лог событий</span>
            <span className='text-gray-600'>{logOpen? '▼':'▲'}</span>
          </div>
          <div className='text-gray-600'>{messages.length}</div>
        </div>
        {logOpen && (
          <>
            <div className='flex-1 overflow-auto px-4 pb-2 custom-scrollbar bg-[#252526]/80'>
              <EventLog messages={messages} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
