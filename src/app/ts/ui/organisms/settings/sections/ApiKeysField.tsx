import React, { useEffect, useState, useRef } from 'react';
import { TextInput, Dropdown } from '../../../atoms/input';
import { CategoryItem } from '../../../atoms';
import { CanOkModal } from '../../../molecules/modals';
import { IconPen, IconCopy, IconTrash } from '../../../atoms/icons';
import { useToast } from '../../../../composables';
import { observer } from 'mobx-react-lite';

import SettingsStore from '../../../../store/SettingsStore';

const providers = [
    { value: 'router', label: 'OpenRouter', description: 'Сервис-агрегатор для работы с AI моделями посредством API, разработанный компанией OpenAI' },
    { value: 'ollama', label: 'Ollama', description: 'Сервис-агрегатор для работы с AI моделями посредством API, разработанный компанией Ollama' },
];

const ApiKeysField: React.FC = observer(() => {
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
        <div>
            <CategoryItem 
                label="Добавить API ключ"
                description="Управления доступными подключениями к внешним AI моделям"
            >
                <div className="space-y-3 w-full">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative group">
                            <TextInput
                                placeholder="Например: OpenAI"
                                model={newName}
                                className="text-sm transition-all duration-200"
                                onChange={e => setNewName(e.target.value)}
                                onKeyDown={handleKeyPress}
                            />
                        </div>
                        <div className="relative group">
                            <TextInput
                                placeholder="sk-..."
                                model={newValue}
                                className="text-sm transition-all duration-200"
                                type="password"
                                onChange={e => setNewValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                            />
                        </div>
                    </div>
                    <Dropdown
                        value={newProvider}
                        options={providers}
                        onChange={selected => setNewProvider(selected)}
                    />
                    <button
                        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-lg"
                        onClick={handleAdd}
                        disabled={!newName.trim() || !newValue.trim()}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                            </svg>
                            Добавить ключ
                        </span>
                    </button>
                </div>
            </CategoryItem>

            {Object.entries(SettingsStore.data.settings['current.ai.api'])?.map(([key, item]) => (
                <CategoryItem 
                    key={key} 
                    label={
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
                            <span className="text-ui-text-primary font-semibold">{item.name}</span>
                            <span 
                                className={`text-ui-text-secondary text-xs px-2 py-1 bg-ui-bg-secondary/50 rounded`}
                            >
                                {providers.find(p => p.value === item.provider)?.label || item.provider}
                            </span>
                        </div>
                    }
                    description={
                        <div className="flex items-center gap-2">
                            <span className="text-ui-text-secondary text-sm">API ключ:</span>
                            <span className="font-mono text-ui-text-primary bg-ui-text-secondary/10 px-2 py-1 rounded text-sm">
                                {item.value.replace(/.(?=.{4})/g, '•')}
                            </span>
                        </div>
                    }
                >
                    {editId === key ? (
                        <div className="space-y-3 w-full">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative group">
                                    <TextInput
                                        model={editName}
                                        className="text-sm transition-all duration-200"
                                        placeholder="Название модели"
                                        onChange={e => setEditName(e.target.value)}
                                    />
                                </div>
                                <div className="relative group">
                                    <TextInput
                                        model={editValue}
                                        className="text-sm transition-all duration-200"
                                        type="password"
                                        placeholder="API ключ"
                                        onChange={e => setEditValue(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Dropdown
                                value={editProvider}
                                options={providers}
                                onChange={selected => setEditProvider(selected)}
                            />
                            <div className="flex gap-2">
                                <button
                                    className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white text-sm font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:transform-none"
                                    onClick={handleSave}
                                    disabled={!editName.trim() || !editValue.trim()}
                                >
                                    ✓ Сохранить
                                </button>
                                <button
                                    className="flex-1 px-3 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white text-sm font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-0.5"
                                    onClick={() => setEditId(null)}
                                >
                                    ✕ Отмена
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-1">
                            <button
                                className="w-[40px] h-[40px] flex items-center justify-center px-2 py-1 bg-ui-text-secondary/20 text-ui-text-secondary text-xs rounded hover:bg-cyan-500/20 hover:text-cyan-400 transition-colors"
                                onClick={() => {
                                    navigator.clipboard.writeText(item.value);
                                    addToast('Скопировано в буфер обмена', 'info', 3500);
                                }}
                            >
                                <IconCopy size={18} />
                            </button>
                            <button
                                className="w-[40px] h-[40px] flex items-center justify-center px-2 py-1 bg-ui-text-secondary/20 text-ui-text-secondary text-xs rounded hover:bg-green-500/20 hover:text-green-400 transition-colors"
                                onClick={() => handleEdit({
                                    id: key,
                                    name: item.name,
                                    value: item.value,
                                    provider: item.provider,
                                })}
                                title="Редактировать"
                            >
                                <IconPen size={18} />
                            </button>
                            <button
                                className="w-[40px] h-[40px] flex items-center justify-center px-2 py-1 bg-ui-text-secondary/20 text-ui-text-secondary text-xs rounded hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                onClick={() => handleDelete(key)}
                                title="Удалить"
                            >
                                <IconTrash size={18} />
                            </button>
                        </div>
                    )}
                </CategoryItem>
            ))}

            {Object.keys(SettingsStore.data.settings['current.ai.api'] || {}).length === 0 && (
                <div className="py-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-ui-text-secondary/50">
                            <rect x="3" y="11" width="18" height="10" rx="2" ry="2"/>
                            <circle cx="12" cy="16" r="1"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                    </div>
                    <p className="text-ui-text-secondary/70 text-sm mb-2 font-medium">Нет API ключей</p>
                    <p className="text-ui-text-secondary/50 text-xs">Добавьте ключи для работы с внешними моделями AI</p>
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

export { ApiKeysField };
