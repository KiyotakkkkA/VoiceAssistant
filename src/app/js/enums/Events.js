export const EventsType = {
	EVENT: 'event',
    SERVICE_INIT: 'init',
    SERVICE_PING: 'ping',
    SERVICE_ACTION: 'action'
};

export const EventsTopic = {
	SERVICE_WAS_REGISTERED: 'registered',
    SERVICE_WAS_DISABLED: 'disabled',
	SERVICE_HEARTBEAT: 'heartbeat',

    JSON_INITAL_DATA_SET: 'json_initial_data_set',
    JSON_THEMES_DATA_SET: 'json_themes_data_set',
    JSON_APIKEYS_DATA_SET: 'json_apikeys_data_set',
    
    RAW_TEXT_DATA_RECOGNIZED: 'raw_text_data_recognized',

    ACTION_APP_OPEN: 'action_app_open',
    ACTION_THEME_SET: 'action_theme_set',
    ACTION_APIKEYS_SET: 'action_apikeys_set',
    ACTION_WAKE: 'action_wake',
    ACTION_TRANSCRIPT: 'action_transcript',
    ACTION_ANSWERING_AI: 'action_answering_ai',
    ACTION_MODE_SET: 'action_mode_set',
    ACTION_AIMODEL_SET: 'action_aimodel_set',

    ACTION_SERVICE_RELOAD: 'action_service_reload',
    ACTION_SERVICE_DISABLE: 'action_service_disable',
    ACTION_SERVICE_ENABLE: 'action_service_enable',

    REQUEST_MODULES_LIST: 'request_modules_list',
    RESPONSE_MODULES_LIST: 'response_modules_list',

    READY_UI: 'ready_ui',
    READY_ORCHESTRATOR: 'ready_orchestrator',

    HAVE_TO_BE_REFETCHED_SETTINGS_DATA: 'have_to_be_refetched_settings_data'
};
