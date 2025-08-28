import React from "react";
import { useTimer, useTimeFormatter } from "../../../composables";
import { WidgetCard } from "./WidgetCard";

const TimeTracker = () => {
    useTimer(1000);
    const { formatTimeParts } = useTimeFormatter();
    
    const { hours, minutes, seconds, date, timezone } = formatTimeParts();

    const gradientIcon = (
        <div className='h-[3px] w-8 rounded-full bg-gradient-to-r from-widget-accent-a to-widget-accent-b opacity-70' />
    );

    return (
        <WidgetCard 
            title="ВРЕМЯ" 
            icon={gradientIcon}
            gradientColor="rgba(0,122,204,0.35)"
        >
            <div className='flex items-end gap-1 leading-none'>
                <span className='text-[40px] font-light -tracking-[1px] tabular-nums'>{hours}:{minutes}</span>
                <span className='text-sm font-medium text-widget-muted pb-1'>:{seconds}</span>
            </div>
            <div className='text-[11px] mt-1 text-widget-muted capitalize leading-snug'>
                {date}
            </div>
            <div className='text-[11px] mt-1 text-widget-muted capitalize leading-snug'>
                {timezone >= 0 ? `GMT+${timezone}` : `GMT${timezone}`}
            </div>
        </WidgetCard>
    );
};

export { TimeTracker };