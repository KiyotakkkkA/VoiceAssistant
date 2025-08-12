export class ThemeResolver {
  scope: HTMLElement;
  prefix?: string;

  constructor(options?: { scope?: HTMLElement; prefix?: string }) {
    this.scope = options?.scope ?? document.documentElement;
    this.prefix = options?.prefix;
  }

  private static hexToRgbTuple(hex: string): [number, number, number] | null {
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

  private static flattenTokens(obj: Record<string, any>, parentKey = ''): Record<string, string | number> {
    const out: Record<string, string | number> = {};
    for (const [k, val] of Object.entries(obj)) {
      const key = parentKey ? `${parentKey}.${k}` : k;
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        Object.assign(out, ThemeResolver.flattenTokens(val as Record<string, any>, key));
      } else {
        out[key] = val as any;
      }
    }
    return out;
  }

  keyToCssVar(key: string): string {
    const prefix = this.prefix ? `${this.prefix}-` : '';
    const normalized = key
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    return `--${prefix}${normalized}`;
  }

  toCssVarValue(value: string | number): string {
    if (typeof value === 'number') return String(value);
    const v = String(value).trim();
    const tuple = ThemeResolver.hexToRgbTuple(v);
    if (tuple) return `${tuple[0]} ${tuple[1]} ${tuple[2]}`;
    if (/^\d+\s+\d+\s+\d+$/.test(v)) return v;
    return v;
  }

  apply(tokens: Record<string, string>) {
    const flat = ThemeResolver.flattenTokens(tokens as Record<string, any>);
    for (const [key, raw] of Object.entries(flat)) {
      const cssVar = this.keyToCssVar(key);
      const cssValue = this.toCssVarValue(raw);
      this.scope.style.setProperty(cssVar, cssValue);
    }
  }

  static setThemeOnHtml(themeKey: string) {
    document.documentElement.setAttribute('data-theme', themeKey);
  }
}
