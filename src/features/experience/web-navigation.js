/** Browser-only navigation. No dependency on, or writes to, the mobile repository. */
export const WEB_TABS = new Set(['home','places','plan','entertainment','profile']);
export function readWebRoute(href = globalThis.location?.href || 'https://localhost/') {
  try { const url = new URL(href); const value = url.searchParams.get('view'); return {tab:WEB_TABS.has(value)?value:'home'}; }
  catch { return {tab:'home'}; }
}
export function writeWebRoute(tab) {
  if (!WEB_TABS.has(tab) || typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (tab === 'home') url.searchParams.delete('view'); else url.searchParams.set('view',tab);
  url.searchParams.delete('kind'); url.searchParams.delete('item');
  const next = url.pathname + url.search + url.hash;
  if (next !== window.location.pathname + window.location.search + window.location.hash) {
    window.history.pushState({goodTimesWeb:true,tab},'',next);
  }
}
