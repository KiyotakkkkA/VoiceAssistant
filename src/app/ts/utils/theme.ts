export type ThemeTokens = Record<string, string | number> | Record<string, any>;

export function keyToCssVar(key: string, opts?: { prefix?: string }): string {
  const prefix = opts?.prefix ? `${opts.prefix}-` : '';
  const normalized = key
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return `--${prefix}${normalized}`;
}

export function hexToRgbTuple(hex: string): [number, number, number] | null {
  let h = hex.trim();
  if (!h.startsWith('#')) return null;
  h = h.slice(1);
  if (h.length === 3 || h.length === 4) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return [r, g, b];
  }
  if (h.length === 6 || h.length === 8) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return [r, g, b];
  }
  return null;
}

export function toCssVarValue(value: string | number): string {
  if (typeof value === 'number') return String(value);
  const v = String(value).trim();
  const tuple = hexToRgbTuple(v);
  if (tuple) return `${tuple[0]} ${tuple[1]} ${tuple[2]}`;
  if (/^\d+\s+\d+\s+\d+$/.test(v)) return v;
  return v;
}

export function flattenTokens(
  obj: Record<string, any>,
  parentKey = ''
): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [k, val] of Object.entries(obj)) {
    const key = parentKey ? `${parentKey}.${k}` : k;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(out, flattenTokens(val as Record<string, any>, key));
    } else {
      out[key] = val as any;
    }
  }
  return out;
}

export interface ApplyThemeOptions {
  scope?: HTMLElement;
  prefix?: string;
}

export function applyThemeTokens(tokens: ThemeTokens, options?: ApplyThemeOptions) {
  const scope = options?.scope ?? document.documentElement;
  const flat = flattenTokens(tokens as Record<string, any>);
  for (const [key, raw] of Object.entries(flat)) {
    const cssVar = keyToCssVar(key, { prefix: options?.prefix });
    const cssValue = toCssVarValue(raw);
    scope.style.setProperty(cssVar, cssValue);
  }
}

export function setThemeOnHtml(themeKey: string) {
  document.documentElement.setAttribute('data-theme', themeKey);
}
