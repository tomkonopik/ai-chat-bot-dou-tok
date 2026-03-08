// ============================
// Game Template Library
// ============================
// Each function returns { html: string, title: string }

const BASE_STYLE = `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', system-ui, sans-serif; background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; overflow: hidden; }`;

// ---- MINECRAFT-STYLE BLOCK BUILDER ----
export function gameMinecraft(): { html: string; title: string } {
  return {
    title: '⛏️ Block Builder — DouTok AI',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
${BASE_STYLE}
canvas { border: 2px solid rgba(255,255,255,0.2); border-radius: 8px; cursor: crosshair; image-rendering: pixelated; }
h1 { font-size: 1.6rem; margin: 16px 0 8px; }
.toolbar { display: flex; gap: 6px; margin: 10px 0; }
.block { width: 36px; height: 36px; border-radius: 6px; cursor: pointer; border: 2px solid transparent; transition: 0.2s; }
.block.active { border-color: white; transform: scale(1.15); }
.hint { font-size: 0.85rem; opacity: 0.5; margin-top: 8px; }
</style></head><body>
<h1>⛏️ Block Builder</h1>
<div class="toolbar" id="tb"></div>
<canvas id="c" width="480" height="360"></canvas>
<p class="hint">Levé tlačítko = postav blok · Pravé tlačítko = zruš blok</p>
<script>
const COLS=24,ROWS=18,S=20;
const blocks=[
  {name:'Tráva',color:'#4a7c3f'},{name:'Hlína',color:'#8B6914'},
  {name:'Kámen',color:'#808080'},{name:'Dřevo',color:'#8B5E3C'},
  {name:'Listí',color:'#2d6b1e'},{name:'Voda',color:'#3366cc'},
  {name:'Písek',color:'#d4b862'},{name:'Cihly',color:'#b04030'},
  {name:'Zlato',color:'#ffd700'},{name:'Lava',color:'#ff4500'}
];
let sel=0;
const grid=Array.from({length:ROWS},()=>Array(COLS).fill(-1));
const c=document.getElementById('c'),ctx=c.getContext('2d');
const tb=document.getElementById('tb');
blocks.forEach((b,i)=>{
  const d=document.createElement('div');
  d.className='block'+(i===0?' active':'');
  d.style.background=b.color;
  d.title=b.name;
  d.onclick=()=>{sel=i;document.querySelectorAll('.block').forEach(x=>x.classList.remove('active'));d.classList.add('active');};
  tb.appendChild(d);
});
function draw(){
  ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,480,360);
  for(let r=0;r<ROWS;r++)for(let cl=0;cl<COLS;cl++){
    if(grid[r][cl]>=0){ctx.fillStyle=blocks[grid[r][cl]].color;ctx.fillRect(cl*S,r*S,S-1,S-1);}
    else{ctx.strokeStyle='rgba(255,255,255,0.05)';ctx.strokeRect(cl*S,r*S,S-1,S-1);}
  }
}
c.addEventListener('mousedown',e=>{
  e.preventDefault();
  const r=Math.floor(e.offsetY/S),cl=Math.floor(e.offsetX/S);
  if(r>=0&&r<ROWS&&cl>=0&&cl<COLS){
    if(e.button===2)grid[r][cl]=-1; else grid[r][cl]=sel;
    draw();
  }
});
c.addEventListener('mousemove',e=>{
  if(e.buttons===1){const r=Math.floor(e.offsetY/S),cl=Math.floor(e.offsetX/S);if(r>=0&&r<ROWS&&cl>=0&&cl<COLS){grid[r][cl]=sel;draw();}}
  if(e.buttons===2){const r=Math.floor(e.offsetY/S),cl=Math.floor(e.offsetX/S);if(r>=0&&r<ROWS&&cl>=0&&cl<COLS){grid[r][cl]=-1;draw();}}
});
c.addEventListener('contextmenu',e=>e.preventDefault());
draw();
</script></body></html>`
  };
}

// ---- SNAKE GAME ----
export function gameSnake(): { html: string; title: string } {
  return {
    title: '🐍 Snake — DouTok AI',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
${BASE_STYLE}
canvas { border: 2px solid rgba(255,255,255,0.2); border-radius: 8px; }
h1 { font-size: 1.6rem; margin: 16px 0 8px; }
.info { display: flex; gap: 30px; margin: 10px 0; font-size: 1.1rem; }
.info span { opacity: 0.7; }
button { padding: 10px 28px; border-radius: 10px; background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.2); font-size: 1rem; cursor: pointer; margin-top: 10px; }
button:hover { background: rgba(255,255,255,0.25); }
</style></head><body>
<h1>🐍 Snake</h1>
<div class="info"><span>Skóre: <b id="sc">0</b></span><span>Rekord: <b id="hi">0</b></span></div>
<canvas id="c" width="400" height="400"></canvas>
<button onclick="startGame()">Nová hra</button>
<script>
const c=document.getElementById('c'),ctx=c.getContext('2d');
const S=20,W=20,H=20;
let snake,dir,food,score,best=0,alive,interval;
function startGame(){
  snake=[{x:10,y:10}];dir={x:1,y:0};score=0;alive=true;
  document.getElementById('sc').textContent='0';
  placeFood();
  if(interval)clearInterval(interval);
  interval=setInterval(tick,100);
}
function placeFood(){
  do{food={x:Math.floor(Math.random()*W),y:Math.floor(Math.random()*H)};}
  while(snake.some(s=>s.x===food.x&&s.y===food.y));
}
function tick(){
  if(!alive)return;
  const head={x:snake[0].x+dir.x,y:snake[0].y+dir.y};
  if(head.x<0||head.x>=W||head.y<0||head.y>=H||snake.some(s=>s.x===head.x&&s.y===head.y)){
    alive=false;clearInterval(interval);
    if(score>best){best=score;document.getElementById('hi').textContent=best;}
    return;
  }
  snake.unshift(head);
  if(head.x===food.x&&head.y===food.y){score++;document.getElementById('sc').textContent=score;placeFood();}
  else snake.pop();
  draw();
}
function draw(){
  ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,400,400);
  ctx.fillStyle='#4ecdc4';
  snake.forEach((s,i)=>{ctx.globalAlpha=1-i*0.03;ctx.fillRect(s.x*S+1,s.y*S+1,S-2,S-2);});
  ctx.globalAlpha=1;
  ctx.fillStyle='#ff6b6b';ctx.fillRect(food.x*S+2,food.y*S+2,S-4,S-4);
  if(!alive){ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(0,0,400,400);ctx.fillStyle='white';ctx.font='bold 28px sans-serif';ctx.textAlign='center';ctx.fillText('Game Over!',200,190);ctx.font='18px sans-serif';ctx.fillText('Skóre: '+score,200,220);}
}
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowUp'&&dir.y!==1)dir={x:0,y:-1};
  if(e.key==='ArrowDown'&&dir.y!==-1)dir={x:0,y:1};
  if(e.key==='ArrowLeft'&&dir.x!==1)dir={x:-1,y:0};
  if(e.key==='ArrowRight'&&dir.x!==-1)dir={x:1,y:0};
});
startGame();
</script></body></html>`
  };
}

