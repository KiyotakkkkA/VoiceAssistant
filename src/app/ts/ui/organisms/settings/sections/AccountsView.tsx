import { observer } from 'mobx-react-lite';
import { FloatingTextInput } from '../../../atoms/input';
import { useState } from 'react';
import { IconWarning, IconGithub, IconPen, IconCheck, IconX, IconKey } from '../../../atoms/icons';
import { ToolTip } from '../../../atoms/feedback';

import SettingsStore from '../../../../store/SettingsStore';

type DataObject = {
    [key: string]: {
        id: string;
        icon: JSX.Element;
        value: string;
        label: string;
        isChanging: boolean;
        beforeCommitValue: string;
        maybeRequired: boolean;
    };
};

const FieldSet = observer(({ dataObject, setDataObject }: { dataObject: DataObject; setDataObject: React.Dispatch<React.SetStateAction<DataObject>> }) => {

    const handleEdit = (key: string) => {
        setDataObject({ ...dataObject, [key]: { ...dataObject[key], isChanging: true, beforeCommitValue: dataObject[key].value } });
    };

    const handleCommit = (key: string) => {
        setDataObject({ ...dataObject, [key]: { ...dataObject[key], isChanging: false } });
        SettingsStore.updateAccountData([
            { key: dataObject[key].id, value: dataObject[key].value }
        ]);
    };

    const handleCancel = (key: string) => {
        setDataObject({ ...dataObject, [key]: { ...dataObject[key], isChanging: false, value: dataObject[key].beforeCommitValue, beforeCommitValue: '' } });
    };

    return (
        <div className="space-y-4">
            {Object.entries(dataObject).map(([key, { value, label, maybeRequired, isChanging, icon }]) => (
                <div key={key} className='flex items-center gap-4'>
                    {icon}
                    <FloatingTextInput
                        disabled={!isChanging}
                        className={`${isChanging ? 'w-[630px]' : 'w-[690px]'}`}
                        label={label}
                        value={value}
                        onChange={(e) =>
                            setDataObject({ ...dataObject, [key]: { ...dataObject[key], value: e.target.value } })
                        }
                    />
                    {!isChanging ? (
                        <button
                            className="w-[40px] h-[40px] flex items-center justify-center px-2 py-1 bg-ui-text-secondary/20 text-ui-text-secondary text-xs rounded hover:bg-green-500/20 hover:text-green-400 transition-colors"
                            onClick={() => { handleEdit(key); }}
                            title="Редактировать"
                        >
                            <IconPen size={18} />
                        </button>
                    ) : (
                        <div className='flex items-center gap-4 ml-1'>
                            <button
                                className="w-[40px] h-[40px] flex items-center justify-center px-2 py-1 bg-ui-text-secondary/20 text-ui-text-secondary text-xs rounded hover:bg-green-500/20 hover:text-green-400 transition-colors"
                                onClick={() => { handleCommit(key); }}
                                title="Сохранить"
                            >
                                <IconCheck size={18} />
                            </button>
                            <button
                                className="w-[40px] h-[40px] flex items-center justify-center px-2 py-1 bg-ui-text-secondary/20 text-ui-text-secondary text-xs rounded hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                onClick={() => { handleCancel(key); }}
                                title="Отменить"
                            >
                                <IconX size={18} />
                            </button>
                        </div>
                    )}
                    {maybeRequired && (
                        <div className='w-[40px] flex justify-center pt-2'>
                            <ToolTip type="warning" content="Поле может быть необходимым для некоторых инструментов (Tools)" position="bottom">
                                <IconWarning size={26} className="text-yellow-500"/>
                            </ToolTip>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
});

const AccountsView: React.FC = observer(() => {

    const [dataObject, setDataObject] = useState<DataObject>({
        githubLink: {
            id: 'gh-link',
            icon: <IconGithub size={32} className="text-ui-text-primary" />,
            value: SettingsStore.getAccountDataByID('gh-link') || '',
            label: 'Ссылка на GitHub',
            maybeRequired: true,
            isChanging: false,
            beforeCommitValue: ''
        },
        githubPublicKey: {
            id: 'gh-public-key',
            icon: <IconGithub size={32} className="text-ui-text-primary" />,
            value: SettingsStore.getAccountDataByID('gh-public-key') || '',
            label: 'Публичный ключ',
            maybeRequired: true,
            isChanging: false,
            beforeCommitValue: ''
        },
        searchApiKey: {
            id: 'search-api-key',
            icon: <IconKey size={32} className="text-ui-text-primary" />,
            value: SettingsStore.getAccountDataByID('search-api-key') || '',
            label: 'Search API Key',
            maybeRequired: true,
            isChanging: false,
            beforeCommitValue: ''
        }
    });

    return (
        <div className="space-y-6 w-full">
            <div className="flex flex-col gap-4 border-b border-ui-border-primary pb-4">
                <FieldSet dataObject={dataObject} setDataObject={setDataObject} />
            </div>
        </div>
  );
});

export { AccountsView };
