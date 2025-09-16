import enum

class EventsType(enum.Enum):
    EVENT = 'event'
    SERVICE_INIT = 'init'
    SERVICE_PING = 'ping'
    SERVICE_ACTION = 'action'

class EventsTopic(enum.Enum):
    SERVICE_WAS_REGISTERED = 'registered'
    SERVICE_HEARTBEAT = 'heartbeat'
    SERVICE_WAS_DISABLED = 'disabled'

    JSON_THEMES_DATA_SET = 'json_themes_data_set'
    JSON_APIKEYS_DATA_SET = 'json_apikeys_data_set'
    JSON_EVENT_PANEL_STATE_SET = 'json_event_panel_state_set'
    JSON_TOOLS_DATA_SET = 'json_tools_data_set'
    JSON_ACCOUNT_DATA_SET = 'json_account_data_set'
    JSON_ACTIVE_DIALOG_SET = 'json_active_dialog_set'
    JSON_DIALOGS_DATA_SET = 'json_dialogs_data_set'

    RAW_TEXT_DATA_RECOGNIZED = 'raw_text_data_recognized'

    ACTION_APP_OPEN = 'action_app_open'
    ACTION_THEME_SET = 'action_theme_set'
    ACTION_WAKE = 'action_wake'
    ACTION_TRANSCRIPT = 'action_transcript'
    ACTION_AI_STREAM_CHUNK = 'action_ai_stream_chunk'
    ACTION_AI_STREAM_START = 'action_ai_stream_start'
    ACTION_AI_STREAM_END = 'action_ai_stream_end'
    ACTION_MODE_SET = 'action_mode_set'
    ACTION_AIMODEL_SET = 'action_aimodel_set'
    ACTION_EVENT_PANEL_TOGGLE = 'action_event_panel_toggle'
    ACTION_ACCOUNT_DATA_SET = 'action_account_data_set'
    ACTION_ACTIVE_DIALOG_SET = 'action_active_dialog_set'
    ACTION_DIALOG_RENAMED = 'action_dialog_renamed'
    ACTION_DIALOG_DELETED = 'action_dialog_deleted'
    ACTION_NOTES_REFETCH = 'action_notes_refetch'

    ACTION_FOLDER_RENAME = 'action_folder_rename'
    ACTION_FOLDER_DELETE = 'action_folder_delete'
    ACTION_FOLDER_CREATE = 'action_folder_create'
    ACTION_FILE_WRITE = 'ACTION_FILE_WRITE'
    ACTION_FILE_DELETE = 'action_file_delete'
    ACTION_FILE_RENAME = 'action_file_rename'
    ACTION_FILE_REWRITED = 'action_file_rewrited'

    ACTION_SERVICE_RELOAD = 'action_service_reload'
    ACTION_SERVICE_DISABLE = 'action_service_disable'
    ACTION_SERVICE_ENABLE = 'action_service_enable'

    ACTION_INIT_DOWNLOADING_VOICE_MODEL = 'action_init_downloading_voice_model'

    ACTION_TOOL_OFF = 'action_tool_off'
    ACTION_TOOL_ON = 'action_tool_on'

    REQUEST_MODULES_LIST = 'request_modules_list'
    RESPONSE_MODULES_LIST = 'response_modules_list'

    READY_UI = 'ready_ui'
    READY_ORCHESTRATOR = 'ready_orchestrator'

    HAVE_TO_BE_REFETCHED_SETTINGS_DATA = "have_to_be_refetched_settings_data"
    HAVE_TO_BE_REFETCHED_NOTES_STRUCTURE_DATA = "have_to_be_refetched_notes_structure_data"
    ACTION_DIALOGS_REFETCH = 'action_dialogs_refetch'
    HAVE_TO_BE_REFETCHED_DIALOGS_DATA = 'have_to_be_refetched_dialogs_data'

    DATABASE_APPS_UPDATED = 'database_apps_updated'
    DATABASE_PATH_ADDED = 'database_path_added'
    DATABASE_APP_LAUNCHED = 'database_app_launched'
    DATABASE_STATS_UPDATED = 'database_stats_updated'