import ReactDOM from 'react-dom/client';
import '../css/index.css';
import { useEffect, useState } from 'react';
import { socketClient } from './utils';
import { MainLayout } from './ui/templates/MainLayout';
import { GlobalContext } from './providers';
import { ToastProvider, useToast } from './providers/ToastProvider';
import { observer } from 'mobx-react-lite';
import { EventsTopic, EventsType } from '../js/enums/Events';

import settingsStore from './store/SettingsStore';

interface IncomingMsg { type: string; topic: string; payload: any; from?: string }

declare const __ASSISTANT_NAME__: string;

const AppContent = observer(() => {
  const [messages, setMessages] = useState<IncomingMsg[]>([]);
  const [mode, setMode] = useState<'waiting' | 'listening' | "initializing">('initializing');
  const [transcript, setTranscript] = useState({});
  const [apps, setApps] = useState<Record<string, any>>({});
  const [systemReady, setSystemReady] = useState(false);
  const [theme, setTheme] = useState<Record<string, string> | null>(null);
  
  const { addToast } = useToast();

  const handleWake = () => {
    setMode('listening');
  };

  const handleTranscript = (m: any) => {
    setTranscript(m || '');
  };

  const rawDataTextRecognized = (m: any) => {
    setMode('waiting');
  };

  const handleyaml = (m: any) => {
    const receivedApps = m?.payload?.data?.apps?.applications;
    if (receivedApps && typeof receivedApps === 'object') {
      setApps(receivedApps);
    }
  };

  const handleUiShowSetVolume = (m: any) => {
    const lvlRaw = m?.payload?.data?.additional?.level;
    let level: number | undefined;
    if (typeof lvlRaw === 'number') {
      level = lvlRaw <= 1 ? Math.round(lvlRaw * 100) : Math.round(lvlRaw);
    } else if (typeof lvlRaw === 'string') {
      const parsed = parseFloat(lvlRaw.replace(/[^0-9.,]/g,'').replace(',','.'));
      if (!isNaN(parsed)) level = parsed <= 1 ? Math.round(parsed*100) : Math.round(parsed);
    }
    const message = `Громкость: ${level !== undefined ? level+'%' : '?'}`;
    addToast(message, 'info', 3500);
    setMode('waiting');
  };

  const handleUiShowSetBrightness = (m: any) => {
    const lvlRaw = m?.payload?.data?.additional?.level;
    let level: number | undefined;
    if (typeof lvlRaw === 'number') level = Math.round(lvlRaw);
    else if (typeof lvlRaw === 'string') {
      const parsed = parseFloat(lvlRaw.replace(/[^0-9.,]/g,'').replace(',','.'));
      if (!isNaN(parsed)) level = Math.round(parsed);
    }
    const message = `Яркость: ${level !== undefined ? level+'%' : '?'}`;
    addToast(message, 'info', 3500);
    setMode('waiting');
  };

  const setApikeysData = (m: any) => {
    if (m?.payload?.data?.settings) {
      settingsStore.data.settings = { 
        ...settingsStore.data.settings, 
        ...m.payload.data.settings 
      };
    }
  }

  const setThemesData = (m: any) => {
    settingsStore.data.appearance.themes.themeNames = m?.payload?.data?.themes?.themesList;
    settingsStore.data.settings = { 
          ...settingsStore.data.settings, 
          ...m.payload.data.settings 
    };
    setTheme(m?.payload?.data?.themes?.currentThemeData || null);
  }

  const setModulesRegisteredData = (m: any) => {
    settingsStore.data.modules = {
      ...settingsStore.data.modules,
      [m?.payload?.service]: {
        service_id: m?.payload?.service || 'Неизвестный модуль',
        service_name: m?.payload?.service_name || '[Нет имени]',
        service_desc: m?.payload?.service_desc || '[Нет описания]',
        enabled: false,
      }
    };
  };

  const setModulesInitedData = (m: any) => {
    settingsStore.data.modules = {
      ...settingsStore.data.modules,
      [m?.payload?.service]: {
        ...settingsStore.data.modules[m?.payload?.service],
        enabled: true,
      }
    };
  };

  const setGlobalMode = (m: any) => {
    settingsStore.data.runtime['runtime.current.mode'] = m?.payload?.data?.additional?.mode_to;
  };

  const setNewMsg = (m: any) => {
    if (m?.payload?.original_text) {
      settingsStore.data.aiMsgHistory.push({
        model_name: 'user',
        text: m.payload.original_text,
        timestamp: new Date()
      });
    }
    
    if (m?.payload?.data?.external_ai_answer) {
      settingsStore.data.aiMsgHistory.push({
        model_name: m.payload.data.model_name || 'unknown',
        text: m.payload.data.external_ai_answer,
        timestamp: new Date()
      });
    }
  };

  const bindings = {
    [EventsTopic.SERVICE_WAS_REGISTERED]: (m: any) => {
      setModulesRegisteredData(m);
    },
    [EventsTopic.ACTION_MODE_SET]: (m: any) => {
      setGlobalMode(m);
    },
    [EventsTopic.ACTION_ANSWERING_AI]: (m: any) => {
      setNewMsg(m);
    },
    [EventsTopic.ACTION_WAKE]: handleWake,
    [EventsTopic.ACTION_TRANSCRIPT]: handleTranscript,
    [EventsTopic.RAW_TEXT_DATA_RECOGNIZED]: rawDataTextRecognized,
    [EventsTopic.YAML_DATA_SET]: handleyaml,
    [EventsTopic.UI_SHOW_SET_VOLUME]: handleUiShowSetVolume,
    [EventsTopic.UI_SHOW_SET_BRIGHTNESS]: handleUiShowSetBrightness,
    [EventsTopic.JSON_INITAL_DATA_SET]: (m: any) => {
      setThemesData(m);
      setApikeysData(m);
    },
    [EventsTopic.JSON_THEMES_DATA_SET]: (m: any) => {
      setThemesData(m);
    },
    [EventsTopic.JSON_APIKEYS_DATA_SET]: (m: any) => {
      setApikeysData(m);
    },
    [EventsTopic.READY_VOICE_RECOGNIZER]: (m: any) => {
      setModulesInitedData(m);
      setSystemReady(true);
      setMode('waiting');
    },
    [EventsTopic.READY_PROCESSOR]: (m: any) => {
      setModulesInitedData(m);
    },
    [EventsTopic.READY_ORCHESTRATOR]: (m: any) => {
      setModulesInitedData(m);
    }
  };

  useEffect(() => {
    const unsubscribe = socketClient.subscribe(m => {
      setMessages(prev => [...prev, m].slice(-500));
      const handler = bindings[m.topic as keyof typeof bindings];
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

  return (
    <GlobalContext themes={theme || {}}>
      <MainLayout
        assistantName={__ASSISTANT_NAME__}
        mode={mode}
        transcript={transcript as any}
        messages={messages}
        onSend={handleSend}
        apps={apps}
        systemReady={systemReady}
      />
    </GlobalContext>
  
  );
});

const App = () => (
  <ToastProvider>
    <AppContent />
  </ToastProvider>
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
  