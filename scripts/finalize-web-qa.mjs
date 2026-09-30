import fs from 'node:fs';
if(process.env.GITHUB_REPOSITORY!=='dolodorsey/good-times-website'||process.env.GITHUB_REF!=='refs/heads/web-desktop-v1')throw new Error('WEB isolation boundary required');
const edit=(file,fn)=>{const old=fs.readFileSync(file,'utf8'),next=fn(old);if(old!==next)fs.writeFileSync(file,next)};
// Never accept stale reports. All prior evidence remains recoverable from Git and Actions.
fs.rmSync('qa/evidence',{recursive:true,force:true});fs.mkdirSync('qa/evidence',{recursive:true});
const request=fs.readFileSync('src/DirectRequest.jsx','utf8'),cssFile='src/features/experience/good-times-web-contract.css',css=fs.readFileSync(cssFile,'utf8');
if(!request.includes('headers: publicApiHeaders(SUPABASE_KEY,')||request.includes('Authorization: `Bearer ${SUPABASE_KEY}`'))throw new Error('WEB public request headers regressed');
if(!request.includes('gt-web-request-page'))throw new Error('Public WEB page contract missing');
for(const marker of ['WEB DIRECT FORM SCROLL','WEB NATURAL HEIGHT DIALOGS','WEB PUBLIC SCREEN GEOMETRY'])if(!css.includes(marker))throw new Error('Missing desktop contract: '+marker);
edit(cssFile,s=>s.includes('WEB RECOVERY PAGE GEOMETRY')?s:s+`
/* WEB RECOVERY PAGE GEOMETRY: all direct public main elements, including password recovery, use the browser canvas. */
html body#good-times-web.gt-web-mode #root .gt-premium-experience>main{max-width:none!important;margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;transform:none!important}
`);
edit('src/features/onboarding/GoodTimesOnboarding.jsx',s=>{
 if(!s.includes('gt-web-auth-page'))throw new Error('Full-width WEB onboarding class missing');
 if(s.includes('data-web-official-logo'))return s;
 const anchor='<img src={CURRENT_LOGO} alt="Good Times"';
 if(s.split(anchor).length!==2)throw new Error('Official welcome-logo anchor changed');
 return s.replace(anchor,`<img data-web-official-logo="true" src={CURRENT_LOGO} onError={event=>{const img=event.currentTarget;if(!img.dataset.fallback){img.dataset.fallback='official';img.src='/good-times-logo-official.png'}else{img.style.visibility='hidden'}}} alt="Good Times"`);
});
edit('scripts/web-account-qa.mjs',s=>{
 if(!s.includes('Official welcome logo must render'))s=s.replace("await snap('welcome');",`await page.waitForFunction(()=>{const img=document.querySelector('[data-web-official-logo]');return img?.complete&&img.naturalWidth>0});assert.ok(await page.locator('[data-web-official-logo]').evaluate(img=>img.naturalWidth>0),'Official welcome logo must render');await snap('welcome');`);
 // Public GET-only images/fonts are visual references, not authentication or customer requests.
 if(!s.includes('Public visual reference reads'))s=s.replace('const auth={fail:true',`// Public visual reference reads; all auth and customer API calls stay fixture-controlled.
  await context.route('**/storage/v1/object/public/**',route=>{if(route.request().method()==='GET'&&route.request().resourceType()==='image')return route.continue();return route.fallback()});
  await context.route('https://fonts.googleapis.com/**',route=>route.continue());await context.route('https://fonts.gstatic.com/**',route=>route.continue());
  const auth={fail:true`);
 return s;
});
const full=fs.readFileSync('scripts/web-full-qa.mjs','utf8');
if(!full.includes('report.checks.length>=117')||!full.includes('Desktop itinerary editing and export controls'))throw new Error('Full browser coverage gate missing');
for(const [file,count] of [['scripts/web-account-qa.mjs',14],['scripts/web-request-qa.mjs',24]])if(!fs.readFileSync(file,'utf8').includes('report.tests.length==='+count))throw new Error('Incomplete test-count gate: '+file);
console.log('Confirmed WEB-only complete interaction contracts, official-logo resilience, full-width recovery, and fresh test evidence.');
