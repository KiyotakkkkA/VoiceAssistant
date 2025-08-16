export const EventsType = {
	EVENT: 'event',
    SERVICE_INIT: 'init',
    SERVICE_PING: 'ping',
    SERVICE_ACTION: 'action'
};

export const EventsTopic = {
	SERVICE_WAS_REGISTERED: 'registered',
	SERVICE_HEARTBEAT: 'heartbeat',

    JSON_INITAL_DATA_SET: 'json_initial_data_set',
    JSON_THEMES_DATA_SET: 'json_themes_data_set',
    JSON_APIKEYS_DATA_SET: 'json_apikeys_data_set',
    YAML_DATA_SET: 'yaml_data_set',
    
    RAW_TEXT_DATA_RECOGNIZED: 'raw_text_data_recognized',

    ACTION_APP_OPEN: 'action_app_open',
    ACTION_THEME_SET: 'action_theme_set',
    ACTION_APIKEYS_SET: 'action_apikeys_set',
    ACTION_WAKE: 'action_wake',
    ACTION_TRANSCRIPT: 'action_transcript',

    UI_SHOW_SET_VOLUME: 'ui_show_set_volume',
    UI_SHOW_SET_BRIGHTNESS: 'ui_show_set_brightness',

    READY_VOICE_RECOGNIZER: 'ready_voice_recognizer'
};
