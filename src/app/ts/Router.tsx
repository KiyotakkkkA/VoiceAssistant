import React from 'react';
import { GContext, useNavigation } from './providers';
import { Visualizer } from './ui/organisms/home';
import { AppsGrid } from './ui/organisms/applications';
import { SettingsPanel } from './ui/organisms/settings';
import { NotesView } from './ui/organisms/notes';
import { ZixView } from './ui/organisms/zix';
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
      component: <Visualizer mode={mode} systemReady={systemReady} />,
      fullmode: false
    },
    zix: {
      component: <ZixView />,
      fullmode: true
    },
    apps: {
      component: <AppsGrid />,
      fullmode: true
    },
    settings: {
      component: <SettingsPanel />,
      fullmode: true
    },
    notes: {
      component: <NotesView />,
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
