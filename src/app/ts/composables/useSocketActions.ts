import { socketClient } from '../clients';
import { EventsTopic, EventsType } from '../../js/enums/Events';
import type { TEventTopicValue } from '../../js/enums/Events';
import { ApiData, AccountData, ToolsData } from '../types/Global';

export const useSocketActions = () => {
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

  const reloadService = (serviceId: string) => {
    sendServiceAction(EventsTopic.ACTION_SERVICE_RELOAD, serviceId);
  };

  const enableService = (serviceId: string) => {
    sendServiceAction(EventsTopic.ACTION_SERVICE_ENABLE, serviceId);
  };

  const disableService = (serviceId: string) => {
    sendServiceAction(EventsTopic.ACTION_SERVICE_DISABLE, serviceId);
  };

  const setAiModel = (modelId: string) => {
    sendServiceAction(EventsTopic.ACTION_AIMODEL_SET, '', { ['current.ai.model.id']: modelId });
  };

  const setApiKeys = (api: ApiData) => {
    sendServiceAction(EventsTopic.ACTION_APIKEYS_SET, '', { ['current.ai.api']: api });
  };

  const themeSet = (theme: string) => {
    sendServiceAction(EventsTopic.ACTION_THEME_SET, '', { ['current.appearance.theme']: theme });
  };

  const eventPanelToggle = (state: boolean) => {
    sendServiceAction(EventsTopic.ACTION_EVENT_PANEL_TOGGLE, '', { ['current.interface.event_panel.state']: state });
  };

  const folderRename = (path: string, newName: string) => {
    sendServiceAction(EventsTopic.ACTION_FOLDER_RENAME, '', { path, newName });
  };

  const folderDelete = (path: string) => {
    sendServiceAction(EventsTopic.ACTION_FOLDER_DELETE, '', { path });
  };

  const folderCreate = (path: string, name: string) => {
    sendServiceAction(EventsTopic.ACTION_FOLDER_CREATE, '', { path, name });
  };

  const fileWrite = (path: string, content: string, flag: string) => {
    sendServiceAction(EventsTopic.ACTION_FILE_WRITE, '', { path, content, flag });
  };

  const fileDelete = (path: string) => {
    sendServiceAction(EventsTopic.ACTION_FILE_DELETE, '', { path });
  };

  const fileRename = (path: string, newName: string) => {
    sendServiceAction(EventsTopic.ACTION_FILE_RENAME, '', { path, newName });
  };

  const notesRefetch = () => {
    sendServiceAction(EventsTopic.ACTION_NOTES_REFETCH, '', {});
  };

  const toolOff = (toolName: string) => {
    sendServiceAction(EventsTopic.ACTION_TOOL_OFF, '', { toolName });
  };

  const toolOn = (toolName: string) => {
    sendServiceAction(EventsTopic.ACTION_TOOL_ON, '', { toolName });
  };

  const accountDataSet = (accountData: AccountData) => {
    sendServiceAction(EventsTopic.ACTION_ACCOUNT_DATA_SET, '', { ['current.account.data']: accountData });
  };

  const initDownloadingVoiceModel = () => {
    sendServiceAction(EventsTopic.ACTION_INIT_DOWNLOADING_VOICE_MODEL, '', {});
  };

  const emitActiveDialog = (dialogId: string) => {
    sendServiceAction(EventsTopic.ACTION_ACTIVE_DIALOG_SET, '', { dialog_id: dialogId });
  };

  return {
    emitActiveDialog,
    setApiKeys,
    accountDataSet,
    initDownloadingVoiceModel,
    toolOff,
    toolOn,
    fileWrite,
    fileDelete,
    fileRename,
    notesRefetch,
    folderRename,
    folderDelete,
    folderCreate,
    themeSet,
    eventPanelToggle,
    sendServiceAction,
    reloadService,
    enableService,
    disableService,
    setAiModel,
  };
};
