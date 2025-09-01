import ReactDOM from 'react-dom/client';
import '../css/index.css';
import { useEffect, useState } from 'react';
import { socketClient } from './clients';
import { MainLayout } from './ui/templates/MainLayout';
import { GlobalContext } from './providers';
import { ToastProvider } from './providers/ToastProvider';
import { observer } from 'mobx-react-lite';
import { EventsTopic, EventsType } from '../js/enums/Events';

import SettingsStore from './store/SettingsStore';
import ModulesStore from './store/ModulesStore';
import NotesStore from './store/NotesStore';
import AIMessagesStore from './store/AIMessagesStore';
import StreamingAIStore from './store/StreamingAIStore';

interface IncomingMsg { type: string; topic: string; payload: any; from?: string }

declare const __ASSISTANT_NAME__: string;

const AppContent = observer(() => {
  const [messages, setMessages] = useState<IncomingMsg[]>([]);
  const [mode, setMode] = useState<'waiting' | 'listening' | "initializing" | "thinking">('initializing');
  const [transcript, setTranscript] = useState({});
  const [apps, setApps] = useState<Record<string, any>>({});
  const [systemReady, setSystemReady] = useState(false);
  const [theme, setTheme] = useState<Record<string, string> | null>(null);

  const handleWake = () => {
    setMode('listening');
  };

  const handleTranscript = (m: any) => {
    setTranscript(m || '');
  };

  const rawDataTextRecognized = (m: any) => {
    setMode('thinking');
  };

  const setToolsData = (m: any) => {
    if (m?.payload?.data?.tools) {
      SettingsStore.data.tools = {
        ...SettingsStore.data.tools,
        ...m.payload.data.tools
      };
    }
  };

  const setApikeysData = (m: any) => {
    if (m?.payload?.data?.settings) {
      SettingsStore.data.settings = { 
        ...SettingsStore.data.settings, 
        ...m.payload.data.settings 
      };
    }
  }

  const setEventPanelState = (m: any) => {
    if (m?.payload?.data?.settings) {
      SettingsStore.data.settings = { 
        ...SettingsStore.data.settings, 
        ...m.payload.data.settings 
      };
    }
  };

  const setNotesData = (m: any) => {
    if (m?.payload?.data?.notes) {
      NotesStore.notes = m.payload.data.notes;
    }
  };

  const setThemesData = (m: any) => {
    SettingsStore.data.appearance.themes.themeNames = m?.payload?.data?.themes?.themesList;
    SettingsStore.data.settings = { 
          ...SettingsStore.data.settings, 
          ...m.payload.data.settings 
    };
    setTheme(m?.payload?.data?.themes?.currentThemeData || null);
  }

  const setModulesRegisteredData = (m: any) => {
    ModulesStore.modules = {
      ...ModulesStore.modules,
      [m?.payload?.service]: {
        service_id: m?.payload?.service || 'Неизвестный модуль',
        service_name: m?.payload?.service_name || '[Нет имени]',
        service_desc: m?.payload?.service_desc || '[Нет описания]',
        enabled: false,
        isReloading: false,
        isEnabling: false,
        isDisabling: false,
      }
    };
  };

  const setModulesInitedData = (m: any) => {
    ModulesStore.modules = {
      ...ModulesStore.modules,
      [m?.payload?.service]: {
        ...ModulesStore.modules[m?.payload?.service],
        enabled: true,
      }
    };
  };

  const setModulesStoppedData = (m: any) => {
    ModulesStore.modules = {
      ...ModulesStore.modules,
      [m?.payload?.service]: {
        ...ModulesStore.modules[m?.payload?.service],
        isDisabling: false,
        enabled: false,
      }
    };
  }

  const setGlobalMode = (m: any) => {
    SettingsStore.data.runtime['runtime.current.mode'] = m?.payload?.data?.additional?.mode_to;
  };

  const handleStreamStart = (m: any) => {
    const { original_text, model_name } = m.payload?.data || {};
    if (original_text && model_name) {
      StreamingAIStore.startSession(original_text, model_name);
      setMode('thinking');
      
      AIMessagesStore.addMessageToActiveDialog(original_text, 'user');
    }
  };

  const handleStreamChunk = (m: any) => {
    const { type, content, accumulated_thinking, accumulated_content } = m.payload?.data || {};
    if (type && content) {
      StreamingAIStore.addChunk(
        type, 
        content, 
        type === 'thinking' ? accumulated_thinking : accumulated_content
      );
    }
  };

  const handleStreamEnd = (m: any) => {
    const { model_name, final_response } = m.payload?.data || {};
    StreamingAIStore.endSession();
    setMode('waiting');
    
    if (final_response && model_name) {
      AIMessagesStore.addMessageToActiveDialog(
        final_response,
        'assistant',
        model_name
      );
    }
  };

  const bindings = {
    [EventsTopic.SERVICE_WAS_REGISTERED]: (m: any) => {
      setModulesRegisteredData(m);
    },
    [EventsTopic.ACTION_MODE_SET]: (m: any) => {
      setGlobalMode(m);
    },
    [EventsTopic.ACTION_AI_STREAM_START]: handleStreamStart,
    [EventsTopic.ACTION_AI_STREAM_CHUNK]: handleStreamChunk,
    [EventsTopic.ACTION_AI_STREAM_END]: handleStreamEnd,
    [EventsTopic.ACTION_WAKE]: handleWake,
    [EventsTopic.ACTION_TRANSCRIPT]: handleTranscript,
    [EventsTopic.RAW_TEXT_DATA_RECOGNIZED]: rawDataTextRecognized,
    [EventsTopic.JSON_INITAL_DATA_SET]: (m: any) => {
      setThemesData(m);
      setApikeysData(m);
      setEventPanelState(m);
      setNotesData(m);
    },
    [EventsTopic.JSON_THEMES_DATA_SET]: (m: any) => {
      setThemesData(m);
    },
    [EventsTopic.SERVICE_WAS_DISABLED]: (m: any) => {
      setModulesStoppedData(m);
    },
    [EventsTopic.HAVE_TO_BE_REFETCHED_NOTES_STRUCTURE_DATA]: (m: any) => {
      setNotesData(m);
    },
    [EventsTopic.JSON_TOOLS_DATA_SET]: (m: any) => {
      setToolsData(m);
    }
  };

  const specModulesInitActions = {
    ready_speech_rec_module: () => {
      setSystemReady(true);
      setMode('waiting');
    }
  }

  useEffect(() => {
    const unsubscribe = socketClient.subscribe(m => {
      setMessages(prev => [...prev, m].slice(-500));
      const handler = bindings[m.topic as keyof typeof bindings];
      if (handler) {
        handler(m);
      }

      if (m.topic.startsWith('ready_')) {
        setModulesInitedData(m);
        if (specModulesInitActions[m.topic as keyof typeof specModulesInitActions]) {
          specModulesInitActions[m.topic as keyof typeof specModulesInitActions]();
        }
      }

    });
  return () => { unsubscribe(); };
  }, []);

  return (
    <GlobalContext themes={theme || {}}>
      <MainLayout
        assistantName={__ASSISTANT_NAME__}
        mode={mode}
        transcript={transcript as any}
        messages={messages}
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
  