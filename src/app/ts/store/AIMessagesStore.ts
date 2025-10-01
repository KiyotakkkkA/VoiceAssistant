import { makeAutoObservable } from 'mobx';
import { Dialog, DialogMessage } from '../types/Global';
import { SocketActions } from '../utils';

type AIMessagesData = {
    dialogs: Dialog[];
    activeDialogId: string | null;
    useHistoryContext: boolean;
}

const { emitDialogRenamed, emitDialogDeleted, emitDialogCreated } = SocketActions;

class AIMessagesStore {
    data: AIMessagesData = {
        dialogs: [],
        activeDialogId: null,
        useHistoryContext: true,
    };
    
    constructor() {
        makeAutoObservable(this);
    }

    applyDialogsData(dialogs: any) {

        this.data.dialogs.length = 0;

        const now = new Date();
        Object.entries(dialogs).forEach(([key, element]: [string, any]) => {
            if (this.data.dialogs.find(d => d.id === key)) return;

            const title = element.title || element.messages[0]?.user_prompt?.substring(0, 30) + (element.messages[0]?.user_prompt?.length > 30 ? '...' : '');

            this.data.dialogs.push({
                id: key,
                title,
                messages: (() => {
                    const messages: DialogMessage[] = [];
                    element.messages.forEach((exchange: any, exchangeIndex: number) => {
                        if (exchange.user_prompt) {
                            messages.push({
                                id: `msg_${key}_${exchangeIndex}_user`,
                                content: exchange.user_prompt,
                                role: 'user',
                                timestamp: new Date(exchange.timestamp || now),
                                model_name: undefined
                            });
                        }
                        
                        if (exchange.assistant_response) {
                            const assistantContent = exchange.assistant_response;
                                
                            messages.push({
                                id: `msg_${key}_${exchangeIndex}_assistant`,
                                content: assistantContent,
                                role: 'assistant',
                                timestamp: new Date(exchange.timestamp || now),
                                model_name: exchange.model_name || 'Неизвестная модель'
                            });
                        }
                    });
                    return messages;
                })(),
                created_at: element.create_at ? new Date(element.create_at) : now,
                updated_at: element.updated_at ? new Date(element.updated_at) : now,
                is_active: false
            })
        });
    }

    createDialog(title: string = 'Новый диалог'): string {
        const now = new Date();
        const newDialog: Dialog = {
            id: `dialog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title,
            messages: [],
            created_at: now,
            updated_at: now,
            is_active: false
        };
        
        this.data.dialogs.push(newDialog);
        this.setActiveDialog(newDialog.id);
        emitDialogCreated(newDialog.id);
        return newDialog.id;
    }

    setActiveDialog(dialogId: string) {
        this.data.dialogs.forEach(dialog => {
            dialog.is_active = false;
        });
        
        const dialog = this.data.dialogs.find(d => d.id === dialogId);
        if (dialog) {
            dialog.is_active = true;
            this.data.activeDialogId = dialogId;
        }
    }

    getActiveDialog(): Dialog | null {
        return this.data.dialogs.find(d => d.is_active) || null;
    }

    updateDialogTitle(dialogId: string, newTitle: string) {
        const dialog = this.data.dialogs.find(d => d.id === dialogId);
        if (dialog) {
            dialog.title = newTitle;
            dialog.updated_at = new Date();

            emitDialogRenamed(dialogId, newTitle);
        }
    }

    deleteDialog(dialogId: string) {
        this.data.dialogs = this.data.dialogs.filter(d => d.id !== dialogId);
        emitDialogDeleted(dialogId);
    }

    addMessageToActiveDialog(content: string | any, role: 'user' | 'assistant', modelName?: string) {
        const activeDialog = this.getActiveDialog();
        if (activeDialog) {
            const message: DialogMessage = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                content,
                role,
                timestamp: new Date(),
                model_name: modelName
            };
            
            activeDialog.messages.push(message);
            activeDialog.updated_at = new Date();
            
            if (role === 'user' && activeDialog.messages.filter(m => m.role === 'user').length === 1) {
                const shortTitle = typeof content === 'string' 
                    ? content.substring(0, 30) + (content.length > 30 ? '...' : '')
                    : 'Новый диалог';
                this.updateDialogTitle(activeDialog.id, shortTitle);
            }
        }
    }

    toggleHistoryContext() {
        this.data.useHistoryContext = !this.data.useHistoryContext;
    }

    setHistoryContext(enabled: boolean) {
        this.data.useHistoryContext = enabled;
    }

    getHistoryContext(): boolean {
        return this.data.useHistoryContext;
    }
}

export default new AIMessagesStore();