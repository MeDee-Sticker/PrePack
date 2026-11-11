import { normalizeSheetUrl } from './sheets';

export interface SiteConfig {
  /**
   * Google Apps Script Web App URL (ends with /exec) that rows are POSTed to.
   * Empty when the site has not been wired to a sheet deployment yet.
   */
  sheetUrl: string;
  /** Human-facing Google Sheet link, shown as a shortcut in the header. */
  spreadsheetUrl: string;
}

const EMPTY: SiteConfig = { sheetUrl: '', spreadsheetUrl: '' };

/**
 * Read site-wide settings from `/sheet-config.json`, served as a static file
 * next to the app. Keeping the sheet wiring here (instead of in localStorage)
 * means it is saved once for every device that opens the site. A missing or
 * invalid file simply means "not configured yet".
 */
export async function loadSiteConfig(): Promise<SiteConfig> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}sheet-config.json`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return EMPTY;

    const data: unknown = await response.json();
    if (!data || typeof data !== 'object') return EMPTY;

    const { sheetUrl, spreadsheetUrl } = data as {
      sheetUrl?: unknown;
      spreadsheetUrl?: unknown;
    };

    return {
      sheetUrl: typeof sheetUrl === 'string' ? normalizeSheetUrl(sheetUrl) : '',
      spreadsheetUrl: typeof spreadsheetUrl === 'string' ? spreadsheetUrl.trim() : '',
    };
  } catch {
    return EMPTY;
  }
}
