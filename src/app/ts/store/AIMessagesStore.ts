import { makeAutoObservable } from 'mobx';
import { Dialog, DialogMessage } from '../types/Global';

type Msg = {
    model_name: string;
    text: string;
    timestamp?: Date;
}

type AIMessagesData = {
    aiMsgHistory: Msg[];
    dialogs: Dialog[];
    activeDialogId: string | null;
    useHistoryContext: boolean;
}

class AIMessagesStore {
    data: AIMessagesData = {
        aiMsgHistory: [],
        dialogs: [],
        activeDialogId: null,
        useHistoryContext: true,
    };
    
    constructor() {
        makeAutoObservable(this);
        if (this.data.dialogs.length === 0) {
            this.createDialog('Новый диалог');
        }
    }

    clearAiHistory() {
        this.data.aiMsgHistory = [];
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
        }
    }

    deleteDialog(dialogId: string) {
        const dialogIndex = this.data.dialogs.findIndex(d => d.id === dialogId);
        if (dialogIndex !== -1) {
            this.data.dialogs.splice(dialogIndex, 1);
            
            if (this.data.activeDialogId === dialogId) {
                if (this.data.dialogs.length > 0) {
                    this.setActiveDialog(this.data.dialogs[0].id);
                } else {
                    this.createDialog('Новый диалог');
                }
            }
        }
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

    clearActiveDialog() {
        const activeDialog = this.getActiveDialog();
        if (activeDialog) {
            activeDialog.messages = [];
            activeDialog.updated_at = new Date();
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

    getContextMessages(): DialogMessage[] {
        if (!this.data.useHistoryContext) {
            return [];
        }
        
        const activeDialog = this.getActiveDialog();
        if (!activeDialog) {
            return [];
        }
        
        return activeDialog.messages.slice(-10);
    }
}

export default new AIMessagesStore();