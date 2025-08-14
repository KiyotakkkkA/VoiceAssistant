import enum

class EventsType(enum.Enum):
    EVENT = 'event'
    SERVICE_INIT = 'init'
    SERVICE_PING = 'ping'
    SERVICE_ACTION = 'action'

class EventsTopic(enum.Enum):
    SERVICE_WAS_REGISTERED = 'registered'
    SERVICE_HEARTBEAT = 'heartbeat'

    JSON_DATA_SET = 'json_data_set'
    YAML_DATA_SET = 'yaml_data_set'

    RAW_TEXT_DATA_RECOGNIZED = 'raw_text_data_recognized'

    ACTION_APP_OPEN = 'action_app_open'
    ACTION_THEME_SET = 'action_theme_set'
    ACTION_WAKE = 'action_wake'
    ACTION_TRANSCRIPT = 'action_transcript'

    UI_SHOW_SET_BRIGHTNESS = 'ui_show_set_brightness'
    UI_SHOW_SET_VOLUME = 'ui_show_set_volume'

    READY_VOICE_RECOGNIZER = 'ready_voice_recognizer'
