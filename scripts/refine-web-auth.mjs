import fs from 'node:fs';
if(process.env.GITHUB_REPOSITORY!=='dolodorsey/good-times-website'||process.env.GITHUB_REF!=='refs/heads/web-desktop-v1')throw new Error('WEB scope required');
const file='scripts/complete-upgrade-fixtures.mjs';let s=fs.readFileSync(file,'utf8');
if(!s.includes('signedOut')){
 for(const [from,to] of [
  ['context.addInitScript(({now,user})','context.addInitScript(({now,user,signedOut})'],
  [";localStorage.setItem('gt_session',JSON.stringify({access_token:'complete-test-session'",";if(!signedOut)localStorage.setItem('gt_session',JSON.stringify({access_token:'complete-test-session'"],
  ['{now:NOW,user:USER})','{now:NOW,user:USER,signedOut:state.startSignedOut===true})']
 ]){if(s.split(from).length!==2)throw new Error('Fixture anchor changed: '+from);s=s.replace(from,to)}
 fs.writeFileSync(file,s);
}
