import React, { useState } from 'react';
import { Toast } from '../../atoms/feedback';

interface Msg { type: string; payload: any; from?: string; _ts?: number }
interface Props { messages: Msg[] }

function highlightJson(obj: any) {
  if (typeof obj === 'string') return obj;
  let json = JSON.stringify(obj, null, 2);
  return json
    .replace(/(&)/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/("(\\"|[^"])*"\s*:)/g, '<span class="text-eventlog-json-key">$1</span>')
    .replace(/(:\s"(\\"|[^"])*")/g,'<span class="text-eventlog-json-string">$1</span>')
    .replace(/\b(true|false|null)\b/g,'<span class="text-eventlog-json-keyword">$1</span>')
    .replace(/\b(-?\d+(?:\.\d+)?)\b/g,'<span class="text-eventlog-json-number">$1</span>');
}

const typeColors: Record<string,string> = {
  wake: 'bg-eventlog-bg-wake',
  transcript: 'bg-eventlog-bg-transcript',
  python_ready: 'bg-eventlog-bg-pyready text-black',
  set_yaml_configs: 'bg-eventlog-bg-yaml',
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
    <div className='flex-1 overflow-auto p-3 space-y-2 font-mono text-[11px] bg-log-bg'>
      {messages.map((m,i)=>{
        const defaultOpen = i > messages.length - 10;
        const isOpen = expanded[i] ?? defaultOpen;
        const color = typeColors[m.type] || 'bg-eventlog-bg-default';
        const payload = typeof m.payload==='string'? m.payload : m.payload;
        const highlighted = typeof payload === 'string' ? payload : highlightJson(payload);
        return (
          <div key={i} className='group relative rounded-md border border-log-item-border bg-gradient-to-br from-eventlog-item-bg-from to-eventlog-item-bg-to shadow-sm hover:shadow-md transition-colors'>
            <div className='flex items-center gap-2 px-2 py-1 border-b border-eventlog-divider text-[11px]'>
              <span className={`px-1.5 py-0.5 rounded text-[10px] tracking-wide font-semibold ${color}`}>{m.type}</span>
              <span className='text-eventlog-from-text'>{m.from||'unknown'}</span>
              <div className='ml-auto flex items-center gap-1'>
                <button
                  onClick={()=>toggle(i, defaultOpen)}
                  className='relative px-2 py-0.5 rounded-md border border-eventlog-button-border bg-eventlog-button-bg hover:border-eventlog-button-border-hover hover:bg-eventlog-button-bg-hover text-eventlog-button-text hover:text-eventlog-button-text-hover transition-colors text-[10px]'
                >{isOpen?'Свернуть':'Развернуть'}</button>
                <button
                  onClick={()=>{
                    let id = Date.now(); 
                    navigator.clipboard.writeText(typeof payload==='string'?payload:JSON.stringify(payload,null,2))
                    setToasts(prev => [...prev, { id, message: 'Скопировано в буфер обмена' }]);
                    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
                  }}
                  className='px-2 py-0.5 rounded-md border border-eventlog-button-border bg-eventlog-button-bg hover:border-eventlog-button-border-hover hover:bg-eventlog-button-bg-hover text-eventlog-button-accent hover:text-eventlog-button-accent-hover text-[10px] font-semibold tracking-wide'
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

export { EventLog };
