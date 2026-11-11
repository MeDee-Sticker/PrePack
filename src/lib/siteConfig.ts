import { normalizeSheetUrl } from './sheets';

export interface SiteConfig {
  /** Google Apps Script Web App URL configured for everyone who opens the site. */
  sheetUrl: string;
}

/**
 * Read the site-wide connection from `/sheet-config.json`, which is served as a
 * static file next to the app. Storing it there (instead of in localStorage)
 * means the pharmacy's sheet is saved once for every device that opens the app.
 * A missing or invalid file simply means "not configured yet".
 */
export async function loadSiteConfig(): Promise<SiteConfig> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}sheet-config.json`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return { sheetUrl: '' };

    const data: unknown = await response.json();
    if (!data || typeof data !== 'object') return { sheetUrl: '' };

    const url = (data as { sheetUrl?: unknown }).sheetUrl;
    return { sheetUrl: typeof url === 'string' ? normalizeSheetUrl(url) : '' };
  } catch {
    return { sheetUrl: '' };
  }
}