// ---- FLAPPY BIRD ----
export function gameFlappy(): { html: string; title: string } {
  return {
    title: '🐤 Flappy Bird — DouTok AI',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
${BASE_STYLE}
canvas { border: 2px solid rgba(255,255,255,0.2); border-radius: 8px; cursor: pointer; }
h1 { font-size: 1.6rem; margin: 16px 0 8px; }
.info { margin: 10px 0; font-size: 1.1rem; opacity: 0.7; }
</style></head><body>
<h1>🐤 Flappy Bird</h1>
<p class="info">Skóre: <b id="sc">0</b> · Rekord: <b id="hi">0</b></p>
<canvas id="c" width="320" height="480"></canvas>
<script>
const c=document.getElementById('c'),ctx=c.getContext('2d');
let bird,pipes,score,best=0,alive,frame;
const GAP=120,PW=50,G=0.35,JUMP=-6;
function start(){
  bird={y:240,v:0};pipes=[];score=0;alive=true;frame=0;
  document.getElementById('sc').textContent='0';
  loop();
}
function loop(){
  if(!alive)return;
  frame++;
  bird.v+=G;bird.y+=bird.v;
  if(frame%90===0)pipes.push({x:320,top:Math.random()*200+50});
  pipes.forEach(p=>{p.x-=2;});
  pipes=pipes.filter(p=>p.x>-PW);
  pipes.forEach(p=>{
    if(!p.scored&&p.x+PW<50){p.scored=true;score++;document.getElementById('sc').textContent=score;}
    if(50>p.x&&50<p.x+PW){if(bird.y<p.top||bird.y>p.top+GAP){alive=false;}}
  });
  if(bird.y>480||bird.y<0)alive=false;
  ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,320,480);
  ctx.fillStyle='#ffd93d';ctx.beginPath();ctx.arc(50,bird.y,14,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#4ecdc4';
  pipes.forEach(p=>{ctx.fillRect(p.x,0,PW,p.top);ctx.fillRect(p.x,p.top+GAP,PW,480-p.top-GAP);});
  ctx.fillStyle='white';ctx.font='bold 22px sans-serif';ctx.textAlign='center';ctx.fillText(score,160,40);
  if(!alive){
    if(score>best){best=score;document.getElementById('hi').textContent=best;}
    ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(0,0,320,480);
    ctx.fillStyle='white';ctx.font='bold 28px sans-serif';ctx.fillText('Game Over!',160,220);
    ctx.font='18px sans-serif';ctx.fillText('Klikni pro restart',160,260);
    return;
  }
  requestAnimationFrame(loop);
}
function flap(){if(!alive){start();}else{bird.v=JUMP;}}
c.addEventListener('click',flap);
document.addEventListener('keydown',e=>{if(e.key===' ')flap();});
start();
</script></body></html>`
  };
}

// ---- PONG ----
export function gamePong(): { html: string; title: string } {
  return {
    title: '🏓 Pong — DouTok AI',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
${BASE_STYLE}
canvas { border: 2px solid rgba(255,255,255,0.2); border-radius: 8px; }
h1 { font-size: 1.6rem; margin: 16px 0 8px; }
.info { margin: 10px 0; font-size: 1.1rem; opacity: 0.7; }
</style></head><body>
<h1>🏓 Pong</h1>
<p class="info">Hráč: <b id="ps">0</b> · AI: <b id="as">0</b></p>
<canvas id="c" width="500" height="350"></canvas>
<script>
const c=document.getElementById('c'),ctx=c.getContext('2d');
const PH=70,PW=10,BS=7;
let py=140,ay=140,bx=250,by=175,bvx=BS,bvy=3,ps=0,as=0,mouseY=175;
c.addEventListener('mousemove',e=>{mouseY=e.offsetY;});
function reset(){bx=250;by=175;bvx=BS*(Math.random()>0.5?1:-1);bvy=(Math.random()-0.5)*6;}
function loop(){
  py+=(mouseY-py-PH/2)*0.15;
  const aiTarget=by-PH/2;ay+=(aiTarget-ay)*0.06;
  bx+=bvx;by+=bvy;
  if(by<=0||by>=350){bvy*=-1;}
  if(bx<=PW+5&&by>=py&&by<=py+PH){bvx=Math.abs(bvx);bvy+=(by-py-PH/2)*0.1;}
  if(bx>=500-PW-5&&by>=ay&&by<=ay+PH){bvx=-Math.abs(bvx);bvy+=(by-ay-PH/2)*0.1;}
  if(bx<0){as++;document.getElementById('as').textContent=as;reset();}
  if(bx>500){ps++;document.getElementById('ps').textContent=ps;reset();}
  ctx.fillStyle='#1a1a2e';ctx.fillRect(0,0,500,350);
  ctx.setLineDash([5,5]);ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.beginPath();ctx.moveTo(250,0);ctx.lineTo(250,350);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#4ecdc4';ctx.fillRect(0,py,PW,PH);
  ctx.fillStyle='#ff6b6b';ctx.fillRect(500-PW,ay,PW,PH);
  ctx.fillStyle='white';ctx.beginPath();ctx.arc(bx,by,8,0,Math.PI*2);ctx.fill();
  requestAnimationFrame(loop);
}
reset();loop();
</script></body></html>`
  };
}

