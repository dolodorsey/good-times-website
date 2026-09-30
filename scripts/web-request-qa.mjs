import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {chromium} from 'playwright-core';import {install,makeState} from './complete-upgrade-fixtures.mjs';
const BASE='http://127.0.0.1:4190',OUT='qa/evidence',wait=ms=>new Promise(r=>setTimeout(r,ms));fs.mkdirSync(OUT,{recursive:true});
const report={scope:'Public WEB forms with all submissions intercepted. No real requests, emails, SMS or customer rows created.',tests:[],errors:[],liveDeliveryVerified:false};
const check=async(name,fn)=>{try{await fn();report.tests.push({name,status:'PASS'});console.log('PASS '+name)}catch(e){report.tests.push({name,status:'FAIL',error:e.message});report.errors.push({name,error:e.message});console.log('FAIL '+name+': '+e.message)}};
const server=spawn(process.execPath,['scripts/serve-dist.mjs'],{env:{...process.env,PORT:'4190',API_ORIGIN:'http://127.0.0.1:9',GT_UI_HEALTH_FIXTURE:'healthy'},stdio:'inherit'});let browser;
try{
 for(let i=0;i<70;i++){try{if((await fetch(BASE+'/api/health')).ok)break}catch{}await wait(100)}
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const width of [1440,390])for(const type of ['join','concierge-request','trip','group']){
  const context=await browser.newContext({viewport:{width,height:900},timezoneId:'America/New_York',reducedMotion:'reduce'}),state=makeState();await install(context,state);const submitted=[];let fail=true,attempts=0;
  await context.route('**/rest/v1/good_times_consumer_requests*',async route=>{attempts++;if(fail)return route.fulfill({status:503,contentType:'application/json',body:'{"message":"Please retry your request."}'});submitted.push({body:JSON.parse(route.request().postData()),headers:route.request().headers()});await wait(100);return route.fulfill({status:201,body:''})});
  const page=await context.newPage();page.setDefaultTimeout(8000);
  try{
   await check(width+' '+type+': complete form and invalid-submit protection',async()=>{await page.goto(BASE+'/'+type,{waitUntil:'domcontentloaded'});await page.locator('form').waitFor();assert.ok(await page.locator('h1').innerText());assert.ok(!(await page.getByRole('checkbox').isChecked()));await page.locator('button[type=submit]').click();assert.equal(attempts,0);assert.equal(await page.locator('#request-full_name').evaluate(el=>el===document.activeElement),true);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))});
   await check(width+' '+type+': usable scrolling, valid fields and recoverable error',async()=>{
    await page.locator('#request-full_name').fill('Web QA Member');await page.locator('#request-email').fill('QA@EXAMPLE.TEST');await page.locator('#request-city').fill('Atlanta');
    if(type!=='join')await page.locator('#request-preferred_date').fill('2026-10-10');
    if(type==='trip')await page.locator('#request-end_date').fill('2026-10-12');
    if(type==='trip'||type==='group')await page.locator('#request-group_size').fill('4');
    if(type==='group')await page.locator('#request-occasion').fill('Birthday');
    if(type==='join')await page.locator('#request-interests').fill('Dining and live music');
    if(type==='concierge-request')await page.locator('#request-notes').fill('Dinner and a live show for four people.');
    await page.locator('button[type=submit]').click();await page.getByRole('alert').getByText('Please retry your request.',{exact:true}).waitFor();assert.equal(submitted.length,0);assert.equal(await page.locator('#request-full_name').inputValue(),'Web QA Member');
    await page.locator('button[type=submit]').scrollIntoViewIfNeeded();const box=await page.locator('button[type=submit]').boundingBox();assert.ok(box&&box.y>=0&&box.y+box.height<=900,'Submit must scroll into usable viewport');await page.screenshot({path:path.join(OUT,width+'-request-'+type+'.jpg'),type:'jpeg',quality:64,animations:'disabled'});
   });
   await check(width+' '+type+': retry submits once with correct type and no implicit SMS consent',async()=>{fail=false;await page.locator('form').evaluate(form=>{form.requestSubmit();form.requestSubmit()});await page.getByRole('heading',{name:'Request received',exact:true}).waitFor();assert.equal(submitted.length,1);assert.equal(submitted[0].body.request_type,type);assert.equal(submitted[0].body.email,'qa@example.test');assert.equal(submitted[0].body.sms_consent,false);assert.equal(submitted[0].headers.authorization,undefined);assert.ok(submitted[0].headers.apikey.startsWith('sb_publishable_'));assert.equal(await page.getByRole('link',{name:'Open the Good Times app',exact:true}).getAttribute('href'),'/')});
  }finally{await context.close()}
 }
}finally{await browser?.close();server.kill();report.passed=report.errors.length===0&&report.tests.length===24;report.completedAt=new Date().toISOString();fs.writeFileSync(path.join(OUT,'request-report.json'),JSON.stringify(report,null,2));fs.writeFileSync(path.join(OUT,'REQUEST_REPORT.md'),['# WEB request-form verification','',report.scope,'',...report.tests.map(t=>'- '+t.status+': '+t.name+(t.error?' — '+t.error.split('\n')[0]:''))].join('\n'));console.log(JSON.stringify(report,null,2))}
if(!report.passed)process.exitCode=1;
