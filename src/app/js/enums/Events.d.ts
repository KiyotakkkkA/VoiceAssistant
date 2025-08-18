export const EventsType: {
    readonly EVENT: 'event';
    readonly SERVICE_INIT: 'init';
    readonly SERVICE_PING: 'ping';
    readonly SERVICE_ACTION: 'action';
};

export const EventsTopic: {
    readonly SERVICE_WAS_REGISTERED: 'registered';
    readonly SERVICE_HEARTBEAT: 'heartbeat';
    
    readonly JSON_INITAL_DATA_SET: 'json_initial_data_set';
    readonly JSON_THEMES_DATA_SET: 'json_themes_data_set';
    readonly JSON_APIKEYS_DATA_SET: 'json_apikeys_data_set';

    readonly YAML_DATA_SET: 'yaml_data_set';
    readonly RAW_TEXT_DATA_RECOGNIZED: 'raw_text_data_recognized';

    readonly ACTION_APP_OPEN: 'action_app_open';
    readonly ACTION_THEME_SET: 'action_theme_set';
    readonly ACTION_APIKEYS_SET: 'action_apikeys_set';
    readonly ACTION_WAKE: 'action_wake';
    readonly ACTION_TRANSCRIPT: 'action_transcript';
    readonly ACTION_ANSWERING_AI: 'action_answering_ai';
    readonly ACTION_MODE_SET: 'action_mode_set';
    readonly ACTION_AIMODEL_SET: 'action_aimodel_set';

    readonly UI_SHOW_SET_VOLUME: 'ui_show_set_volume';
    readonly UI_SHOW_SET_BRIGHTNESS: 'ui_show_set_brightness';

    readonly READY_UI: 'ready_ui';
    readonly READY_ORCHESTRATOR: 'ready_orchestrator';
    readonly READY_VOICE_RECOGNIZER: 'ready_voice_recognizer';
    readonly READY_PROCESSOR: 'ready_processor';

    readonly HAVE_TO_BE_REFETCHED_SETTINGS_DATA: 'have_to_be_refetched_settings_data';
};

export type TEventTypeValue = typeof EventsType[keyof typeof EventsType];
export type TEventTopicValue = typeof EventsTopic[keyof typeof EventsTopic];