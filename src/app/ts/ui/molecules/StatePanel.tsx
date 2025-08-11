import { Card } from '../atoms';
import React, { useEffect, useRef } from 'react';

interface Props { assistantName: string; mode: string; transcript: string }
const pulseMap: Record<string, string> = {
  'Ожидание': 'from-gray-500/40 via-slate-500/20 to-transparent',
  'Слушание': 'from-emerald-400/60 via-teal-400/20 to-transparent'
};

const StatePanel: React.FC<Props> = ({ assistantName, mode }) => {
  return (
    <div className='px-3 pb-4 pt-2 space-y-4 overflow-y-auto h-full custom-scrollbar relative'>
      <div className='relative'>
        <div/>
        <Card className='shadow-inner backdrop-blur-[1px]' title='Помощник'>
          <div className='text-sm font-medium tracking-wide'>{assistantName || '—'}</div>
        </Card>
      </div>
      <Card title='Режим'>
        <div className='text-sm flex items-center gap-2'>
          <span className='relative flex h-2.5 w-2.5'>
            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-40'></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${mode==='Слушание' ? 'bg-emerald-400':'bg-sky-400'}`}></span>
          </span>
          {mode}
        </div>
      </Card>
    </div>
  );
};

export default StatePanel;
