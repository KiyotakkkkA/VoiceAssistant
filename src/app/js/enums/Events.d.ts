export const EventsType: {
    readonly EVENT: 'event';
    readonly SERVICE_INIT: 'init';
    readonly SERVICE_PING: 'ping';
    readonly SERVICE_ACTION: 'action';
};

export const EventsTopic: {
    readonly SERVICE_WAS_REGISTERED: 'registered';
    readonly SERVICE_WAS_DISABLED: 'disabled';
    readonly SERVICE_HEARTBEAT: 'heartbeat';
    
    readonly JSON_INITAL_DATA_SET: 'json_initial_data_set';
    readonly JSON_THEMES_DATA_SET: 'json_themes_data_set';
    readonly JSON_APIKEYS_DATA_SET: 'json_apikeys_data_set';
    readonly JSON_EVENT_PANEL_STATE_SET: 'json_event_panel_state_set';
    readonly JSON_DIALOGS_DATA_SET: 'json_dialogs_data_set';
    readonly JSON_TOOLS_DATA_SET: 'json_tools_data_set';
    readonly JSON_ACCOUNT_DATA_SET: 'json_account_data_set';
    readonly JSON_ACTIVE_DIALOG_SET: 'json_active_dialog_set';
    readonly JSON_DIALOGS_DATA_SET: 'json_dialogs_data_set';

    readonly RAW_TEXT_DATA_RECOGNIZED: 'raw_text_data_recognized';

    readonly ACTION_APP_OPEN: 'action_app_open';
    readonly ACTION_THEME_SET: 'action_theme_set';
    readonly ACTION_APIKEYS_SET: 'action_apikeys_set';
    readonly ACTION_WAKE: 'action_wake';
    readonly ACTION_TRANSCRIPT: 'action_transcript';
    readonly ACTION_AI_STREAM_CHUNK: 'action_ai_stream_chunk';
    readonly ACTION_AI_STREAM_START: 'action_ai_stream_start';
    readonly ACTION_AI_STREAM_END: 'action_ai_stream_end';
    readonly ACTION_MODE_SET: 'action_mode_set';
    readonly ACTION_AIMODEL_SET: 'action_aimodel_set';
    readonly ACTION_EVENT_PANEL_TOGGLE: 'action_event_panel_toggle';
    readonly ACTION_ACCOUNT_DATA_SET: 'action_account_data_set';
    readonly ACTION_ACTIVE_DIALOG_SET: 'action_active_dialog_set';
    readonly ACTION_DIALOG_RENAMED: 'action_dialog_renamed';
    readonly ACTION_DIALOG_DELETED: 'action_dialog_deleted';
    readonly ACTION_NOTES_REFETCH: 'action_notes_refetch';

    readonly ACTION_FOLDER_RENAME: 'action_folder_rename';
    readonly ACTION_FOLDER_DELETE: 'action_folder_delete';
    readonly ACTION_FOLDER_CREATE: 'action_folder_create';
    readonly ACTION_FILE_WRITE: 'ACTION_FILE_WRITE';
    readonly ACTION_FILE_DELETE: 'action_file_delete';
    readonly ACTION_FILE_RENAME: 'action_file_rename';
    readonly ACTION_FILE_REWRITED: 'action_file_rewrited';

    readonly ACTION_SERVICE_RELOAD: 'action_service_reload';
    readonly ACTION_SERVICE_DISABLE: 'action_service_disable';
    readonly ACTION_SERVICE_ENABLE: 'action_service_enable';

    readonly ACTION_INIT_DOWNLOADING_VOICE_MODEL: 'action_init_downloading_voice_model';

    readonly ACTION_TOOL_OFF: 'action_tool_off';
    readonly ACTION_TOOL_ON: 'action_tool_on';

    readonly REQUEST_MODULES_LIST: 'request_modules_list';
    readonly RESPONSE_MODULES_LIST: 'response_modules_list';

    readonly READY_UI: 'ready_ui';
    readonly READY_ORCHESTRATOR: 'ready_orchestrator';

    readonly HAVE_TO_BE_REFETCHED_SETTINGS_DATA: 'have_to_be_refetched_settings_data';
    readonly HAVE_TO_BE_REFETCHED_NOTES_STRUCTURE_DATA: 'have_to_be_refetched_notes_structure_data';
    readonly ACTION_DIALOGS_REFETCH: 'action_dialogs_refetch';
    readonly HAVE_TO_BE_REFETCHED_DIALOGS_DATA: 'have_to_be_refetched_dialogs_data';

    readonly DATABASE_APPS_UPDATED: 'database_apps_updated';
    readonly DATABASE_PATH_ADDED: 'database_path_added';
    readonly DATABASE_APP_LAUNCHED: 'database_app_launched';
    readonly DATABASE_STATS_UPDATED: 'database_stats_updated';

};

export type TEventTypeValue = typeof EventsType[keyof typeof EventsType];
export type TEventTopicValue = typeof EventsTopic[keyof typeof EventsTopic];