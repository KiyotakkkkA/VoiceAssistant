import { useCallback } from 'react';
import { SocketActions } from '../utils';

export const useSocketActions = () => {
  const sendServiceAction = useCallback(SocketActions.sendServiceAction, []);
  const reloadService = useCallback(SocketActions.reloadService, []);
  const enableService = useCallback(SocketActions.enableService, []);
  const disableService = useCallback(SocketActions.disableService, []);
  const setAiModel = useCallback(SocketActions.setAiModel, []);
  const setApiKeys = useCallback(SocketActions.setApiKeys, []);
  const themeSet = useCallback(SocketActions.themeSet, []);
  const eventPanelToggle = useCallback(SocketActions.eventPanelToggle, []);
  const folderRename = useCallback(SocketActions.folderRename, []);
  const folderDelete = useCallback(SocketActions.folderDelete, []);
  const folderCreate = useCallback(SocketActions.folderCreate, []);
  const fileWrite = useCallback(SocketActions.fileWrite, []);
  const fileDelete = useCallback(SocketActions.fileDelete, []);
  const fileRename = useCallback(SocketActions.fileRename, []);
  const fileMove = useCallback(SocketActions.fileMove, []);
  const notesRefetch = useCallback(SocketActions.notesRefetch, []);
  const toolOff = useCallback(SocketActions.toolOff, []);
  const toolOn = useCallback(SocketActions.toolOn, []);
  const accountDataSet = useCallback(SocketActions.accountDataSet, []);
  const initDownloadingVoiceModel = useCallback(SocketActions.initDownloadingVoiceModel, []);
  const emitActiveDialog = useCallback(SocketActions.emitActiveDialog, []);
  const emitDialogRenamed = useCallback(SocketActions.emitDialogRenamed, []);
  const emitDialogDeleted = useCallback(SocketActions.emitDialogDeleted, []);
  const emitDialogCreated = useCallback(SocketActions.emitDialogCreated, []);
  const contextSettingsSet = useCallback(SocketActions.contextSettingsSet, []);

  return {
    contextSettingsSet,
    emitDialogCreated,
    emitDialogDeleted,
    emitDialogRenamed,
    emitActiveDialog,
    setApiKeys,
    accountDataSet,
    initDownloadingVoiceModel,
    toolOff,
    toolOn,
    fileWrite,
    fileDelete,
    fileRename,
    fileMove,
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
