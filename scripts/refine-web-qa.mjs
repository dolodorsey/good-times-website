import fs from 'node:fs';
import path from 'node:path';
if(process.env.GITHUB_REPOSITORY!=='dolodorsey/good-times-website'||process.env.GITHUB_REF!=='refs/heads/web-desktop-v1')throw new Error('Not the isolated WEB branch');
const edit=(file,fn)=>{const old=fs.readFileSync(file,'utf8'),next=fn(old);if(next!==old)fs.writeFileSync(file,next)};
const once=(text,old,next)=>{if(text.includes(next))return text;if(text.split(old).length!==2)throw new Error('Unmatched reviewed patch: '+old);return text.replace(old,next)};
edit('index.html',s=>once(s,'<body>','<body id="good-times-web">'));
edit('src/features/experience/good-times-web-contract.css',s=>{
 s=s.replaceAll('body.gt-web-mode','body#good-times-web.gt-web-mode');
 if(!s.includes('WEB GEOMETRY OVERRIDE V2'))s+=`
/* WEB GEOMETRY OVERRIDE V2: a dedicated WEB body id outranks inherited phone/tablet shells. */
@media(min-width:1024px){
 html body#good-times-web.gt-web-mode #root,
 html body#good-times-web.gt-web-mode #root .gt-premium-experience,
 html body#good-times-web.gt-web-mode #root .gt-guest-mode,
 html body#good-times-web.gt-web-mode #root .gt5-app{position:relative!important;inset:auto!important;transform:none!important;padding:0!important;box-sizing:border-box!important;max-width:none!important;border-radius:0!important}
 html body#good-times-web.gt-web-mode #root .gt5-app{width:100vw!important;height:100dvh!important;gap:0!important;grid-template-columns:var(--gt-web-rail) minmax(0,1fr)!important;grid-template-rows:76px 44px minmax(0,1fr)!important}
 html body#good-times-web.gt-web-mode #root .gt5-app>.gt5-radar-strip{display:grid!important}
 html body#good-times-web.gt-web-mode #root .gt5-main{width:auto!important;max-width:none!important;max-height:none!important;left:auto!important;right:auto!important;transform:none!important}
 html body#good-times-web.gt-web-mode #root .gt5-nav{left:auto!important;right:auto!important;transform:none!important}
 html body#good-times-web.gt-web-mode #root .gtc-plan-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:18px!important}
 html body#good-times-web.gt-web-mode #root .gtc-plan-tile{min-width:0!important;min-height:190px!important;padding:24px!important}
 html body#good-times-web.gt-web-mode #root .gtc-profile-actions{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:18px!important}
}
@media(min-width:1600px){html body#good-times-web.gt-web-mode #root .gtc-plan-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
`;
 return s;
});
// Preserve source test assertions; bring their missing read-only documents into a QA-only reference directory.
for(const file of fs.readdirSync('scripts').filter(n=>n.endsWith('.test.mjs'))){
 edit('scripts/'+file,s=>s.replace(/fs\.readFileSync\((['"])((?:docs|supabase)\/[^'"]+)\1/g,(all,quote,relative)=>{
  const target=path.join('qa/reference',relative),source=path.join('.web-reference-source',relative);
  if(!fs.existsSync(source))throw new Error('Missing source test reference: '+relative);
  fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(source,target);
  return 'fs.readFileSync('+quote+target+quote;
 }));
}
// Add native browser form behavior in this WEB copy only.
edit('src/features/onboarding/GoodTimesOnboarding.jsx',s=>{
 s=s.replaceAll('<input value={name}', '<input aria-label="Full name" autoComplete="name" value={name}');
 s=s.replaceAll('<input value={email}', '<input aria-label="Email address" autoComplete="email" value={email}');
 s=s.replaceAll('<input value={password}', '<input aria-label="Password" autoComplete={mode===\'signin\'?\'current-password\':\'new-password\'} onKeyDown={event=>{if(event.key===\'Enter\'&&authValid&&!busy){event.preventDefault();void authenticate()}}} value={password}');
 return s;
});
edit('scripts/web-full-qa.mjs',s=>{
 s=once(s,"assert.ok(result.app&&result.main&&result.nav,'Customer shell must be rendered');","report.viewports.push({screen,...result,bodyClass:await page.locator('body').getAttribute('class')});\n assert.ok(result.app&&result.main&&result.nav,'Customer shell must be rendered');");
 s=s.replace('report.viewports.push({screen,...result});return {width,mainWidth:result.main.width,railWidth:result.nav.width};','return {width,mainWidth:result.main.width,railWidth:result.nav.width};');
 s=s.replace('await snap(page,`${width}-startup-failure`).catch(()=>{});continue','await snap(page,`${width}-startup-failure`).catch(()=>{});if(!await page.locator(\'.gt5-app\').count())continue');
 s=once(s,"assert.ok(/opium/i.test(await visibleText(page)));", "await page.waitForFunction(()=>/opium/i.test(document.body.innerText));assert.ok(/opium/i.test(await visibleText(page)));");
 return s;
});
console.log('Applied WEB-only geometry, form and verification corrections. Production app and databases untouched.');
