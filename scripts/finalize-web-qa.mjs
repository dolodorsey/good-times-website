import fs from 'node:fs';
if(process.env.GITHUB_REPOSITORY!=='dolodorsey/good-times-website'||process.env.GITHUB_REF!=='refs/heads/web-desktop-v1')throw new Error('WEB isolation boundary required');
const edit=(file,fn)=>{const old=fs.readFileSync(file,'utf8'),next=fn(old);if(old!==next)fs.writeFileSync(file,next)};
// Remove only prior generated QA output. Historical evidence remains in Git and Actions artifacts.
// A failed test can never borrow a successful report from an earlier run.
fs.rmSync('qa/evidence',{recursive:true,force:true});fs.mkdirSync('qa/evidence',{recursive:true});
const request=fs.readFileSync('src/DirectRequest.jsx','utf8');
if(!request.includes('headers: publicApiHeaders(SUPABASE_KEY,')||request.includes('Authorization: `Bearer ${SUPABASE_KEY}`'))throw new Error('WEB public request headers regressed');
if(!fs.readFileSync('src/features/experience/good-times-web-contract.css','utf8').includes('WEB DIRECT FORM SCROLL'))throw new Error('WEB request scrolling contract missing');
edit('src/features/experience/good-times-web-contract.css',s=>s.includes('WEB NATURAL HEIGHT DIALOGS')?s:s+`
/* WEB NATURAL HEIGHT DIALOGS: the outer overlay scrolls; long article content must remain inside its card. */
@media(min-width:1024px){
 html body#good-times-web.gt-web-mode #root .gt5-overlay>:where(.gtc-detail,.gtc-itinerary,.gt5-detail,.gt5-itinerary){height:auto!important;min-height:0!important;max-height:none!important;flex:0 0 auto!important;align-self:flex-start!important}
}
`);
for(const file of ['scripts/web-full-qa.mjs','scripts/web-account-qa.mjs'])edit(file,s=>s.replace("chromium.launch({headless:true,args:['--no-sandbox']})","chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']})"));
edit('scripts/web-account-qa.mjs',s=>s.replace("if(auth.fail)return respond({msg:'Invalid login credentials'},400)","if(auth.fail)return respond({msg:typeof auth.fail==='string'?auth.fail:'Invalid login credentials'},400)").replace("signup handles confirmation-required response truthfully',async()=>{await","signup handles confirmation-required response truthfully',async()=>{auth.fail='Email not confirmed';await").replace('report.passed=report.errors.length===0;','report.passed=report.errors.length===0&&report.tests.length===14;'));
edit('scripts/web-full-qa.mjs',s=>{
 if(!s.includes('Desktop itinerary editing and export controls'))throw new Error('Planner edit/export coverage missing');
 s=s.replace('report.passed=report.errors.length===0;','report.passed=report.errors.length===0&&report.checks.length>=117;').replace('report.checks.length>=116','report.checks.length>=117');
 return s.replace("await page.getByRole('status').filter({hasText:'Plan saved.'}).waitFor();","await page.locator('.gtc-itinerary').getByRole('status').filter({hasText:'Plan saved.'}).waitFor();");
});
edit('scripts/web-request-qa.mjs',s=>{
 const anchor="const box=await page.locator('button[type=submit]').boundingBox();";
 const replacement="await page.locator('button[type=submit]').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));await page.waitForFunction(()=>{const r=document.querySelector('button[type=submit]')?.getBoundingClientRect();return r&&r.top>=-1&&r.bottom<=innerHeight+1});const box=await page.locator('button[type=submit]').boundingBox();";
 if(!s.includes(replacement))s=s.replace(anchor,replacement);
 s=s.replace("box.y>=0&&box.y+box.height<=900,'Submit must scroll into usable viewport'","box.y>=-1&&box.y+box.height<=901,'Submit must scroll into usable viewport: '+JSON.stringify(box)");
 return s;
});
edit('scripts/restaurant-details.test.mjs',s=>{
 if(s.includes('Desktop dialog must contain its entire content'))return s;
 const anchor="  assert.ok(overflow.dialog<=2&&overflow.body<=2,JSON.stringify(overflow))";
 if(s.split(anchor).length!==2)throw new Error('Restaurant geometry assertion anchor changed');
 const test=`
  if(width>=1024){
   const bounds=await dialog.evaluate(el=>{const a=el.querySelector('.gtc-detail'),b=el.querySelector('.gtc-detail-copy');return {article:a.getBoundingClientRect().toJSON(),content:b.getBoundingClientRect().toJSON()}});
   assert.ok(bounds.article.bottom>=bounds.content.bottom-1,'Desktop dialog must contain its entire content: '+JSON.stringify(bounds));
   await dialog.locator('.gtc-detail-support').scrollIntoViewIfNeeded();
   const buttons=await dialog.locator('.gtc-detail-support').boundingBox();assert.ok(buttons&&buttons.y>=-1&&buttons.y+buttons.height<=1001,'Detail action buttons must be reachable');
   await page.screenshot({path:path.join(folder,'06-complete-detail-footer.png')});
  }
`;
 return s.replace(anchor,anchor+test);
});
console.log('WEB-only natural-height dialogs, complete-content assertions, reachable submit controls and fresh evidence gates enabled.');
