import { observer } from 'mobx-react-lite';
import { TextInput } from '../../../atoms/input';
import { useState } from 'react';
import { IconGithub, IconPen } from '../../../atoms/icons';

const AccountsView: React.FC = observer(() => {

    const [githubLink, setGithubLink] = useState<string>('');
    const [githubPublicKey, setGithubPublicKey] = useState<string>('');

    return (
        <div className="space-y-6 w-full">
            <div className="flex flex-col gap-4 border-b border-ui-border-primary pb-4">
                <div className='flex items-center gap-4'>
                    <IconGithub size={32} className="text-ui-text-primary" />    
                    <TextInput
                        disabled
                        className='w-[750px]'
                        value={githubLink}
                        onChange={(e) => setGithubLink(e.target.value)}
                        placeholder="Ссылка на GitHub ..."
                    />
                    <button
                        className="w-[40px] h-[40px] flex items-center justify-center px-2 py-1 bg-ui-text-secondary/20 text-ui-text-secondary text-xs rounded hover:bg-green-500/20 hover:text-green-400 transition-colors"
                        onClick={() => {}}
                        title="Редактировать"
                    >
                        <IconPen size={18} />
                    </button>
                </div>
                <div className='flex items-center gap-4'>
                    <IconGithub size={32} className="text-ui-text-primary" />    
                    <TextInput
                        disabled
                        className='w-[750px]'
                        value={githubPublicKey}
                        onChange={(e) => setGithubPublicKey(e.target.value)}
                        placeholder="Публичный ключ ..."
                    />
                    <button
                        className="w-[40px] h-[40px] flex items-center justify-center px-2 py-1 bg-ui-text-secondary/20 text-ui-text-secondary text-xs rounded hover:bg-green-500/20 hover:text-green-400 transition-colors"
                        onClick={() => {}}
                        title="Редактировать"
                    >
                        <IconPen size={18} />
                    </button>
                </div>
            </div>
        </div>
  );
});

export { AccountsView };
