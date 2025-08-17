import { useEffect, useState } from "react";

const BatteryStatus = () => {
    const [level, setLevel] = useState<number|null>(null);
    const [charging, setCharging] = useState<boolean|null>(null);

    useEffect(() => {
        let battery: any = null;
        let mounted = true;
        const nav = navigator as Navigator & { getBattery?: () => Promise<any> };
        if (typeof nav.getBattery === 'function') {
            nav.getBattery().then((b: any) => {
                battery = b;
                function update() {
                    if (!mounted) return;
                    setLevel(Math.round(battery.level * 100));
                    setCharging(battery.charging);
                }
                update();
                battery.addEventListener('levelchange', update);
                battery.addEventListener('chargingchange', update);
            });
        }
        return () => {
            mounted = false;
            if (battery) {
                battery.removeEventListener('levelchange', ()=>{});
                battery.removeEventListener('chargingchange', ()=>{});
            }
        };
    }, []);

    let color = level!==null && level<=20 ? 'from-widget-danger to-red-700' : 'from-widget-accent-b to-widget-accent-a';
    let icon = charging ? '⚡' : level!==null && level<=20 ? '🔋' : '🔌';
    let label = charging===true ? 'Заряжается' : charging===false ? 'Не заряжается' : 'Батарея';
    return (
        <div className='pointer-events-none z-10'>
            <div className='clock-card border border-ui-border-primary bg-widget-bg/95 relative px-5 py-3 rounded-lg shadow-[0_4px_18px_-6px_rgba(0,0,0,0.45)] backdrop-blur-md min-w-[172px] overflow-hidden'>
                <div className='absolute inset-0 opacity-[0.13] bg-[radial-gradient(circle_at_80%_15%,rgba(0,122,204,0.3),transparent_60%)]' />
                <div className='relative'>
                    <div className='flex items-center justify-between mb-1'>
                        <div className='text-[10px] tracking-[0.2em] uppercase text-widget-muted font-medium'>БАТАРЕЯ</div>
                        <div className={`h-[3px] w-8 rounded-full bg-gradient-to-r ${color} opacity-70`} />
                    </div>
                    <div className='flex items-end gap-2 leading-none'>
                        <span className={`text-lg font-semibold ${level!==null && level<=20?'text-widget-danger':'text-widget-success'}`}>{icon} {level!==null? level+'%' : '—'}</span>
                    </div>
                    <div className='text-[11px] mt-1 text-widget-muted leading-snug'>{label}</div>
                </div>
            </div>
        </div>
    );
};

export { BatteryStatus };
