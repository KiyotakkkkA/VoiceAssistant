import React, { useCallback } from "react";
import { IconZix } from "../../../atoms/icons";

interface ZixAccountPanelProps {
  isConnected: boolean;
  accountData: {
    username?: string;
    email?: string;
    plan?: string;
    apiKey?: string;
  } | null;
  isConnecting?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const ZixAccountPanel: React.FC<ZixAccountPanelProps> = ({
  isConnected,
  accountData,
  isConnecting = false,
  onConnect = () => {},
  onDisconnect = () => {},
}) => {
  const handleConnectClick = useCallback(() => {
    onConnect();
  }, [onConnect]);

  const handleDisconnectClick = useCallback(() => {
    onDisconnect();
  }, [onDisconnect]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-ui-text-primary mb-2">
          Информация об аккаунте
        </h3>
        
        {isConnected && accountData ? (
          <div className="bg-ui-bg-secondary/30 border border-ui-border-primary/30 rounded-lg p-4 space-y-3">
            {/* User Info Card */}
            <div className="flex items-center gap-3 p-3 bg-ui-bg-primary/50 rounded-md">
              <div className="w-8 h-8 bg-widget-accent-a rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {(accountData.username ?? "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ui-text-primary text-sm truncate">
                  {accountData.username ?? "—"}
                </p>
                <p className="text-xs text-ui-text-muted truncate">
                  {accountData.email ?? "—"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center py-2">
                <span className="text-ui-text-secondary text-sm">План:</span>
                <span className="px-2 py-1 bg-widget-accent-a/20 text-ui-text-accent rounded text-xs font-medium">
                  {accountData.plan ?? "—"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-ui-text-secondary text-sm">API Key:</span>
                <span className="font-mono text-xs text-ui-text-primary">
                  {accountData.apiKey ?? "—"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-ui-text-secondary text-sm">Статус:</span>
                <span className="text-green-400 text-sm">● Активен</span>
              </div>
            </div>

            <button
              onClick={handleDisconnectClick}
              className="w-full px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-md text-sm font-medium transition-colors"
            >
              Отключить аккаунт
            </button>
          </div>
        ) : (
          <div className="bg-ui-bg-secondary/30 border border-ui-border-primary/30 rounded-lg p-4 space-y-3">
            <p className="text-ui-text-secondary text-sm leading-relaxed">
              Аккаунт Zix не подключен. Подключите свой аккаунт для получения
              доступа к расширенным функциям.
            </p>
            <button
              onClick={handleConnectClick}
              disabled={isConnecting}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-widget-accent-a text-white rounded-md text-sm font-medium transition-colors ${
                isConnecting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-widget-accent-a/80"
              }`}
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Подключение...
                </>
              ) : (
                <>
                  <IconZix size={16} />
                  Подключить аккаунт Zix
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
