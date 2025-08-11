import { Card } from '../atoms';
import React, { useContext } from 'react';
import { GContext } from '../../providers';

interface Props { assistantName: string; mode: string; transcript: string | Object }
const StatePanel: React.FC<Props> = ({ assistantName, mode }) => {

  const ctx = useContext(GContext);

  if (!ctx?.states) return null;

  const stateColors = {
    'listening': {
      main: 'bg-emerald-400',
      alphaGradient: 'rgba(20,184,166,0.12)'
    },
    'waiting': {
      main: 'bg-sky-500',
      alphaGradient: 'rgba(0,112,204,0.12)'
    },
    'initializing': {
      main: 'bg-red-400',
      alphaGradient: 'rgba(255,0,0,0.12)'
    }
  }

  return (
    <div className='px-3 pb-4 pt-2 space-y-4 overflow-y-auto h-full custom-scrollbar relative'>
      <div className='relative'>
        <div/>
        <Card className='shadow-inner backdrop-blur-[1px]' title='Помощник' gradientColor={stateColors[mode as keyof typeof stateColors].alphaGradient}>
          <div className='text-sm font-medium tracking-wide'>{assistantName || '—'}</div>
        </Card>
      </div>
      <Card title='Режим' gradientColor={stateColors[mode as keyof typeof stateColors].alphaGradient}>
        <div className='text-sm flex items-center gap-2'>
          <span className='relative flex h-2.5 w-2.5'>
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${stateColors[mode as keyof typeof stateColors].main} opacity-40`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${stateColors[mode as keyof typeof stateColors].main}`}></span>
          </span>
          {ctx.states[mode]}
        </div>
      </Card>
    </div>
  );
};

export default StatePanel;
