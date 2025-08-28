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
        'appcard-border-hover': withOpacity('--appcard-border-hover'),
        'appcard-accent': withOpacity('--appcard-accent'),

        'widget-muted': withOpacity('--widget-muted'),
        'widget-accent-a': withOpacity('--widget-accent-a'),
        'widget-accent-b': withOpacity('--widget-accent-b'),
        'widget-success': withOpacity('--widget-success'),
        'widget-danger': withOpacity('--widget-danger'),

        'eventlog-json-key': withOpacity('--eventlog-json-key'),
        'eventlog-json-string': withOpacity('--eventlog-json-string'),
        'eventlog-json-keyword': withOpacity('--eventlog-json-keyword'),
        'eventlog-json-number': withOpacity('--eventlog-json-number'),
        'eventlog-button-bg': withOpacity('--eventlog-button-bg'),
        'eventlog-button-bg-hover': withOpacity('--eventlog-button-bg-hover'),
        'eventlog-button-border-hover': withOpacity('--eventlog-button-border-hover'),
        'eventlog-button-accent': withOpacity('--eventlog-button-accent'),
        'eventlog-button-accent-hover': withOpacity('--eventlog-button-accent-hover'),
        'eventlog-from-text': withOpacity('--eventlog-from-text'),
        'eventlog-button-text': withOpacity('--eventlog-button-text'),
        'eventlog-button-text-hover': withOpacity('--eventlog-button-text-hover'),

        'badge-wake': withOpacity('--badge-wake'),
        'badge-listening': withOpacity('--badge-listening'),
        'badge-initializing': withOpacity('--badge-initializing'),
        'badge-waiting': withOpacity('--badge-waiting'),
        'badge-default': withOpacity('--badge-default'),
        'badge-thinking': withOpacity('--badge-thinking'),

        'input-focus': withOpacity('--input-focus'),

        'draghandle-bg-active': withOpacity('--draghandle-bg-active'),
        'draghandle-bg-hover': withOpacity('--draghandle-bg-hover'),

        'ui-text-primary': withOpacity('--ui-text-primary'),
        'ui-text-secondary': withOpacity('--ui-text-secondary'),
        'ui-text-muted': withOpacity('--ui-text-muted'),
        'ui-text-accent': withOpacity('--ui-text-accent'),
        'ui-border-primary': withOpacity('--ui-border-primary'),
        'ui-bg-primary': withOpacity('--ui-bg-primary'),
        'ui-bg-primary-light': withOpacity('--ui-bg-primary-light'),
        'ui-bg-secondary': withOpacity('--ui-bg-secondary'),
        'ui-bg-secondary-light': withOpacity('--ui-bg-secondary-light'),

        'state-listening-bg': withOpacity('--state-listening-bg'),
        'state-waiting-bg': withOpacity('--state-waiting-bg'),
        'state-initializing-bg': withOpacity('--state-initializing-bg'),
        'state-thinking-bg': withOpacity('--state-thinking-bg'),

        'nav-text': withOpacity('--nav-text'),
        'nav-text-hover': withOpacity('--nav-text-hover'),
        'nav-text-active': withOpacity('--nav-text-active'),
        'nav-tooltip-bg': withOpacity('--nav-tooltip-bg'),
        'nav-tooltip-text': withOpacity('--nav-tooltip-text'),

        'toast-accent': withOpacity('--toast-accent'),
        'toast-bar': withOpacity('--toast-bar'),

        'card-title': withOpacity('--card-title'),
        
        'version-text': withOpacity('--version-text'),
      },
    },
  },
  plugins: [],
};
