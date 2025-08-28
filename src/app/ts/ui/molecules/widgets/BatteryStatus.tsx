import React from "react";
import { useBattery } from "../../../composables";
import { WidgetCard } from "./WidgetCard";

const BatteryStatus = () => {
    const { level, charging, getBatteryColor, getBatteryIcon, getBatteryLabel } = useBattery();
    
    const color = getBatteryColor();
    const icon = getBatteryIcon();
    const label = getBatteryLabel();

    const gradientIcon = (
        <div className={`h-[3px] w-8 rounded-full bg-gradient-to-r ${color} opacity-70`} />
    );

    return (
        <WidgetCard 
            title="БАТАРЕЯ" 
            icon={gradientIcon}
            gradientColor="rgba(0,122,204,0.3)"
        >
            <div className='flex items-end gap-2 leading-none'>
                <span className={`text-lg font-semibold ${
                    level !== null && level <= 20 ? 'text-widget-danger' : 'text-widget-success'
                }`}>
                    {icon} {level !== null ? level + '%' : '—'}
                </span>
            </div>
            <div className='text-[11px] mt-1 text-widget-muted leading-snug'>{label}</div>
        </WidgetCard>
    );
};

export { BatteryStatus };