// ---- TIC TAC TOE (default) ----
export function gameTicTacToe(): { html: string; title: string } {
  return {
    title: '⭕ Piškvorky — DouTok AI',
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
${BASE_STYLE}
h1 { font-size: 2rem; margin-top: 20px; }
.game-area { display: grid; grid-template-columns: repeat(3,100px); gap: 8px; margin-top: 20px; }
.cell { width: 100px; height: 100px; background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.2); border-radius: 12px; font-size: 2.5rem; cursor: pointer; color: white; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.cell:hover { background: rgba(255,255,255,0.2); transform: scale(1.05); }
.cell.x { color: #ff6b6b; } .cell.o { color: #4ecdc4; }
.status { font-size: 1.2rem; min-height: 1.5em; margin: 12px 0; }
.reset { padding: 10px 28px; border-radius: 10px; background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.2); font-size: 1rem; cursor: pointer; }
.reset:hover { background: rgba(255,255,255,0.25); }
.score { display: flex; gap: 30px; font-size: 1.1rem; margin: 10px 0; } .score span { opacity: 0.7; }
</style></head><body>
<h1>⭕ Piškvorky ❌</h1>
<div class="score"><span>Hráč (X): <b id="sx">0</b></span><span>AI (O): <b id="so">0</b></span></div>
<p class="status" id="status">Tvůj tah (X)</p>
<div class="game-area" id="board"></div>
<button class="reset" onclick="reset()">Nová hra</button>
<script>
let board=Array(9).fill(''),gameOver=false,scoreX=0,scoreO=0;
const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const boardEl=document.getElementById('board'),statusEl=document.getElementById('status');
function render(){boardEl.innerHTML='';board.forEach((v,i)=>{const c=document.createElement('button');c.className='cell '+(v==='X'?'x':v==='O'?'o':'');c.textContent=v;c.onclick=()=>play(i);boardEl.appendChild(c);});}
function check(p){return wins.some(w=>w.every(i=>board[i]===p));}
function play(i){if(board[i]||gameOver)return;board[i]='X';if(check('X')){statusEl.textContent='🎉 Vyhrál jsi!';gameOver=true;scoreX++;document.getElementById('sx').textContent=scoreX;render();return;}if(board.every(c=>c)){statusEl.textContent='Remíza!';gameOver=true;render();return;}aiMove();if(check('O')){statusEl.textContent='🤖 AI vyhrála!';gameOver=true;scoreO++;document.getElementById('so').textContent=scoreO;render();return;}if(board.every(c=>c)){statusEl.textContent='Remíza!';gameOver=true;render();return;}statusEl.textContent='Tvůj tah (X)';render();}
function aiMove(){for(const w of wins){const v=w.map(i=>board[i]);if(v.filter(x=>x==='O').length===2&&v.includes('')){board[w[v.indexOf('')]]=  'O';return;}}for(const w of wins){const v=w.map(i=>board[i]);if(v.filter(x=>x==='X').length===2&&v.includes('')){board[w[v.indexOf('')]]=  'O';return;}}if(!board[4]){board[4]='O';return;}const e=board.map((v,i)=>v?-1:i).filter(i=>i>=0);board[e[Math.floor(Math.random()*e.length)]]='O';}
function reset(){board=Array(9).fill('');gameOver=false;statusEl.textContent='Tvůj tah (X)';render();}
render();
</script></body></html>`
  };
}

// ---- GAME SELECTOR ----
export function selectGame(message: string): { html: string; title: string; name: string } {
  const q = message.toLowerCase();

  if (q.includes('minecraft') || q.includes('block') || q.includes('stav') || q.includes('bloky') || q.includes('builder')) {
    return { ...gameMinecraft(), name: 'Block Builder (Minecraft-style)' };
  }
  if (q.includes('snake') || q.includes('had') || q.includes('červ')) {
    return { ...gameSnake(), name: 'Snake' };
  }
  if (q.includes('flappy') || q.includes('ptá') || q.includes('bird') || q.includes('létání') || q.includes('letadlo')) {
    return { ...gameFlappy(), name: 'Flappy Bird' };
  }
  if (q.includes('pong') || q.includes('tenis') || q.includes('ping')) {
    return { ...gamePong(), name: 'Pong' };
  }
  if (q.includes('piškvorky') || q.includes('tic') || q.includes('tac') || q.includes('křížky')) {
    return { ...gameTicTacToe(), name: 'Piškvorky' };
  }

  // Fallback: offer a random game
  const all = [gameMinecraft, gameSnake, gameFlappy, gamePong, gameTicTacToe];
  const names = ['Block Builder', 'Snake', 'Flappy Bird', 'Pong', 'Piškvorky'];
  const idx = Math.floor(Math.random() * all.length);
  return { ...all[idx](), name: names[idx] };
}
