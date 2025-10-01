import { socketClient } from '../clients';
import { EventsTopic, EventsType } from '../../js/enums/Events';
import type { TEventTopicValue } from '../../js/enums/Events';
import { ApiData, AccountData } from '../types/Global';

const sendServiceAction = (topic: TEventTopicValue, serviceId: string, additionalPayload: Record<string, any> = {}) => {
  if (socketClient) {
    socketClient.send({
      type: EventsType.SERVICE_ACTION,
      topic,
      payload: {
        serviceId,
        ...additionalPayload
      },
      from: 'ui'
    });
  }
};

export const SocketActions = {
  sendServiceAction,

  reloadService: (serviceId: string) => {
    sendServiceAction(EventsTopic.ACTION_SERVICE_RELOAD, serviceId);
  },

  enableService: (serviceId: string) => {
    sendServiceAction(EventsTopic.ACTION_SERVICE_ENABLE, serviceId);
  },

  disableService: (serviceId: string) => {
    sendServiceAction(EventsTopic.ACTION_SERVICE_DISABLE, serviceId);
  },

  setAiModel: (modelId: string) => {
    sendServiceAction(EventsTopic.ACTION_AIMODEL_SET, '', { ['current.ai.model.id']: modelId });
  },

  setApiKeys: (api: ApiData) => {
    sendServiceAction(EventsTopic.ACTION_APIKEYS_SET, '', { ['current.ai.api']: api });
  },

  themeSet: (theme: string) => {
    sendServiceAction(EventsTopic.ACTION_THEME_SET, '', { ['current.appearance.theme']: theme });
  },

  eventPanelToggle: (state: boolean) => {
    sendServiceAction(EventsTopic.ACTION_EVENT_PANEL_TOGGLE, '', { ['current.interface.event_panel.state']: state });
  },

  folderRename: (path: string, newName: string) => {
    sendServiceAction(EventsTopic.ACTION_FOLDER_RENAME, '', { path, newName });
  },

  folderDelete: (path: string) => {
    sendServiceAction(EventsTopic.ACTION_FOLDER_DELETE, '', { path });
  },

  folderCreate: (path: string, name: string) => {
    sendServiceAction(EventsTopic.ACTION_FOLDER_CREATE, '', { path, name });
  },

  fileWrite: (path: string, content: string, flag: string) => {
    sendServiceAction(EventsTopic.ACTION_FILE_WRITE, '', { path, content, flag });
  },

  fileDelete: (path: string) => {
    sendServiceAction(EventsTopic.ACTION_FILE_DELETE, '', { path });
  },

  fileRename: (path: string, newName: string) => {
    sendServiceAction(EventsTopic.ACTION_FILE_RENAME, '', { path, newName });
  },

  fileMove: (sourcePath: string, destinationPath: string) => {
    sendServiceAction(EventsTopic.ACTION_FILE_MOVE, '', { sourcePath, destinationPath });
  },

  notesRefetch: () => {
    sendServiceAction(EventsTopic.ACTION_NOTES_REFETCH, '', {});
  },

  toolOff: (toolName: string) => {
    sendServiceAction(EventsTopic.ACTION_TOOL_OFF, '', { toolName });
  },

  toolOn: (toolName: string) => {
    sendServiceAction(EventsTopic.ACTION_TOOL_ON, '', { toolName });
  },

  accountDataSet: (accountData: AccountData) => {
    sendServiceAction(EventsTopic.ACTION_ACCOUNT_DATA_SET, '', { ['current.account.data']: accountData });
  },

  initDownloadingVoiceModel: () => {
    sendServiceAction(EventsTopic.ACTION_INIT_DOWNLOADING_VOICE_MODEL, '', {});
  },

  emitActiveDialog: (dialogId: string) => {
    sendServiceAction(EventsTopic.ACTION_ACTIVE_DIALOG_SET, '', { dialog_id: dialogId });
  },

  emitDialogRenamed: (dialogId: string, newTitle: string) => {
    sendServiceAction(EventsTopic.ACTION_DIALOG_RENAMED, '', { dialog_id: dialogId, new_title: newTitle });
  },

  emitDialogDeleted: (dialogId: string) => {
    sendServiceAction(EventsTopic.ACTION_DIALOG_DELETED, '', { dialog_id: dialogId });
  },

  emitDialogCreated: (dialogId: string) => {
    sendServiceAction(EventsTopic.ACTION_DIALOG_CREATED, '', { dialog_id: dialogId });
  },

  contextSettingsSet: (updates: { enabled: boolean, max_messages: number }) => {
    sendServiceAction(EventsTopic.ACTION_CONTEXT_SETTINGS_SET, '', { updates });
  }
};
