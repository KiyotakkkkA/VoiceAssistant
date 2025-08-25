import { useEffect, useState } from "react";

const TimeTracker = () => {
    const [, forceTick] = useState(0);
    useEffect(()=>{ const id = window.safeTimers.setInterval(() => forceTick(x=>x+1),1000); return () => window.safeTimers.clearInterval(id); },[]);
    const now = new Date();
    const hh = now.getHours().toString().padStart(2,'0');
    const mm = now.getMinutes().toString().padStart(2,'0');
    const ss = now.getSeconds().toString().padStart(2,'0');
    const dateStr = now.toLocaleDateString('ru-RU', { weekday:'long', day:'numeric', month:'long'});
    const gmt = now.getTimezoneOffset() / -60;

    return (
        <div className='pointer-events-none z-10'>
            <div className='clock-card border border-ui-border-primary bg-ui-bg-secondary/95 relative px-5 py-3 rounded-lg shadow-[0_4px_18px_-6px_rgba(0,0,0,0.45)] backdrop-blur-md min-w-[172px] overflow-hidden'>
                <div className='absolute inset-0 opacity-[0.18] bg-[radial-gradient(circle_at_80%_15%,rgba(0,122,204,0.35),transparent_60%)]' />
                    <div className='relative'>
                        <div className='flex items-center justify-between mb-1'>
                        <div className='text-[10px] tracking-[0.2em] uppercase text-widget-muted font-medium'>ВРЕМЯ</div>
                        <div className='h-[3px] w-8 rounded-full bg-gradient-to-r from-widget-accent-a to-widget-accent-b opacity-70' />
                        </div>
                        <div className='flex items-end gap-1 leading-none'>
                            <span className='text-[40px] font-light -tracking-[1px] tabular-nums'>{hh}:{mm}</span>
                        <span className='text-sm font-medium text-widget-muted pb-1'>:{ss}</span>
                        </div>
                    <div className='text-[11px] mt-1 text-widget-muted capitalize leading-snug'>
                        {dateStr}
                    </div>
                    <div className='text-[11px] mt-1 text-widget-muted capitalize leading-snug'>
                        {gmt >= 0 ? `GMT+${gmt}` : `GMT${gmt}`}
                    </div>
                </div>
            </div>
        </div>
    )
}

export { TimeTracker };