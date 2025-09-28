import React, { useState } from 'react';
import { TextInputSimple, Dropdown } from '../../atoms/input';
import { CanOkModal } from '../../molecules/modals';
import { IconPen, IconCopy, IconTrash } from '../../atoms/icons';
import { useToast } from '../../../composables';
import { observer } from 'mobx-react-lite';

import SettingsStore from '../../../store/SettingsStore';

const providers = [
    { value: 'router', label: 'OpenRouter', description: 'Сервис-агрегатор для работы с AI моделями посредством API, разработанный компанией OpenAI' },
    { value: 'ollama', label: 'Ollama', description: 'Сервис-агрегатор для работы с AI моделями посредством API, разработанный компанией Ollama' },
];

const ApiKeysView: React.FC = observer(() => {
    const [newName, setNewName] = useState('');
    const [newValue, setNewValue] = useState('');
    const [newProvider, setNewProvider] = useState(providers[1].value);
    const [editId, setEditId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editValue, setEditValue] = useState('');
    const [editProvider, setEditProvider] = useState('');
    const [deleteModal, setDeleteModal] = useState<{isOpen: boolean; keyId: string | null; keyName: string}>({
        isOpen: false,
        keyId: null,
        keyName: ''
    });

    const { addToast } = useToast();

    const handleAdd = () => {
        if (!newName.trim() || !newValue.trim()) return;
        SettingsStore.setApiKey({ id: Date.now().toString(), name: newName.trim(), value: newValue.trim(), provider: newProvider });
        setNewName('');
        setNewValue('');
    };
    
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newName.trim() && newValue.trim()) {
            handleAdd();
        }
    };

    const handleEdit = (k: { id: string; name: string; value: string, provider: string }) => {
        setEditId(k.id);
        setEditName(k.name);
        setEditValue(k.value);
        setEditProvider(k.provider);
    };
    const handleSave = () => {
        if (!editName.trim() || !editValue.trim()) return;
        SettingsStore.setApiKey({ id: editId!, name: editName.trim(), value: editValue.trim(), provider: editProvider });
        setEditId(null);
        setEditName('');
        setEditValue('');
        setEditProvider('');
    };

    const handleDelete = (id: string) => {
        const keyToDelete = SettingsStore.data.settings['current.ai.api']?.[id];
        if (keyToDelete) {
            setDeleteModal({
                isOpen: true,
                keyId: id,
                keyName: keyToDelete.name
            });
        }
    };

    const confirmDelete = () => {
        if (deleteModal.keyId) {
            SettingsStore.deleteApiKey(deleteModal.keyId);
            if (editId === deleteModal.keyId) setEditId(null);
        }
        setDeleteModal({ isOpen: false, keyId: null, keyName: '' });
    };

    return (
        <div className="space-y-6">
            <div className="mb-6">                
                <div className="bg-ui-bg-secondary/30 border border-ui-border-primary/30 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <TextInputSimple
                            placeholder="Например: OpenAI"
                            model={newName}
                            className="text-sm"
                            onChange={e => setNewName(e.target.value)}
                            onKeyDown={handleKeyPress}
                        />
                        <TextInputSimple
                            placeholder="sk-..."
                            model={newValue}
                            className="text-sm"
                            type="password"
                            onChange={e => setNewValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                        />
                    </div>
                    <div className="flex gap-3 items-end">
                        <div className="flex-1">
                            <Dropdown
                                value={newProvider}
                                options={providers}
                                onChange={selected => setNewProvider(selected)}
                            />
                        </div>
                        <button
                            className="px-4 py-2 bg-widget-accent-a hover:bg-widget-accent-a/80 text-ui-text-primary text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleAdd}
                            disabled={!newName.trim() || !newValue.trim()}
                        >
                            Добавить ключ
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {Object.entries(SettingsStore.data.settings['current.ai.api'])?.map(([key, item]) => (
                    <div 
                        key={key}
                        className="bg-ui-bg-secondary/30 border border-ui-border-primary/30 rounded-lg p-4 hover:border-ui-border-primary/50 transition-colors"
                    >
                        {editId === key ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <TextInputSimple
                                        model={editName}
                                        className="text-sm"
                                        placeholder="Название модели"
                                        onChange={e => setEditName(e.target.value)}
                                    />
                                    <TextInputSimple
                                        model={editValue}
                                        className="text-sm"
                                        type="password"
                                        placeholder="API ключ"
                                        onChange={e => setEditValue(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-3 items-end">
                                    <div className="flex-1">
                                        <Dropdown
                                            value={editProvider}
                                            options={providers}
                                            onChange={selected => setEditProvider(selected)}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            className="px-3 py-2 bg-green-500/10 text-green-400 border border-green-500/20 text-sm font-medium rounded-md hover:bg-green-500/20 transition-colors disabled:opacity-50"
                                            onClick={handleSave}
                                            disabled={!editName.trim() || !editValue.trim()}
                                        >
                                            Сохранить
                                        </button>
                                        <button
                                            className="px-3 py-2 bg-ui-bg-primary text-ui-text-secondary border border-ui-border-primary text-sm font-medium rounded-md hover:bg-ui-bg-primary/80 transition-colors"
                                            onClick={() => setEditId(null)}
                                        >
                                            Отмена
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-ui-text-primary font-medium truncate">{item.name}</span>
                                            <span className="text-xs px-2 py-0.5 bg-ui-bg-primary/50 text-ui-text-secondary rounded-full flex-shrink-0">
                                                {providers.find(p => p.value === item.provider)?.label || item.provider}
                                            </span>
                                        </div>
                                        <div className="text-xs text-ui-text-muted font-mono">
                                            {item.value.replace(/.(?=.{4})/g, '•')}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1 flex-shrink-0 ml-3">
                                    <button
                                        className="w-8 h-8 flex items-center justify-center bg-ui-bg-primary hover:bg-cyan-500/20 text-ui-text-secondary hover:text-cyan-400 rounded-md transition-colors"
                                        onClick={() => {
                                            navigator.clipboard.writeText(item.value);
                                            addToast('Скопировано в буфер обмена', 'info', 3500);
                                        }}
                                        title="Копировать"
                                    >
                                        <IconCopy size={14} />
                                    </button>
                                    <button
                                        className="w-8 h-8 flex items-center justify-center bg-ui-bg-primary hover:bg-green-500/20 text-ui-text-secondary hover:text-green-400 rounded-md transition-colors"
                                        onClick={() => handleEdit({
                                            id: key,
                                            name: item.name,
                                            value: item.value,
                                            provider: item.provider,
                                        })}
                                        title="Редактировать"
                                    >
                                        <IconPen size={14} />
                                    </button>
                                    <button
                                        className="w-8 h-8 flex items-center justify-center bg-ui-bg-primary hover:bg-red-500/20 text-ui-text-secondary hover:text-red-400 rounded-md transition-colors"
                                        onClick={() => handleDelete(key)}
                                        title="Удалить"
                                    >
                                        <IconTrash size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {Object.keys(SettingsStore.data.settings['current.ai.api'] || {}).length === 0 && (
                <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 bg-ui-bg-secondary/50 rounded-full flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-ui-text-secondary/50">
                            <rect x="3" y="11" width="18" height="10" rx="2" ry="2"/>
                            <circle cx="12" cy="16" r="1"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                    </div>
                    <p className="text-ui-text-secondary text-sm mb-1">Нет API ключей</p>
                    <p className="text-ui-text-muted text-xs">Добавьте ключи для работы с внешними моделями AI</p>
                </div>
            )}

            <CanOkModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, keyId: null, keyName: '' })}
                onConfirm={confirmDelete}
                title="Удалить API ключ"
                description={`Вы действительно хотите удалить ключ для "${deleteModal.keyName}"? Это действие нельзя отменить.`}
                confirmText="Удалить"
                cancelText="Отмена"
                type="danger"
            />
        </div>
    );
});

export { ApiKeysView };
