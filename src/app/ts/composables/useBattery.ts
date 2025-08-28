import { useState, useEffect } from 'react';

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

  const getBatteryColor = () => {
    if (batteryInfo.level !== null && batteryInfo.level <= 20) {
      return 'from-widget-danger to-red-700';
    }
    return 'from-widget-accent-b to-widget-accent-a';
  };

  const getBatteryIcon = () => {
    if (batteryInfo.charging) return '⚡';
    if (batteryInfo.level !== null && batteryInfo.level <= 20) return '🔋';
    return '🔌';
  };

  const getBatteryLabel = () => {
    if (batteryInfo.charging === true) return 'Заряжается';
    if (batteryInfo.charging === false) return 'Не заряжается';
    return 'Батарея';
  };

  return {
    ...batteryInfo,
    getBatteryColor,
    getBatteryIcon,
    getBatteryLabel
  };
};
