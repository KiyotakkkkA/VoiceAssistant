import React, { useState } from 'react';
import { IconAiva } from '../../atoms/icons';
import { AivaAccountPanel } from '../../molecules/widgets/aiva';

interface Props {}

export const AivaView: React.FC<Props> = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [accountData, setAccountData] = useState<{
    email?: string;
    username?: string;
    plan?: string;
    apiKey?: string;
  } | null>(null);

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
    } catch (e) {
      console.error(e);
      setIsConnected(false);
      setAccountData(null);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAccountData(null);
  };

  return (
    <div className='h-full flex flex-col bg-ui-bg-primary text-ui-text-primary overflow-hidden'>
      <div className='p-6 border-b border-ui-border-primary bg-ui-bg-primary-light'>
        <div className='flex items-center gap-4'>
          <div className='w-16 h-16 bg-widget-accent-a rounded-2xl flex items-center justify-center shadow-xl'>
            <IconAiva size={36} className="text-white" />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-ui-text-primary'>Aiva Integration</h1>
            <p className='text-ui-text-muted mt-1'>Подключите ваш аккаунт Aiva для использования дополнительных возможностей</p>
          </div>
        </div>
      </div>

      <div className='flex-1 flex overflow-hidden max-w-[400px]'>
        <AivaAccountPanel 
          isConnected={isConnected}
          accountData={accountData as any}
          isConnecting={isConnecting}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
      </div>
    </div>
  );
};
