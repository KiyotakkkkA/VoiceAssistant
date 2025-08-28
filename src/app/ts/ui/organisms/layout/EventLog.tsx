import React, { useState } from 'react';
import { useToast } from '../../../composables';

interface Msg { type: string; topic: string; payload: any; from?: string; _ts?: number }
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

const EventLog: React.FC<Props> = ({ messages }) => {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const { addToast } = useToast();

  const toggle = (i: number, defaultOpen: boolean) => setExpanded(e => {
    const current = e[i];
    if (current === undefined) {
      return { ...e, [i]: !defaultOpen };
    }
    return { ...e, [i]: !current };
  });

  return (
    <div className='flex-1 overflow-auto p-3 space-y-2 font-mono text-[11px] bg-ui-bg-primary'>
      {messages.map((m,i)=>{
        const defaultOpen = i > messages.length - 10;
        const isOpen = expanded[i] ?? defaultOpen;
        const payload = typeof m.payload==='string'? m.payload : m.payload;
        const highlighted = typeof payload === 'string' ? payload : highlightJson(payload);
        return (
          <div key={i} className='group relative rounded-md border border-ui-border-primary bg-ui-bg-secondary shadow-sm hover:shadow-md transition-colors'>
            <div className='flex items-center gap-2 px-2 py-1 border-b border-ui-border-primary text-[11px]'>
              <span className={`px-1.5 py-0.5 rounded text-[10px] tracking-wide font-semibold bg-ui-bg-secondary-light border border-ui-border-primary`}>{m.type}</span>
              <span className='text-eventlog-from-text'> - </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] tracking-wide font-semibold bg-ui-bg-secondary-light border border-ui-border-primary`}>{m.topic}</span>
              <span className='text-eventlog-from-text'> :: </span>
              <span className='text-eventlog-from-text'>{m.from||'unknown'}</span>
              <div className='ml-auto flex items-center gap-1'>
                <button
                  onClick={()=>toggle(i, defaultOpen)}
                  className='relative px-2 py-0.5 rounded-md border border-ui-border-primary bg-ui-bg-primary-light hover:border-ui-border-primary-hover hover:bg-ui-bg-secondary-light text-ui-text-primary hover:text-ui-text-primary-hover transition-colors text-[10px]'
                >{isOpen?'Свернуть':'Развернуть'}</button>
                <button
                  onClick={()=>{
                    navigator.clipboard.writeText(typeof payload==='string'?payload:JSON.stringify(payload,null,2));
                    addToast('Скопировано в буфер обмена', 'info', 3500);
                  }}
                  className='px-2 py-0.5 rounded-md border border-ui-border-primary bg-ui-bg-primary-light hover:border-ui-border-primary-hover hover:bg-ui-bg-secondary-light text-eventlog-button-accent hover:text-eventlog-button-accent-hover text-[10px] font-semibold tracking-wide'
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
    </div>
  );
};

export { EventLog };
