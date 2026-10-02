/** GOOD TIMES Web Bridge
 * Desktop/browser compatibility layer. Native mobile behavior remains exclusively
 * in dolodorsey/good-times-app and is intentionally not bundled here.
 */
export const isNative = false;
export const isIOS = false;

export async function initNative(){ return false; }
export async function tapHaptic(){ return false; }
export async function heavyHaptic(){ return false; }

export async function shareContent({
  title='GOOD TIMES',
  text='',
  url=typeof window!=='undefined'?window.location.href:'https://thegoodtimesworldwide.com',
}={}){
  if(typeof navigator!=='undefined'&&navigator.share){
    try{
      await navigator.share({title,text,url});
      return true;
    }catch(error){
      if(error?.name==='AbortError')return false;
    }
  }
  try{
    const value=[text,url].filter(Boolean).join('\n');
    if(navigator?.clipboard?.writeText){
      await navigator.clipboard.writeText(value);
      return true;
    }
  }catch{}
  return false;
}

export async function shareEvent(event={}){
  return shareContent({
    title:event.title||'GOOD TIMES',
    text:[event.title,event.venue||event.venue_name,event.date||event.event_date,'Found on GOOD TIMES'].filter(Boolean).join(' — '),
    url:typeof window!=='undefined'?window.location.href:'https://thegoodtimesworldwide.com',
  });
}

export async function openLink(url){
  if(!url||typeof window==='undefined')return false;
  let destination;
  try { destination=new URL(url,window.location.origin); if(!['http:','https:'].includes(destination.protocol))return false; } catch { return false; }
  window.open(destination.href,'_blank','noopener,noreferrer');
  return true;
}

export async function registerPush(){
  // Web push is not enabled in V1. Keep API-compatible behavior without invoking native permission flows.
  return 'unsupported';
}
