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

      console.log('Event panel state set to:', m.payload.data.settings['ui.current.event.panel.state']);
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

  const setNewMsg = (m: any) => {
    if (m?.payload?.original_text) {
      AIMessagesStore.data.aiMsgHistory.push({
        model_name: 'user',
        text: m.payload.original_text,
        timestamp: new Date()
      });
      
      AIMessagesStore.addMessageToActiveDialog(
        m.payload.original_text,
        'user'
      );
    }
    
    if (m?.payload?.data?.additional?.external_ai_answer) {
      AIMessagesStore.data.aiMsgHistory.push({
        model_name: m.payload.data.additional.model_name || 'unknown',
        text: m.payload.data.additional.external_ai_answer,
        timestamp: new Date()
      });
      
      AIMessagesStore.addMessageToActiveDialog(
        m.payload.data.additional.external_ai_answer,
        'assistant',
        m.payload.data.additional.model_name || 'unknown'
      );
    }

    console.log('AI Answer received:', m?.payload?.data?.additional?.external_ai_answer);

    setMode('waiting');
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
    [EventsTopic.JSON_INITAL_DATA_SET]: (m: any) => {
      setThemesData(m);
      setApikeysData(m);
      setEventPanelState(m);
      setNotesData(m);
    },
    [EventsTopic.JSON_THEMES_DATA_SET]: (m: any) => {
      setThemesData(m);
    },
    [EventsTopic.JSON_EVENT_PANEL_STATE_SET]: (m: any) => {
      setEventPanelState(m);
    },
    [EventsTopic.JSON_APIKEYS_DATA_SET]: (m: any) => {
      setApikeysData(m);
    },
    [EventsTopic.SERVICE_WAS_DISABLED]: (m: any) => {
      setModulesStoppedData(m);
    },
    [EventsTopic.HAVE_TO_BE_REFETCHED_NOTES_STRUCTURE_DATA]: (m: any) => {
      setNotesData(m);
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
  