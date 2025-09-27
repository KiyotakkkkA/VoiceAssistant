import ReactDOM from 'react-dom/client';
import '../css/index.css';
import { useEffect, useState } from 'react';
import { socketClient } from './clients';
import { MainLayout } from './ui/layouts/MainLayout';
import { Router } from './Router';
import { GlobalContext } from './providers';
import { ToastProvider } from './providers/ToastProvider';
import { NavigationProvider } from './providers/NavigationProvider';
import { observer } from 'mobx-react-lite';
import { EventsTopic } from '../js/enums/Events';

import SettingsStore from './store/SettingsStore';
import ModulesStore from './store/ModulesStore';
import NotesStore from './store/NotesStore';
import AIMessagesStore from './store/AIMessagesStore';
import StreamingAIStore from './store/StreamingAIStore';
import InitiationStore from './store/InitiationStore';

interface IncomingMsg { type: string; topic: string; payload: any; from?: string }

declare const __ASSISTANT_NAME__: string;

const AppContent = observer(() => {
  const [messages, setMessages] = useState<IncomingMsg[]>([]);
  const [mode, setMode] = useState<'waiting' | 'listening' | "initializing" | "thinking">('initializing');
  const [transcript, setTranscript] = useState({});
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

  const setNotesData = (m: any) => {
    NotesStore.applyNotesData(m?.payload?.data?.notes || { notesList: {}, structure: [] });
  };

  const setInitialState = (m: any) => {
    InitiationStore.applyInitState(m?.payload?.data?.initialState || { 
      voskModel: { exists: false, isDownloading: false }
    });
  };

  const setThemesData = (m: any) => {
    SettingsStore.data.runtime['runtime.appearance.themesList'] = m?.payload?.data?.themes?.themesList;
    SettingsStore.applySettings(m?.payload?.data?.settings);
    setTheme(m?.payload?.data?.themes?.currentThemeData || null);
  }

  const setModulesRegisteredData = (m: any) => {
    ModulesStore.applyModulesRegisteredData(m?.payload?.service, {
      service_id: m?.payload?.service || 'Неизвестный модуль',
      service_name: m?.payload?.service_name || '[Нет имени]',
      service_desc: m?.payload?.service_desc || '[Нет описания]',
      enabled: false,
      isReloading: false,
      isEnabling: false,
      isDisabling: false,
    });
  };

  const setModulesInitedData = (m: any) => {
    ModulesStore.enableModule(m?.payload?.service);

    if (InitiationStore.state.voskModel.isDownloading && m?.payload?.service === 'speech_rec_module') {
      InitiationStore.state.voskModel.isDownloading = false
      InitiationStore.state.voskModel.exists = true
    }
  };

  const setModulesStoppedData = (m: any) => {
    ModulesStore.stopModule(m?.payload?.service);
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

  const setActiveDialog = (m: any) => {
    const dialogId = m?.payload?.dialog_id;
    if (dialogId) {
      const existing = AIMessagesStore.data.dialogs.find(d => d.id === dialogId);
      if (!existing) {
        AIMessagesStore.data.dialogs.push({
          id: dialogId,
          title: 'Диалог',
          messages: [],
          created_at: new Date(),
          updated_at: new Date(),
          is_active: false
        });
      }
      AIMessagesStore.setActiveDialog(dialogId);
    }
  }

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
      SettingsStore.applySettings(m?.payload?.data?.settings);
      setThemesData(m);
      setNotesData(m);
      setInitialState(m);
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
      SettingsStore.applySettings(m?.payload?.data?.settings);
    },
    [EventsTopic.JSON_ACCOUNT_DATA_SET]: (m: any) => {
      SettingsStore.applySettings(m?.payload?.data?.settings);
      setSystemReady(true);
      setMode('waiting');
    },
    [EventsTopic.JSON_DIALOGS_DATA_SET]: (m: any) => {
      AIMessagesStore.applyDialogsData(m?.payload?.data?.dialogs);
    },
    [EventsTopic.JSON_ACTIVE_DIALOG_SET]: (m: any) => {
      setActiveDialog(m);
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
        systemReady={systemReady}
      >
        <Router
          mode={mode}
          systemReady={systemReady}
        />
      </MainLayout>
    </GlobalContext>
  
  );
});

const App = () => (
  <ToastProvider>
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  </ToastProvider>
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
  