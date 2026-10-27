const STORAGE_KEY='calisteniaTracker_v1';
const plans={
 A:{title:'Força geral',subtitle:'Costas, peito, pernas e abdômen',duration:'35–45 min',exercises:[
  {name:'Barra fixa pronada',target:'3–5 reps',sets:4,reps:4,rest:150,desc:'Pegada pronada, suba sem embalo e desça com controle.'},
  {name:'Flexão de braço',target:'8–12 reps',sets:3,reps:10,rest:90,desc:'Corpo alinhado e cotovelos em ângulo confortável.'},
  {name:'Agachamento com faixa',target:'12–20 reps',sets:3,reps:15,rest:90,desc:'Pise na faixa, segure as pontas junto aos ombros e mantenha o tronco firme.'},
  {name:'Ponte de glúteos',target:'15–20 reps',sets:3,reps:15,rest:60,desc:'Contraia os glúteos no alto sem hiperestender a lombar. Opcional: faixa acima dos joelhos.'},
  {name:'Elevação de pernas deitado',target:'10–15 reps',sets:3,reps:12,rest:60,desc:'Mantenha a lombar controlada contra o cochonete.'}
 ]},
 B:{title:'Peito, ombros e pernas',subtitle:'Empurrar, unilateral e estabilidade',duration:'35–45 min',exercises:[
  {name:'Barra fixa supinada',target:'3–5 reps',sets:3,reps:4,rest:150,desc:'Palmas voltadas para você; sem balanço e sem forçar os ombros.'},
  {name:'Flexão com pés elevados',target:'6–12 reps',sets:3,reps:8,rest:90,desc:'Use apenas um apoio baixo e estável. Se não tiver, faça flexão tradicional.'},
  {name:'Agachamento búlgaro ou passada',target:'8–12 por perna',sets:3,reps:10,rest:90,desc:'Use apoio firme se fizer búlgaro. A faixa pode ser usada se der resistência segura.'},
  {name:'Pike push-up',target:'5–10 reps',sets:3,reps:6,rest:90,desc:'Quadril alto, cabeça descendo entre as mãos; reduza a amplitude se necessário.'},
  {name:'Prancha abdominal',target:'40–60 s',sets:3,reps:45,rest:60,unit:'s',desc:'Contraia abdômen e glúteos, sem deixar a lombar afundar.'}
 ]},
 C:{title:'Costas, braços e posterior',subtitle:'Puxada, cadeia posterior e core',duration:'35–45 min',exercises:[
  {name:'Barra fixa pronada',target:'3–5 reps',sets:3,reps:4,rest:150,desc:'Deixe 1–2 repetições na reserva, mantendo cada repetição limpa.'},
  {name:'Flexão de braço',target:'8–15 reps',sets:3,reps:10,rest:90,desc:'Pare antes de perder o alinhamento corporal.'},
  {name:'Passada para trás',target:'10–12 por perna',sets:3,reps:10,rest:90,desc:'Passo controlado e joelho alinhado com o pé. Pode usar faixa se for seguro.'},
  {name:'Terra romeno com faixa',target:'12–15 reps',sets:3,reps:12,rest:90,desc:'Pise no meio da faixa, segure as pontas e leve o quadril para trás com coluna neutra.'},
  {name:'Barra fixa negativa',target:'3 descidas lentas',sets:2,reps:3,rest:120,desc:'Use apoio estável para começar no alto e desça por 3–5 segundos. Não salte para a barra.'},
  {name:'Abdominal bicicleta',target:'12–20 por lado',sets:3,reps:12,rest:60,desc:'Gire o tronco controladamente, sem puxar o pescoço.'}
 ]}
};
let state=loadState(), currentDay='A', session={}, timerInterval=null, timerRemaining=0, timerTotal=90, timerRunning=false, toastTimeout=null;
function loadState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||{history:[],drafts:{},defaultRest:90}}catch(e){return{history:[],drafts:{},defaultRest:90}}}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function todayKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function dateLabel(date){return new Date(date+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'})}
function weekStart(d=new Date()){const x=new Date(d);x.setHours(0,0,0,0);const day=(x.getDay()+6)%7;x.setDate(x.getDate()-day);return x}
function inLastDays(date,n){const d=new Date(date+'T12:00:00'),now=new Date();return d>=new Date(now.getFullYear(),now.getMonth(),now.getDate()-n+1)}
function weekCount(){const start=weekStart();return state.history.filter(h=>new Date(h.date+'T12:00:00')>=start).length}
function renderHome(){
 document.getElementById('weekCount').textContent=weekCount();document.getElementById('totalCount').textContent=state.history.length;
 const cards=document.getElementById('workoutCards');cards.innerHTML='';
 Object.entries(plans).forEach(([key,p])=>{const card=document.createElement('button');card.className='workout-card';card.innerHTML=`<div class="card-top"><div class="letter">${key}</div><span class="card-arrow">↗</span></div><h3>${p.title}</h3><p>${p.subtitle}</p><div class="card-bottom"><span>${p.exercises.length} exercícios · ${p.duration}</span><strong>Começar →</strong></div>`;card.addEventListener('click',()=>openWorkout(key));cards.appendChild(card)})
}
function showView(id){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===id));if(id==='historyView')renderHistory();if(id==='homeView')renderHome();window.scrollTo({top:0,behavior:'smooth'})}
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
function openWorkout(day){
 currentDay=day;const p=plans[day];session=JSON.parse(JSON.stringify(state.drafts[day]||{}));
 document.getElementById('workoutPill').textContent='TREINO '+day;document.getElementById('workoutTitle').textContent=p.title;document.getElementById('workoutSubtitle').textContent=p.subtitle;
 const list=document.getElementById('exerciseList');list.innerHTML='';
 p.exercises.forEach((ex,i)=>{
  const saved=session[i]||{sets:Array.from({length:ex.sets},()=>({reps:ex.reps,done:false}))};saved.sets ||= [];while(saved.sets.length<ex.sets)saved.sets.push({reps:ex.reps,done:false});session[i]=saved;
  const card=document.createElement('article');card.className='exercise-card';
  card.innerHTML=`<div class="exercise-head"><div class="exercise-number">${String(i+1).padStart(2,'0')}</div><div class="exercise-title"><h3>${ex.name}</h3><p>${ex.desc}</p></div><span class="exercise-target">${ex.target}</span></div><div class="set-header"><span>Série</span><span>Repetições${ex.unit==='s'?' / seg':''}</span><span>Concluída</span><span></span></div><div class="sets"></div><div class="exercise-actions"><button class="mini-btn add-set">＋ Adicionar série</button><button class="rest-btn">▶ Descansar ${formatTime(Number(state.defaultRest)||90)}</button></div>`;
  const sets=card.querySelector('.sets');
  function renderSets(){sets.innerHTML='';saved.sets.forEach((s,j)=>{const row=document.createElement('div');row.className='set-row';row.innerHTML=`<span class="set-num">${j+1}</span><input class="rep-input" type="number" min="0" max="999" inputmode="numeric" aria-label="Repetições série ${j+1}" value="${s.reps}"><span class="set-num">${s.done?'Feita':'Pendente'}</span><button class="set-done ${s.done?'checked':''}" aria-label="${s.done?'Desmarcar':'Concluir'} série ${j+1}">${s.done?'✓':'○'}</button>`;
   const inp=row.querySelector('input');inp.addEventListener('change',()=>{s.reps=Math.max(0,Number(inp.value)||0);saveDraft()});row.querySelector('button').addEventListener('click',()=>{s.done=!s.done;renderSets();updateProgress();saveDraft();if(s.done)startTimer(Number(state.defaultRest)||90)});sets.appendChild(row)})}
  renderSets();
  card.querySelector('.add-set').addEventListener('click',()=>{saved.sets.push({reps:ex.reps,done:false});renderSets();saveDraft();showToast('Série adicionada')});
  card.querySelector('.rest-btn').addEventListener('click',()=>startTimer(Number(state.defaultRest)||90));
  list.appendChild(card);
 });
 updateProgress();showView('workoutView');
}
function saveDraft(){state.drafts[currentDay]=session;saveState()}
function updateProgress(){const total=plans[currentDay].exercises.length;let completed=0;plans[currentDay].exercises.forEach((e,i)=>{if((session[i]?.sets||[]).length && session[i].sets.every(s=>s.done))completed++});document.getElementById('workoutProgress').style.width=(completed/total*100)+'%';document.getElementById('progressText').textContent=`${completed} de ${total} exercícios concluídos`}
document.getElementById('backHome').addEventListener('click',()=>{saveDraft();showView('homeView')});
document.getElementById('finishWorkout').addEventListener('click',()=>{
 const p=plans[currentDay], entries=p.exercises.map((ex,i)=>({name:ex.name,sets:(session[i]?.sets||[]).map(s=>({reps:Number(s.reps)||0,done:!!s.done}))}));
 const doneCount=entries.reduce((n,e)=>n+e.sets.filter(s=>s.done).length,0);if(doneCount===0){if(!confirm('Você ainda não marcou nenhuma série como concluída. Salvar mesmo assim?'))return}
 const entry={id:Date.now(),day:currentDay,title:p.title,date:todayKey(),createdAt:new Date().toISOString(),exercises:entries};
 state.history.unshift(entry);delete state.drafts[currentDay];saveState();renderHome();renderHistory();showView('historyView');showToast('Treino salvo no histórico! 💪')
});
function renderHistory(){
 const hist=state.history;document.getElementById('historyTotal').textContent=hist.length;document.getElementById('historyWeek').textContent=weekCount();document.getElementById('historyMonth').textContent=hist.filter(h=>inLastDays(h.date,30)).length;
 const chart=document.getElementById('weeklyChart');chart.innerHTML='';const start=weekStart();const labels=[];
 for(let i=3;i>=0;i--){const s=new Date(start);s.setDate(s.getDate()-i*7);const e=new Date(s);e.setDate(e.getDate()+7);const n=hist.filter(h=>{const d=new Date(h.date+'T12:00:00');return d>=s&&d<e}).length;labels.push({label:s.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}).replace('.',''),n})}
 const max=Math.max(1,...labels.map(x=>x.n));labels.forEach(x=>{const el=document.createElement('div');el.className='bar-item';el.innerHTML=`<span class="bar-count">${x.n}</span><div class="bar" style="height:${Math.max(4,x.n/max*78)}px"></div><span class="bar-label">${x.label}</span>`;chart.appendChild(el)});
 const list=document.getElementById('historyList');list.innerHTML='';if(!hist.length){list.innerHTML='<div class="empty-state">Ainda não há treinos registrados.<br>Conclua seu primeiro treino para começar a acompanhar sua evolução.</div>';return}
 hist.slice(0,20).forEach(h=>{const sets=h.exercises.reduce((n,e)=>n+e.sets.filter(s=>s.done).length,0);const el=document.createElement('div');el.className='history-item';el.innerHTML=`<div class="history-letter">${h.day}</div><div class="history-details"><strong>${h.title}</strong><p>${dateLabel(h.date)} · ${sets} séries concluídas</p></div><span class="history-duration">${h.exercises.length} exercícios</span>`;list.appendChild(el)})
}
function formatTime(sec){const m=Math.floor(sec/60),s=sec%60;return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`}
function startTimer(seconds){clearInterval(timerInterval);timerTotal=seconds;timerRemaining=seconds;timerRunning=true;document.getElementById('timerDock').classList.remove('hidden');updateTimer();timerInterval=setInterval(()=>{if(!timerRunning)return;timerRemaining--;updateTimer();if(timerRemaining<=0){clearInterval(timerInterval);timerRunning=false;beep();showToast('Descanso concluído! Volte ao treino.');document.getElementById('timerPause').textContent='▶'}},1000)}
function updateTimer(){document.getElementById('timerValue').textContent=formatTime(Math.max(0,timerRemaining));document.getElementById('timerBar').style.width=(timerTotal?timerRemaining/timerTotal*100:0)+'%';document.getElementById('timerPause').textContent=timerRunning?'Ⅱ':'▶'}
function beep(){try{const C=window.AudioContext||window.webkitAudioContext;if(C){const c=new C(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=740;g.gain.value=.08;o.start();o.stop(c.currentTime+.25)}}catch(e){}}
document.getElementById('timerPause').addEventListener('click',()=>{timerRunning=!timerRunning;updateTimer()});
document.getElementById('timerReset').addEventListener('click',()=>{timerRemaining=timerTotal;timerRunning=true;updateTimer()});
document.getElementById('timerClose').addEventListener('click',()=>{clearInterval(timerInterval);timerRunning=false;document.getElementById('timerDock').classList.add('hidden')});
function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>t.classList.remove('show'),2400)}
function exportBackup(){const blob=new Blob([JSON.stringify({app:'Calistenia Tracker',version:1,exportedAt:new Date().toISOString(),data:state},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`calistenia-backup-${todayKey()}.json`;a.click();URL.revokeObjectURL(url);showToast('Backup exportado')}
document.getElementById('exportBtn').addEventListener('click',exportBackup);document.getElementById('exportBtn2').addEventListener('click',exportBackup);
document.getElementById('importInput').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const parsed=JSON.parse(await file.text());const incoming=parsed.data||parsed;if(!Array.isArray(incoming.history))throw new Error('Arquivo inválido');if(confirm(`Importar backup com ${incoming.history.length} treinos? Os dados locais serão substituídos.`)){state={history:incoming.history,drafts:incoming.drafts||{},defaultRest:incoming.defaultRest||90};saveState();renderHome();renderHistory();document.getElementById('defaultRest').value=state.defaultRest;showToast('Backup importado')}}catch(err){alert('Não foi possível importar esse arquivo. Selecione um backup JSON válido do Calistenia Tracker.')}e.target.value=''});
document.getElementById('defaultRest').value=state.defaultRest||90;document.getElementById('defaultRest').addEventListener('change',e=>{state.defaultRest=Number(e.target.value);saveState();showToast('Descanso padrão atualizado')});
document.getElementById('clearData').addEventListener('click',()=>{if(confirm('Tem certeza? Todo o histórico e os rascunhos locais serão apagados.')){state={history:[],drafts:{},defaultRest:90};saveState();renderHome();renderHistory();showToast('Dados locais apagados')}});
let deferredPrompt=null;const installBtn=document.getElementById('installBtn');window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;installBtn.classList.remove('hidden')});installBtn.addEventListener('click',async()=>{if(!deferredPrompt){showToast('Use o menu do navegador e escolha “Adicionar à tela inicial”.');return}deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;installBtn.classList.add('hidden')});
if('serviceWorker' in navigator && location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
renderHome();renderHistory();
