import React, { useState } from 'react';
import { Toast } from '../atoms';

interface Msg { type: string; payload: any; from?: string; _ts?: number }
interface Props { messages: Msg[] }

function highlightJson(obj: any) {
  if (typeof obj === 'string') return obj;
  let json = JSON.stringify(obj, null, 2);
  return json
    .replace(/(&)/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/("(\\"|[^"])*"\s*:)/g, '<span class="text-[#569CD6]">$1</span>')
    .replace(/(:\s"(\\"|[^"])*")/g,'<span class="text-[#CE9178]">$1</span>')
    .replace(/\b(true|false|null)\b/g,'<span class="text-[#569CD6]">$1</span>')
    .replace(/\b(-?\d+(?:\.\d+)?)\b/g,'<span class="text-[#B5CEA8]">$1</span>');
}

const typeColors: Record<string,string> = {
  wake: 'bg-[#007acc]',
  transcript: 'bg-[#0dbc79]',
  python_ready: 'bg-[#ffcc00] text-black',
  set_yaml_configs: 'bg-[#444]',
};

const EventLog: React.FC<Props> = ({ messages }) => {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);

  const toggle = (i: number, defaultOpen: boolean) => setExpanded(e => {
    const current = e[i];
    if (current === undefined) {
      return { ...e, [i]: !defaultOpen };
    }
    return { ...e, [i]: !current };
  });

  return (
    <div className='flex-1 overflow-auto p-3 space-y-2 font-mono text-[11px] bg-[#1e1e1e]'>
      {messages.map((m,i)=>{
        const defaultOpen = i > messages.length - 10;
        const isOpen = expanded[i] ?? defaultOpen;
        const color = typeColors[m.type] || 'bg-[#2d2d2d]';
        const payload = typeof m.payload==='string'? m.payload : m.payload;
        const highlighted = typeof payload === 'string' ? payload : highlightJson(payload);
        return (
          <div key={i} className='group relative rounded-md border border-[#343434] bg-gradient-to-br from-[#262626] to-[#202020] shadow-sm hover:shadow-md transition-colors'>
            <div className='flex items-center gap-2 px-2 py-1 border-b border-[#303030] text-[11px]'>
              <span className={`px-1.5 py-0.5 rounded text-[10px] tracking-wide font-semibold ${color}`}>{m.type}</span>
              <span className='text-gray-500'>{m.from||'unknown'}</span>
              <div className='ml-auto flex items-center gap-1'>
                <button
                  onClick={()=>toggle(i, defaultOpen)}
                  className='relative px-2 py-0.5 rounded-md border border-[#3a3a3a] bg-[#2d2d2d] hover:border-[#4a4a4a] hover:bg-[#343434] text-gray-300/80 hover:text-gray-100 transition-colors text-[10px]'
                >{isOpen?'Свернуть':'Развернуть'}</button>
                <button
                  onClick={()=>{
                    let id = Date.now(); 
                    navigator.clipboard.writeText(typeof payload==='string'?payload:JSON.stringify(payload,null,2))
                    setToasts(prev => [...prev, { id, message: 'Скопировано в буфер обмена' }]);
                    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
                  }}
                  className='px-2 py-0.5 rounded-md border border-[#3a3a3a] bg-[#2d2d2d] hover:border-[#4a4a4a] hover:bg-[#343434] text-[#569CD6] hover:text-[#6ab8ff] text-[10px] font-semibold tracking-wide'
                >КОПИЯ</button>
              </div>
            </div>
            {isOpen && (
              <div className='p-2 overflow-auto custom-scrollbar'>
                <pre className='whitespace-pre text-[11px] leading-snug'><code dangerouslySetInnerHTML={{__html: highlighted}} /></pre>
              </div>
            )}
          </div>
        );
      })}
      {messages.length===0 && <div className='opacity-50'>Нет событий</div>}
      <div className='pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm'>
        {toasts.map(t => (
          <Toast key={t.id} title={t.message} />
        ))}
      </div>
    </div>
  );
};

export default EventLog;
