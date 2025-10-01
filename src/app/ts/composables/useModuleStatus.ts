import { useCallback } from 'react';

export interface ModuleStatusConfig {
  text: string;
  bgStyle: string;
  circleStyle: string;
}

export const useModuleStatus = () => {
  const getStatusConfig = useCallback((
    isEnabled: boolean,
    isReloading: boolean,
    isEnabling: boolean,
    isDisabling: boolean
  ): ModuleStatusConfig => {
    const configs = {
      enabled: {
        text: "Активен",
        bgStyle: "bg-green-500/10 text-green-400 border border-green-500/20",
        circleStyle: "bg-green-400"
      },
      enabling: {
        text: "Включается...",
        bgStyle: "bg-green-500/10 text-green-400 border border-green-500/20",
        circleStyle: "bg-green-400"
      },
      disabling: {
        text: "Отключается...",
        bgStyle: "bg-red-500/10 text-red-400 border border-red-500/20",
        circleStyle: "bg-red-400"
      },
      reloading: {
        text: "Перезапускается...",
        bgStyle: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
        circleStyle: "bg-blue-400"
      },
      disabled: {
        text: "Неактивен",
        bgStyle: "bg-red-500/10 text-red-400 border border-red-500/20",
        circleStyle: "bg-red-400"
      }
    };

    if (isEnabling) return configs.enabling;
    if (isDisabling) return configs.disabling;
    if (isReloading) return configs.reloading;
    if (!isEnabled) return configs.disabled;
    return configs.enabled;
  }, []);

  const getButtonConfig = useCallback((
    isEnabled: boolean,
    isReloading: boolean,
    isEnabling: boolean,
    isDisabling: boolean
  ) => {
    return {
      showDisable: isEnabled && !isReloading && !isDisabling,
      showReload: isEnabled && !isDisabling && !isReloading,
      showEnable: !isEnabled && !isEnabling,
      disableText: isDisabling ? 'Отключается...' : 'Отключить',
      reloadText: isReloading ? 'Перезапускается...' : 'Перезапустить',
      enableText: isEnabling ? 'Включается...' : 'Включить'
    };
  }, []);

  return {
    getStatusConfig,
    getButtonConfig
  };
};
