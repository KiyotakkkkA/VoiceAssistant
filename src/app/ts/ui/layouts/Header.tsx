import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

interface HeaderProps {
  assistantName?: string;
  logOpened?: boolean;
  onToggleLog?: () => void;
}

const Header: React.FC<HeaderProps> = observer(({ assistantName, logOpened, onToggleLog }) => {

    const handleToggleLog = useCallback(() => {
        if (onToggleLog) {
            onToggleLog();
        }
    }, [onToggleLog]);

    return (
        <div className='h-9 flex items-center justify-between px-4 text-[11px] bg-ui-bg-secondary border-b border-ui-border-primary select-none shadow-inner'>
            <div className='flex items-center gap-3'>
                <span className='text-xs text-ui-text-secondary uppercase tracking-wider'>Голосовой ассистент - <span className='text-ui-text-accent font-medium'>{assistantName}</span></span>
            </div>
            <div className='flex items-center gap-2 text-ui-text-secondary'>
                <button onClick={() => {handleToggleLog()}} 
                    className='px-2 py-0.5 rounded bg-ui-bg-secondary-light/50 hover:bg-ui-bg-secondary-light text-xs border border-ui-border-primary transition-colors'>{
                        logOpened?'Закрыть панель событий':'Открыть панель событий'
                    }
                </button>
            </div>
        </div>
    )
});

export { Header };