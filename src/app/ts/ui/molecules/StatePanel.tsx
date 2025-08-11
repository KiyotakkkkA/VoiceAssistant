import { Card } from '../atoms';
import React, { useContext } from 'react';
import { GContext } from '../../providers';

interface Props { assistantName: string; mode: string; transcript: string | Object }
const StatePanel: React.FC<Props> = ({ assistantName, mode }) => {

  const ctx = useContext(GContext);

  if (!ctx?.states) return null;

  const stateColors = {
    'listening': 'bg-emerald-400',
    'waiting': 'bg-sky-500',
    'initializing': 'bg-red-400'
  }

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
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${stateColors[mode as keyof typeof stateColors]}`}></span>
          </span>
          {ctx.states[mode]}
        </div>
      </Card>
    </div>
  );
};

export default StatePanel;
