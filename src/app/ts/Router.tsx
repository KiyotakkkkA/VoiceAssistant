import React from 'react';
import { GContext, useNavigation } from './providers';
import { 
  HomePage,
  ZixPage,
  SettingsPage,
  AppsPage
} from './ui/pages';
import { NotesPage } from './ui/pages/NotesPage';
import { RightNav } from './ui/layouts/RightNav';
import { observer } from 'mobx-react-lite';

interface Props {
  mode: string;
  systemReady?: boolean;
}

export const Router: React.FC<Props> = observer(({ mode, systemReady=false }) => {

  const ctx = React.useContext(GContext);
  const { activeTab } = useNavigation();

  if (!ctx?.states) return null;

  const pages: Record<string, Record<string, React.ReactNode>> = {
    home: {
      component: <HomePage mode={mode} systemReady={systemReady} />,
      fullmode: false
    },
    zix: {
      component: <ZixPage />,
      fullmode: true
    },
    apps: {
      component: <AppsPage />,
      fullmode: true
    },
    settings: {
      component: <SettingsPage />,
      fullmode: true
    },
    notes: {
      component: <NotesPage />,
      fullmode: true
    }
  };

  return (
    <div className='flex-1 relative flex'>
      <div className='flex-1 relative'>
        <div className={`${pages[activeTab].fullmode ? 'h-full' : ''}`}>
          {pages[activeTab].component}
        </div>
      </div>
      <RightNav />
    </div>
  );
});
