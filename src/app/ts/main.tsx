import ReactDOM from 'react-dom/client';
import '../css/index.css';
import { useEffect, useState } from 'react';
import { socketClient } from './utils';
import { MainLayout } from './ui/templates/MainLayout';

interface IncomingMsg { type: string; payload: any; from?: string }

declare const __ASSISTANT_NAME__: string;

const App = () => {
  const [messages, setMessages] = useState<IncomingMsg[]>([]);
  const [mode, setMode] = useState<'Ожидание' | 'wake' | 'Слушание' | "Инициализация">('Инициализация');
  const [transcript, setTranscript] = useState({});
  const [apps, setApps] = useState<Record<string, any>>({});
  const [toasts, setToasts] = useState<{id:string; message:string;}[]>([]);
  const [systemReady, setSystemReady] = useState(false);

  const handleWake = () => {
    setMode('Слушание');
  };

  const handleTranscript = (m: any) => {
    setTranscript(m || '');
    setMode('Ожидание');
  };

  const handleYamlConfig = (m: any) => {
    const receivedApps = m?.payload?.data?.apps?.applications;
    if (receivedApps && typeof receivedApps === 'object') {
      setApps(receivedApps);
    }
  };

  const handleUiShowSetVolume = (m: any) => {
    const lvlRaw = m?.payload?.text?.result?.level;
    let level: number | undefined;
    if (typeof lvlRaw === 'number') {
      level = lvlRaw <= 1 ? Math.round(lvlRaw * 100) : Math.round(lvlRaw);
    } else if (typeof lvlRaw === 'string') {
      const parsed = parseFloat(lvlRaw.replace(/[^0-9.,]/g,'').replace(',','.'));
      if (!isNaN(parsed)) level = parsed <= 1 ? Math.round(parsed*100) : Math.round(parsed);
    }
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const message = `Громкость: ${level !== undefined ? level+'%' : '?'}`;
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
    setMode('Ожидание');
  };

  const bindings = {
    wake: handleWake,
    transcript: handleTranscript,
    set_yaml_configs: handleYamlConfig,
    ui_show_set_volume: handleUiShowSetVolume,
    python_ready: () => {
      setSystemReady(true);
      setMode('Ожидание');
    }
  };

  useEffect(() => {
    const unsubscribe = socketClient.subscribe(m => {
      setMessages(prev => [...prev, m].slice(-500));
      const handler = bindings[m.type as keyof typeof bindings];
      if (handler) {
        handler(m);
      }
    });
  return () => { unsubscribe(); };
  }, []);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    socketClient.send({ type: 'ui_message', from: 'ui', payload: text.trim() });
  };

  return <MainLayout assistantName={__ASSISTANT_NAME__} mode={mode} transcript={transcript as any} messages={messages} onSend={handleSend} apps={apps} toasts={toasts} systemReady={systemReady} />;
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
