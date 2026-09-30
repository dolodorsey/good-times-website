import fs from 'node:fs';
if(process.env.GITHUB_REPOSITORY!=='dolodorsey/good-times-website'||process.env.GITHUB_REF!=='refs/heads/web-desktop-v1')throw new Error('WEB isolation boundary required');
const edit=(file,fn)=>{const old=fs.readFileSync(file,'utf8'),next=fn(old);if(old!==next)fs.writeFileSync(file,next)};
edit('src/DirectRequest.jsx',s=>{
 if(!s.includes("from './lib/public-api-headers.js'"))s="import { publicApiHeaders } from './lib/public-api-headers.js';\n"+s;
 const old="headers: {\n          apikey: SUPABASE_KEY,\n          Authorization: `Bearer ${SUPABASE_KEY}`,\n          'Content-Type': 'application/json',\n          Prefer: 'return=minimal',\n        },";
 if(s.includes(old))s=s.replace(old,"headers: publicApiHeaders(SUPABASE_KEY, {\n          'Content-Type': 'application/json',\n          Prefer: 'return=minimal',\n        }),");
 if(s.includes('Authorization: `Bearer ${SUPABASE_KEY}`'))throw new Error('Unexpected direct request header shape');return s;
});
edit('src/features/experience/good-times-web-contract.css',s=>s.includes('WEB DIRECT FORM SCROLL')?s:s+`
/* WEB DIRECT FORM SCROLL: long public request forms must not be trapped by the app shell. */
html body#good-times-web.gt-web-mode #root .gt-premium-experience>main{height:100dvh!important;min-height:0!important;max-height:100dvh!important;width:100%!important;overflow-y:auto!important;overflow-x:hidden!important;box-sizing:border-box!important;scrollbar-width:thin!important}
`);
for(const file of ['scripts/web-full-qa.mjs','scripts/web-account-qa.mjs'])edit(file,s=>s.replace("chromium.launch({headless:true,args:['--no-sandbox']})","chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']})"));
edit('scripts/web-account-qa.mjs',s=>s.replace("if(auth.fail)return respond({msg:'Invalid login credentials'},400)","if(auth.fail)return respond({msg:typeof auth.fail==='string'?auth.fail:'Invalid login credentials'},400)").replace("signup handles confirmation-required response truthfully',async()=>{await","signup handles confirmation-required response truthfully',async()=>{auth.fail='Email not confirmed';await").replace('report.passed=report.errors.length===0;','report.passed=report.errors.length===0&&report.tests.length===14;'));
edit('scripts/web-full-qa.mjs',s=>{
 s=s.replace('report.passed=report.errors.length===0;','report.passed=report.errors.length===0&&report.checks.length>=116;');
 if(!s.includes('itinerary editing and export controls'))s=s.replace('if(width===1440){',`if(width===1440){
    await log('Desktop itinerary editing and export controls',async()=>{
      await nav(page,'Profile');await page.locator('.gtc-plan-tile').first().click();await page.locator('.gtc-itinerary').waitFor();
      const stop=()=>page.locator('.gtc-stop').first();const count=await page.locator('.gtc-stop').count();assert.ok(count>1);
      await stop().getByRole('button',{name:'Lock',exact:true}).click();assert.ok(await stop().getByRole('button',{name:'Remove',exact:true}).isDisabled());
      await stop().getByRole('button',{name:'Unlock',exact:true}).click();const original=await stop().locator('h2').innerText();
      await stop().getByRole('button',{name:'Move down',exact:true}).click();assert.notEqual(await stop().locator('h2').innerText(),original);
      await page.locator('.gtc-stop').nth(1).getByRole('button',{name:'Move up',exact:true}).click();assert.equal(await stop().locator('h2').innerText(),original);
      await stop().getByRole('button',{name:'Swap',exact:true}).click();await page.locator('.gtc-swap-choices button').first().waitFor();await page.locator('.gtc-swap-choices button').first().click();await page.locator('.gtc-swap').waitFor({state:'detached'});assert.notEqual(await stop().locator('h2').innerText(),original);
      await page.locator('.gtc-stop').last().getByRole('button',{name:'Remove',exact:true}).click();assert.equal(await page.locator('.gtc-stop').count(),count-1);
      await page.getByRole('button',{name:'Save changes',exact:true}).click();await page.getByRole('status').filter({hasText:'Plan saved.'}).waitFor();assert.equal(state.plans[0].stops.length,count-1);
      const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Add to calendar',exact:true}).click();const download=await pending;assert.equal(download.suggestedFilename(),'good-times-plan.ics');await download.saveAs(path.join(OUT,'verified-plan-export.ics'));assert.match(fs.readFileSync(path.join(OUT,'verified-plan-export.ics'),'utf8'),/BEGIN:VCALENDAR/);
      await page.evaluate(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:undefined});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__qaPlanClipboard=text}}})});
      await page.getByRole('button',{name:'Share details',exact:true}).click();await page.waitForFunction(()=>window.__qaPlanClipboard?.includes('Recommendations only.'));await page.getByRole('button',{name:'Close itinerary'}).click();
    });
 `);
 return s;
});
console.log('WEB request forms, guarded headers, account fixtures, planner export and truthful QA gates finalized.');
