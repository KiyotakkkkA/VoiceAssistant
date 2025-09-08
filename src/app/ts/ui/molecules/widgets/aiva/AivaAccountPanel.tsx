import React, { useCallback } from "react";
import { IconAiva } from "../../../atoms/icons";

interface AivaAccountPanelProps {
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

export const AivaAccountPanel: React.FC<AivaAccountPanelProps> = ({
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
    <div className="bg-ui-bg-primary-light p-6">
      <h3 className="text-xl font-semibold text-ui-text-primary mb-4">
        Информация об аккаунте
      </h3>

      {isConnected && accountData ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-ui-bg-primary rounded-lg">
            <div className="w-10 h-10 bg-widget-accent-a rounded-full flex items-center justify-center text-ui-text-primary font-semibold">
              {(accountData.username ?? "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-ui-text-primary">
                {accountData.username ?? "—"}
              </p>
              <p className="text-sm text-ui-text-muted">
                {accountData.email ?? "—"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-ui-border-primary">
              <span className="text-ui-text-secondary">План подписки:</span>
              <span className="px-3 py-1 bg-widget-accent-a text-ui-text-secondary rounded-full text-sm font-medium">
                {accountData.plan ?? "—"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-ui-border-primary">
              <span className="text-ui-text-secondary">API Key:</span>
              <span className="font-mono text-sm text-ui-text-primary">
                {accountData.apiKey ?? "—"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-ui-text-secondary">Статус:</span>
              <span className="text-green-400">Активен</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-2">
          {!isConnected ? (
            <div className="space-y-4">
              <p className="text-ui-text-secondary leading-relaxed">
                Аккаунт Aiva не подключен. Подключите свой аккаунт для получения
                доступа к расширенным функциям.
              </p>
              <button
                onClick={handleConnectClick}
                disabled={isConnecting}
                className={`w-full flex items-center justify-center gap-3 px-6 py-3 bg-widget-accent-a text-ui-text-primary rounded-xl font-medium transition-all duration-200 ${
                  isConnecting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-lg hover:scale-[1.02]"
                }`}
              >
                {isConnecting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Подключение...
                  </>
                ) : (
                  <>
                    <IconAiva size={20} />
                    Подключить аккаунт Aiva
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 font-medium">
                  ✓ Аккаунт Aiva успешно подключен!
                </p>
                <p className="text-ui-text-muted text-sm mt-1">
                  Все функции ИИ теперь доступны
                </p>
              </div>
              <button
                onClick={handleDisconnectClick}
                className="w-full px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl font-medium transition-colors"
              >
                Отключить аккаунт
              </button>
            </div>
          )}
          <hr className="border-ui-border-primary mt-4" />
        </div>
      )}
    </div>
  );
};
