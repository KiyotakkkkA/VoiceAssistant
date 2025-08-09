import React from 'react';
import { Card } from '../atoms/Card';

interface Props { assistantName: string; mode: string; transcript: string }
export const StatePanel: React.FC<Props> = ({ assistantName, mode, transcript }) => (
  <div className='px-3 pb-3 space-y-3 overflow-y-auto'>
    <Card title='Помощник'>
      <div className='text-sm'>{assistantName || '—'}</div>
    </Card>
    <Card title='Режим'>
      <div className='text-sm'>{mode}</div>
    </Card>
  </div>
);
