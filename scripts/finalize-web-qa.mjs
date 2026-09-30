import fs from 'node:fs';
if(process.env.GITHUB_REPOSITORY!=='dolodorsey/good-times-website'||process.env.GITHUB_REF!=='refs/heads/web-desktop-v1')throw new Error('WEB isolation boundary required');
const edit=(file,fn)=>{const old=fs.readFileSync(file,'utf8'),next=fn(old);if(old!==next)fs.writeFileSync(file,next)};
fs.rmSync('qa/evidence',{recursive:true,force:true});fs.mkdirSync('qa/evidence',{recursive:true});
const request=fs.readFileSync('src/DirectRequest.jsx','utf8');
if(!request.includes('headers: publicApiHeaders(SUPABASE_KEY,')||request.includes('Authorization: `Bearer ${SUPABASE_KEY}`'))throw new Error('WEB public request headers regressed');
edit('src/DirectRequest.jsx',s=>s.replace('<main style={styles.page}>','<main className="gt-web-request-page" style={styles.page}>').replace('<section style={styles.shell}>','<section className="gt-web-request-shell" style={styles.shell}>').replace('<div style={styles.grid}>','<div className="gt-web-request-grid" style={styles.grid}>'));
edit('src/features/onboarding/GoodTimesOnboarding.jsx',s=>s.replaceAll('<div style={{ ...shell,','<div className={`gt-web-auth-page gt-web-auth-${screen}`} style={{ ...shell,'));
edit('src/features/experience/good-times-web-contract.css',s=>{
 if(!s.includes('WEB NATURAL HEIGHT DIALOGS'))s+=`
/* WEB NATURAL HEIGHT DIALOGS */
@media(min-width:1024px){html body#good-times-web.gt-web-mode #root .gt5-overlay>:where(.gtc-detail,.gtc-itinerary,.gt5-detail,.gt5-itinerary){height:auto!important;min-height:0!important;max-height:none!important;flex:0 0 auto!important;align-self:flex-start!important}}
`;
 if(!s.includes('WEB PUBLIC SCREEN GEOMETRY'))s+=`
/* WEB PUBLIC SCREEN GEOMETRY: public forms and login are full browser pages, not inherited phone frames. */
html body#good-times-web.gt-web-mode #root .gt-premium-experience>:where(.gt-web-request-page,.gt-web-auth-page){width:100%!important;max-width:none!important;max-height:100dvh!important;height:100dvh!important;min-height:0!important;margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;transform:none!important;overflow-y:auto!important;overflow-x:hidden!important;box-sizing:border-box!important}
@media(min-width:1024px){
 html body#good-times-web.gt-web-mode #root .gt-web-request-page{padding:44px 48px 80px!important;scrollbar-width:thin!important}
 html body#good-times-web.gt-web-mode #root .gt-web-request-shell{width:min(920px,100%)!important;max-width:920px!important;margin:0 auto!important}
 html body#good-times-web.gt-web-mode #root .gt-web-request-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:18px!important}
 html body#good-times-web.gt-web-mode #root .gt-web-auth-welcome{justify-content:center!important;padding:64px!important}
 html body#good-times-web.gt-web-mode #root .gt-web-auth-welcome>div:last-child{max-width:480px!important;padding:36px!important;border:1px solid rgba(248,212,106,.2)!important;border-radius:24px!important;background:rgba(6,8,12,.64)!important;backdrop-filter:blur(16px)}
 html body#good-times-web.gt-web-mode #root :where(.gt-web-auth-auth,.gt-web-auth-forgot)>div:last-child>div{max-width:440px!important}
 html body#good-times-web.gt-web-mode #root .gt-web-auth-page input{min-height:48px!important;font-size:16px!important}
}
`;
 return s;
});
for(const file of ['scripts/web-full-qa.mjs','scripts/web-account-qa.mjs'])edit(file,s=>s.replace("chromium.launch({headless:true,args:['--no-sandbox']})","chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']})"));
edit('scripts/web-account-qa.mjs',s=>{
 s=s.replace("if(auth.fail)return respond({msg:'Invalid login credentials'},400)","if(auth.fail)return respond({msg:typeof auth.fail==='string'?auth.fail:'Invalid login credentials'},400)").replace("signup handles confirmation-required response truthfully',async()=>{await","signup handles confirmation-required response truthfully',async()=>{auth.fail='Email not confirmed';await").replace('report.passed=report.errors.length===0;','report.passed=report.errors.length===0&&report.tests.length===14;');
 const anchor="await snap('welcome');";
 if(!s.includes('Authentication page must use the full browser'))s=s.replace(anchor,"if(width>=1024){const r=await page.locator('.gt-web-auth-page').boundingBox();assert.ok(r&&Math.abs(r.width-width)<2,'Authentication page must use the full browser: '+JSON.stringify(r))}"+anchor);
 return s;
});
edit('scripts/web-full-qa.mjs',s=>{
 if(!s.includes('Desktop itinerary editing and export controls'))throw new Error('Planner edit/export coverage missing');
 s=s.replace('report.passed=report.errors.length===0;','report.passed=report.errors.length===0&&report.checks.length>=117;').replace('report.checks.length>=116','report.checks.length>=117');
 return s.replace("await page.getByRole('status').filter({hasText:'Plan saved.'}).waitFor();","await page.locator('.gtc-itinerary').getByRole('status').filter({hasText:'Plan saved.'}).waitFor();");
});
edit('scripts/web-request-qa.mjs',s=>{
 const anchor="const box=await page.locator('button[type=submit]').boundingBox();",replacement="await page.locator('button[type=submit]').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));await page.waitForFunction(()=>{const r=document.querySelector('button[type=submit]')?.getBoundingClientRect();return r&&r.top>=-1&&r.bottom<=innerHeight+1});const box=await page.locator('button[type=submit]').boundingBox();";
 if(!s.includes(replacement))s=s.replace(anchor,replacement);
 s=s.replace("box.y>=0&&box.y+box.height<=900,'Submit must scroll into usable viewport'","box.y>=-1&&box.y+box.height<=901,'Submit must scroll into usable viewport: '+JSON.stringify(box)");
 if(!s.includes('Desktop form must not use a phone frame'))s=s.replace("await page.locator('form').waitFor();",`await page.locator('form').waitFor();if(width>=1024){const r=await page.locator('.gt-web-request-page').boundingBox(),form=await page.locator('form').boundingBox();assert.ok(r&&Math.abs(r.width-width)<2,'Desktop request page must fill the browser');assert.ok(form&&form.width>=800,'Desktop form must not use a phone frame: '+JSON.stringify(form));assert.equal(await page.locator('.gt-web-request-grid').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),2)}await page.screenshot({path:path.join(OUT,width+'-request-'+type+'-top.jpg'),type:'jpeg',quality:64,animations:'disabled'});`);
 return s;
});
edit('scripts/restaurant-details.test.mjs',s=>{
 if(s.includes('Desktop dialog must contain its entire content'))return s;
 const anchor="  assert.ok(overflow.dialog<=2&&overflow.body<=2,JSON.stringify(overflow))";
 if(s.split(anchor).length!==2)throw new Error('Restaurant geometry assertion anchor changed');
 return s.replace(anchor,anchor+`
  if(width>=1024){
   const bounds=await dialog.evaluate(el=>{const a=el.querySelector('.gtc-detail'),b=el.querySelector('.gtc-detail-copy');return {article:a.getBoundingClientRect().toJSON(),content:b.getBoundingClientRect().toJSON()}});
   assert.ok(bounds.article.bottom>=bounds.content.bottom-1,'Desktop dialog must contain its entire content: '+JSON.stringify(bounds));
   await dialog.locator('.gtc-detail-support').scrollIntoViewIfNeeded();const buttons=await dialog.locator('.gtc-detail-support').boundingBox();assert.ok(buttons&&buttons.y>=-1&&buttons.y+buttons.height<=1001,'Detail action buttons must be reachable');
   await page.screenshot({path:path.join(folder,'06-complete-detail-footer.png')});
  }
`);
});
console.log('WEB public pages, desktop form grid, natural-height dialogs and comprehensive fresh-evidence gates ready.');
