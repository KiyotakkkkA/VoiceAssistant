import React, { useState } from 'react';
import { IconZix } from '../../atoms/icons';
import { ZixAccountPanel } from '../../molecules/widgets/zix';

export const ZixView: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [accountData, setAccountData] = useState<any>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      setAccountData({
        username: 'zix_user',
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
        <aside className="w-[320px] border-r border-ui-border-primary bg-ui-bg-primary-light p-4">
          <ZixAccountPanel
            isConnected={isConnected}
            accountData={accountData}
            isConnecting={isConnecting}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-20 border-b border-ui-border-primary bg-ui-bg-primary-light">
            <div className="h-full px-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-widget-accent-a rounded-xl flex items-center justify-center">
                <IconZix size={28} className="text-white" />
              </div>
              <h1 className="text-xl font-bold">Zix Integration</h1>
            </div>
          </header>
        </main>
      </div>
    </div>
  );
};
