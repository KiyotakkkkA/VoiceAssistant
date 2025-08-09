import React from 'react';
interface Msg { type: string; payload: any; from?: string }
export const EventLog: React.FC<{messages: Msg[]}> = ({ messages }) => (
  <div className='flex-1 overflow-auto p-3 space-y-2 font-mono text-[11px] bg-[#1e1e1e]'>
    {messages.map((m,i)=>(
      <div key={i} className='px-2 py-1 rounded border border-[#333] bg-[#252526]'>
        <div className='opacity-60 mb-0.5'>{m.from || 'unknown'} :: {m.type}</div>
        <pre className='whitespace-pre-wrap break-words'>{typeof m.payload==='string'?m.payload:JSON.stringify(m.payload,null,2)}</pre>
      </div>
    ))}
    {messages.length===0 && <div className='opacity-50'>Нет событий</div>}
  </div>
);
