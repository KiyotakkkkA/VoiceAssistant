import React, { useState } from 'react';
import { IconAiva } from '../../atoms/icons';
import { AivaAccountPanel } from '../../molecules/widgets/aiva';

export const AivaView: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [accountData, setAccountData] = useState<any>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      setAccountData({
        username: 'aiva_user',
        email: 'user@example.com',
        plan: 'Pro',
        apiKey: 'sk-live-***',
      });
      setIsConnected(true);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAccountData(null);
  };

  return (
    <div className="h-screen bg-ui-bg-primary text-ui-text-primary">
      <div className="flex h-full">
        <aside className="w-[400px] border-r border-ui-border-primary bg-ui-bg-primary-light p-4">
          <div className="max-w-3xl">
              <AivaAccountPanel
                isConnected={isConnected}
                accountData={accountData}
                isConnecting={isConnecting}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
              />
            </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-24 border-b border-ui-border-primary bg-ui-bg-primary-light">
            <div className="h-full px-6 flex items-center gap-4">
              <div className="w-16 h-16 bg-widget-accent-a rounded-2xl flex items-center justify-center shadow-xl">
                <IconAiva size={36} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold">Aiva Integration</h1>
            </div>
          </header>
        </main>
      </div>
    </div>
  );
};
