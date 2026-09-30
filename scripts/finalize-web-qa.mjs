import fs from 'node:fs';
if(process.env.GITHUB_REPOSITORY!=='dolodorsey/good-times-website'||process.env.GITHUB_REF!=='refs/heads/web-desktop-v1')throw new Error('WEB isolation boundary required');
const edit=(file,fn)=>{const old=fs.readFileSync(file,'utf8'),next=fn(old);if(old!==next)fs.writeFileSync(file,next)};
// The product corrections are committed. Never silently overwrite a subsequent product edit.
const request=fs.readFileSync('src/DirectRequest.jsx','utf8');
if(!request.includes('headers: publicApiHeaders(SUPABASE_KEY,')||request.includes('Authorization: `Bearer ${SUPABASE_KEY}`'))throw new Error('WEB public request headers regressed');
if(!fs.readFileSync('src/features/experience/good-times-web-contract.css','utf8').includes('WEB DIRECT FORM SCROLL'))throw new Error('WEB request scrolling contract missing');
for(const file of ['scripts/web-full-qa.mjs','scripts/web-account-qa.mjs'])edit(file,s=>s.replace("chromium.launch({headless:true,args:['--no-sandbox']})","chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']})"));
edit('scripts/web-account-qa.mjs',s=>s.replace("if(auth.fail)return respond({msg:'Invalid login credentials'},400)","if(auth.fail)return respond({msg:typeof auth.fail==='string'?auth.fail:'Invalid login credentials'},400)").replace("signup handles confirmation-required response truthfully',async()=>{await","signup handles confirmation-required response truthfully',async()=>{auth.fail='Email not confirmed';await").replace('report.passed=report.errors.length===0;','report.passed=report.errors.length===0&&report.tests.length===14;'));
edit('scripts/web-full-qa.mjs',s=>{
 if(!s.includes('Desktop itinerary editing and export controls'))throw new Error('Planner edit/export coverage missing');
 s=s.replace('report.passed=report.errors.length===0;','report.passed=report.errors.length===0&&report.checks.length>=117;').replace('report.checks.length>=116','report.checks.length>=117');
 // A successful save deliberately renders both an in-dialog receipt and a global toast.
 // Assert the in-dialog receipt without treating the second announcement as a product failure.
 return s.replace("await page.getByRole('status').filter({hasText:'Plan saved.'}).waitFor();","await page.locator('.gtc-itinerary').getByRole('status').filter({hasText:'Plan saved.'}).waitFor();");
});
edit('scripts/web-request-qa.mjs',s=>{
 const old="const box=await page.locator('button[type=submit]').boundingBox();";
 const next="await page.locator('button[type=submit]').scrollIntoViewIfNeeded();const box=await page.locator('button[type=submit]').boundingBox();";
 // Error text increases form height. Test that the button remains genuinely reachable by scrolling.
 return s.includes(next)?s:s.replace(old,next);
});
console.log('Confirmed committed WEB safeguards; exact-dialog assertions, reachable controls, and complete test-count gates enabled.');
