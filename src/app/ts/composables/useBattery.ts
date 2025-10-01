import { useState, useEffect, useCallback } from 'react';

interface BatteryInfo {
  level: number | null;
  charging: boolean | null;
}

export const useBattery = () => {
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo>({
    level: null,
    charging: null
  });

  useEffect(() => {
    let battery: any = null;
    let mounted = true;
    
    const nav = navigator as Navigator & { getBattery?: () => Promise<any> };
    
    if (typeof nav.getBattery === 'function') {
      nav.getBattery().then((b: any) => {
        battery = b;
        
        const update = () => {
          if (!mounted) return;
          setBatteryInfo({
            level: Math.round(b.level * 100),
            charging: b.charging
          });
        };
        
        update();
        battery.addEventListener('levelchange', update);
        battery.addEventListener('chargingchange', update);
      });
    }
    
    return () => {
      mounted = false;
      if (battery) {
        battery.removeEventListener('levelchange', () => {});
        battery.removeEventListener('chargingchange', () => {});
      }
    };
  }, []);

  const getBatteryColor = useCallback(() => {
    if (batteryInfo.level !== null && batteryInfo.level <= 20) {
      return 'from-widget-danger to-red-700';
    }
    return 'from-widget-accent-b to-widget-accent-a';
  }, [batteryInfo.level]);

  const getBatteryIcon = useCallback(() => {
    if (batteryInfo.charging) return '⚡';
    if (batteryInfo.level !== null && batteryInfo.level <= 20) return '🔋';
    return '🔌';
  }, [batteryInfo.charging, batteryInfo.level]);

  const getBatteryLabel = useCallback(() => {
    if (batteryInfo.charging === true) return 'Заряжается';
    if (batteryInfo.charging === false) return 'Не заряжается';
    return 'Батарея';
  }, [batteryInfo.charging]);

  return {
    ...batteryInfo,
    getBatteryColor,
    getBatteryIcon,
    getBatteryLabel
  };
};
