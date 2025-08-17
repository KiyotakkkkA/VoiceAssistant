/** @type {import('tailwindcss').Config} */
const withOpacity = (variable) => ({ opacityValue }) =>
  opacityValue ? `rgb(var(${variable}) / ${opacityValue})` : `rgb(var(${variable}))`;

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {

        'main-bg': withOpacity('--main-bg'),

        'topbar-bg': withOpacity('--topbar-bg'),

        'sidebars-bg': withOpacity('--sidebars-bg'),

        'log-bg': withOpacity('--log-bg'),
        'log-panel-bg': withOpacity('--log-panel-bg'),

        'appcard-bg': withOpacity('--appcard-bg'),
        'appcard-border-hover': withOpacity('--appcard-border-hover'),
        'appcard-accent': withOpacity('--appcard-accent'),

        'widget-bg': withOpacity('--widget-bg'),
        'widget-muted': withOpacity('--widget-muted'),
        'widget-accent-a': withOpacity('--widget-accent-a'),
        'widget-accent-b': withOpacity('--widget-accent-b'),
        'widget-success': withOpacity('--widget-success'),
        'widget-danger': withOpacity('--widget-danger'),

        'eventlog-json-key': withOpacity('--eventlog-json-key'),
        'eventlog-json-string': withOpacity('--eventlog-json-string'),
        'eventlog-json-keyword': withOpacity('--eventlog-json-keyword'),
        'eventlog-json-number': withOpacity('--eventlog-json-number'),
        'eventlog-bg-wake': withOpacity('--eventlog-bg-wake'),
        'eventlog-bg-transcript': withOpacity('--eventlog-bg-transcript'),
        'eventlog-bg-pyready': withOpacity('--eventlog-bg-pyready'),
        'eventlog-bg-yaml': withOpacity('--eventlog-bg-yaml'),
        'eventlog-bg-default': withOpacity('--eventlog-bg-default'),
        'eventlog-button-bg': withOpacity('--eventlog-button-bg'),
        'eventlog-button-bg-hover': withOpacity('--eventlog-button-bg-hover'),
        'eventlog-button-border-hover': withOpacity('--eventlog-button-border-hover'),
        'eventlog-button-accent': withOpacity('--eventlog-button-accent'),
        'eventlog-button-accent-hover': withOpacity('--eventlog-button-accent-hover'),
        'eventlog-item-bg-from': withOpacity('--eventlog-item-bg-from'),
        'eventlog-item-bg-to': withOpacity('--eventlog-item-bg-to'),
        'eventlog-from-text': withOpacity('--eventlog-from-text'),
        'eventlog-button-text': withOpacity('--eventlog-button-text'),
        'eventlog-button-text-hover': withOpacity('--eventlog-button-text-hover'),

        'badge-wake': withOpacity('--badge-wake'),
        'badge-listening': withOpacity('--badge-listening'),
        'badge-initializing': withOpacity('--badge-initializing'),
        'badge-waiting': withOpacity('--badge-waiting'),
        'badge-default': withOpacity('--badge-default'),

        'button-bg': withOpacity('--button-bg'),
        'button-bg-hover': withOpacity('--button-bg-hover'),

        'input-bg': withOpacity('--input-bg'),
        'input-focus': withOpacity('--input-focus'),

        'draghandle-bg-active': withOpacity('--draghandle-bg-active'),
        'draghandle-bg-hover': withOpacity('--draghandle-bg-hover'),

        'ui-text-primary': withOpacity('--ui-text-primary'),
        'ui-text-secondary': withOpacity('--ui-text-secondary'),
        'ui-text-muted': withOpacity('--ui-text-muted'),
        'ui-text-accent': withOpacity('--ui-text-accent'),
        'ui-border-primary': withOpacity('--ui-border-primary'),

        'state-listening-bg': withOpacity('--state-listening-bg'),
        'state-waiting-bg': withOpacity('--state-waiting-bg'),
        'state-initializing-bg': withOpacity('--state-initializing-bg'),

        'nav-text': withOpacity('--nav-text'),
        'nav-text-hover': withOpacity('--nav-text-hover'),
        'nav-text-active': withOpacity('--nav-text-active'),
        'nav-bg-hover': withOpacity('--nav-bg-hover'),
        'nav-bg-active': withOpacity('--nav-bg-active'),
        'nav-tooltip-bg': withOpacity('--nav-tooltip-bg'),
        'nav-tooltip-text': withOpacity('--nav-tooltip-text'),

        'toast-bg-from': withOpacity('--toast-bg-from'),
        'toast-bg-to': withOpacity('--toast-bg-to'),
        'toast-accent': withOpacity('--toast-accent'),
        'toast-bar': withOpacity('--toast-bar'),

        'card-bg': withOpacity('--card-bg'),
        'card-title': withOpacity('--card-title'),
        
        'version-text': withOpacity('--version-text'),
      },
    },
  },
  plugins: [],
};
