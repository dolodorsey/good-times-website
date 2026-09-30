import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const REPO='dolodorsey/good-times-website',BRANCH='refs/heads/web-desktop-v1',PIN='0e2c1fe81c695cb1ecc2f4ca7220d51203b9e10f';
if(process.env.GITHUB_REPOSITORY!==REPO||process.env.GITHUB_REF!==BRANCH)throw new Error('WEB isolation boundary mismatch');
const root=process.cwd(),source=path.join(root,'.web-reference-source');
if(execFileSync('git',['rev-parse','HEAD'],{cwd:source,encoding:'utf8'}).trim()!==PIN)throw new Error('Source pin mismatch');
const extensions=new Set(['.png','.jpg','.jpeg','.webp','.svg','.gif','.ico','.avif']);
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
let previous={};try{previous=JSON.parse(fs.readFileSync('qa/ISOLATION.json','utf8'))}catch{}
const restored=new Set(previous.restoredAssets||[]),added=[];
for(const src of walk(path.join(source,'public'))){if(!extensions.has(path.extname(src).toLowerCase()))continue;const relative=path.relative(source,src);if(!fs.existsSync(relative)){fs.mkdirSync(path.dirname(relative),{recursive:true});fs.copyFileSync(src,relative);added.push(relative);restored.add(relative)}}
const tests=['serve-dist.mjs','complete-upgrade-fixtures.mjs','complete-upgrade.test.mjs','complete-sports.test.mjs','gt-auth-client.test.mjs','gt-auth-session.test.mjs','direct-request-validation.test.mjs','search-intent.test.mjs','event-time-display.test.mjs','restaurant-details.test.mjs'];
for(const file of tests){const src=path.join(source,'scripts',file),dest=path.join('scripts',file);if(!fs.existsSync(src))throw new Error('Missing reference '+file);if(!fs.existsSync(dest))fs.copyFileSync(src,dest)}
function exactly(text,old,next){const count=text.split(old).length-1;if(count!==1)throw new Error('Patch anchor expected once: '+old+'; found '+count);return text.replace(old,next)}
let main=fs.readFileSync('src/main.jsx','utf8');
if(!main.includes("import './features/experience/good-times-web-contract.css'"))main=exactly(main,"import './features/experience/good-times-desktop-web.css'","import './features/experience/good-times-desktop-web.css'\nimport './features/experience/good-times-web-contract.css'");
if(!main.includes("document.body.classList.add('gt-web-mode')"))main=exactly(main,'const pathname = window.location.pathname',"document.body.classList.add('gt-web-mode')\n\nconst pathname = window.location.pathname");
fs.writeFileSync('src/main.jsx',main);
const appFile='src/features/experience/GoodTimesCommandAppV4.jsx';let app=fs.readFileSync(appFile,'utf8');
if(!app.includes('readWebRoute')){
 app="import {readWebRoute,writeWebRoute} from './web-navigation.js'\nimport './good-times-web-contract.css'\n"+app;
 app=exactly(app,"[tab,setTab]=useState('home')","[tab,setTab]=useState(()=>readWebRoute().tab)");
 app=exactly(app,'const goTab=id=>{','const goTab=id=>{writeWebRoute(id);');
 app=exactly(app,'onClick={()=>goTab(id)}><span>',"aria-current={tab===id?'page':undefined} onClick={()=>goTab(id)}><span>");
 const hook=`
  // Browser history is independent from the native app's navigation.
  useEffect(()=>{
    const restore=()=>{const route=readWebRoute();setTab(route.tab);setCollection(null);setSelectedCategory(null);setSelectedSubcategory(null);setDirectoryOpen(false);setMapMode(false);setQuery('');setGlobalQuery('');setSelectedEvent(null);setSelectedVenue(null);setSelectedPlan(null);setPreferencesOpen(false);setWeeklyOpen(false)};
    window.addEventListener('popstate',restore);
    return()=>window.removeEventListener('popstate',restore);
  },[])
 `;
 app=exactly(app,"  const returnTab=useRef('home')","  const returnTab=useRef('home')\n"+hook);
}
fs.writeFileSync(appFile,app);
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
pkg.scripts.test='node --test scripts/*.test.mjs';pkg.scripts['test:web']='node scripts/web-full-qa.mjs';pkg.scripts.verify='npm run test && npm run build && npm run test:web';
fs.writeFileSync('package.json',JSON.stringify(pkg,null,2)+'\n');
let native=fs.readFileSync('src/native.js','utf8');
if(native.includes("  window.open(url,'_blank','noopener,noreferrer');"))native=exactly(native,"  window.open(url,'_blank','noopener,noreferrer');","  let destination;\n  try { destination=new URL(url,window.location.origin); if(!['http:','https:'].includes(destination.protocol))return false; } catch { return false; }\n  window.open(destination.href,'_blank','noopener,noreferrer');");
fs.writeFileSync('src/native.js',native);
fs.mkdirSync('qa',{recursive:true});
fs.writeFileSync('qa/ISOLATION.json',JSON.stringify({repository:REPO,branch:'web-desktop-v1',sourceRepositoryReadOnly:'dolodorsey/good-times-app',sourceCommit:PIN,restoredAssets:[...restored],assetCount:restored.size,copiedTests:tests,productionDatabaseWrites:false,productionDomainChanged:false},null,2)+'\n');
console.log(JSON.stringify({restoredAssets:restored.size,newAssets:added,webOnly:true}));
