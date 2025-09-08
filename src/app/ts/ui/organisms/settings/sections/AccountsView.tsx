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
        <div className="space-y-3">
            {Object.entries(dataObject).map(([key, { value, label, maybeRequired, isChanging, icon }]) => (
                <div key={key} className='p-4 bg-ui-bg-secondary/30 rounded-lg border border-ui-border-primary/30 hover:border-ui-border-primary/50 transition-colors items-center'>
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <FloatingTextInput
                                disabled={!isChanging}
                                className="w-full"
                                label={label}
                                value={value}
                                onChange={(e) =>
                                    setDataObject({ ...dataObject, [key]: { ...dataObject[key], value: e.target.value } })
                                }
                            />
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {!isChanging ? (
                                <button
                                    className="w-8 h-8 flex items-center justify-center bg-ui-bg-primary hover:bg-ui-text-accent/20 text-ui-text-secondary hover:text-ui-text-accent rounded-md transition-colors"
                                    onClick={() => { handleEdit(key); }}
                                    title="Редактировать"
                                >
                                    <IconPen size={14} />
                                </button>
                            ) : (
                                <div className='flex items-center gap-1'>
                                    <button
                                        className="w-8 h-8 flex items-center justify-center bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-md transition-colors"
                                        onClick={() => { handleCommit(key); }}
                                        title="Сохранить"
                                    >
                                        <IconCheck size={14} />
                                    </button>
                                    <button
                                        className="w-8 h-8 flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-md transition-colors"
                                        onClick={() => { handleCancel(key); }}
                                        title="Отменить"
                                    >
                                        <IconX size={14} />
                                    </button>
                                </div>
                            )}
                            {maybeRequired && (
                                <ToolTip type="warning" content="Поле может быть необходимым для некоторых инструментов (Tools)" position="bottom">
                                    <IconWarning size={24} className="text-yellow-500 mt-2"/>
                                </ToolTip>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
});

const AccountsView: React.FC = observer(() => {

    const [dataObject, setDataObject] = useState<DataObject>({
        githubLink: {
            id: 'gh-link',
            icon: <IconGithub size={24} className="text-ui-text-accent" />,
            value: SettingsStore.getAccountDataByID('gh-link') || '',
            label: 'Ссылка на GitHub',
            maybeRequired: true,
            isChanging: false,
            beforeCommitValue: ''
        },
        githubPublicKey: {
            id: 'gh-public-key',
            icon: <IconGithub size={24} className="text-ui-text-accent" />,
            value: SettingsStore.getAccountDataByID('gh-public-key') || '',
            label: 'Публичный ключ',
            maybeRequired: true,
            isChanging: false,
            beforeCommitValue: ''
        },
        searchApiKey: {
            id: 'search-api-key',
            icon: <IconKey size={24} className="text-ui-text-accent" />,
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
