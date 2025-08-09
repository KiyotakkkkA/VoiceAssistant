import ReactDOM from 'react-dom/client';
import '../css/index.css';
import { useEffect, useState } from 'react';
import { socketClient } from './utils/SocketClient';
import { MainLayout } from './ui/templates/MainLayout';

interface IncomingMsg { type: string; payload: any; from?: string }

declare const __ASSISTANT_NAME__: string;

const App = () => {
  const [messages, setMessages] = useState<IncomingMsg[]>([]);
  const [mode, setMode] = useState<'Ожидание' | 'wake' | 'Слушание'>('Ожидание');
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    const unsubscribe = socketClient.subscribe(m => {
      setMessages(prev => [...prev, m].slice(-500));
      if (m.type === 'wake') {
        setMode('Слушание');
      } else if (m.type === 'transcript') {
        setTranscript(m.payload || '');
        setMode('Ожидание');
      }
    });
  return () => { unsubscribe(); };
  }, []);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    socketClient.send({ type: 'ui_message', from: 'ui', payload: text.trim() });
  };

  return <MainLayout assistantName={__ASSISTANT_NAME__} mode={mode} transcript={transcript} messages={messages} onSend={handleSend} />;
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
