"use strict";

/* -------- Config & State -------- */
const questionTypes = ["addition","subtraction","multiplication","division","square","cube","squareRoot","cubeRoot","bodmas","area","perimeter"];
const areaShapes = ["square","rectangle","triangle","circle"];
const perimeterShapes = ["square","rectangle","triangle","circle"];

let questions = [], userAnswers = [], currentQuestion = 0;
let timer = null, timeLeft = 0, totalTime = 120, totalQuestions = 15;
let difficulty = "medium", mode = "practice", quizSubmitted = false;
let markedQuestions = new Set(), visitedQuestions = new Set();
const timeLimits = { practice: [100,120,150], exam: [150,180,200] };

/* -------- Utility Functions -------- */
function showScreen(screenId){
  ["modePage","practiceScreen","examScreen","quizArea","resultArea"].forEach(id=>{
    const e=document.getElementById(id); if(e) e.classList.add("hidden");
  });
  const show=document.getElementById(screenId); if(show) show.classList.remove("hidden");
  if(screenId==="modePage" && timer){ clearInterval(timer); timer=null; }
}

function rand([min,max]){return Math.floor(Math.random()*(max-min+1))+min;}
function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}

/* -------- Question Generation -------- */
function generateQuestions(count,difficulty,topics){
  const qs=[];
  for(let i=0;i<count;i++){
    const type=topics[Math.floor(Math.random()*topics.length)];
    qs.push(generateQuestion(type,difficulty));
  }
  return qs;
}

function generateQuestion(type,difficulty){
  const q={type,question:"",options:[],answer:0,explanation:""};
  let a,b,c,correct;
  const range=difficulty==="easy" ? [1,10] : difficulty==="hard" ? [50,200] : [10,50];
  switch(type){
    case "addition": a=rand(range); b=rand(range); correct=a+b; 
      q.question=`${a}+${b}=?`; 
      q.explanation=`Adding ${a} and ${b} gives ${correct}.`; break;
    case "subtraction": a=rand(range); b=rand(range); if(a<b)[a,b]=[b,a]; correct=a-b; 
      q.question=`${a}-${b}=?`; 
      q.explanation=`Subtracting ${b} from ${a} gives ${correct}.`; break;
    case "multiplication": a=rand(range); b=rand(range); correct=a*b; 
      q.question=`${a}×${b}=?`; 
      q.explanation=`Multiplying ${a} with ${b} gives ${correct}.`; break;
    case "division": b=rand(range); a=b*rand(range); correct=+(a/b).toFixed(2); 
      q.question=`${a}÷${b}=?`; 
      q.explanation=`Dividing ${a} by ${b} equals ${correct}.`; break;
    case "square": a=rand(range); correct=a*a; 
      q.question=`Square of ${a}=?`; 
      q.explanation=`Square means ${a}×${a} = ${correct}.`; break;
    case "cube": a=rand(range); correct=a*a*a; 
      q.question=`Cube of ${a}=?`; 
      q.explanation=`Cube means ${a}×${a}×${a} = ${correct}.`; break;
    case "squareRoot": a=rand(range); correct=a; 
      q.question=`√${a*a}=?`; 
      q.explanation=`Square root of ${a*a} is ${a}, because ${a}×${a} = ${a*a}.`; break;
    case "cubeRoot": a=rand(range); correct=a; 
      q.question=`∛${a*a*a}=?`; 
      q.explanation=`Cube root of ${a*a*a} is ${a}, because ${a}³ = ${a*a*a}.`; break;
    case "bodmas": a=rand(range); b=rand(range); c=rand(range); correct=(a+b)*c; 
      q.question=`(${a}+${b})×${c}=?`; 
      q.explanation=`First add ${a}+${b}=${a+b}, then multiply by ${c}: ${(a+b)}×${c}=${correct}.`; break;
    case "area":
      const shape=areaShapes[Math.floor(Math.random()*areaShapes.length)];
      if(shape==="square"){a=rand(range);correct=a*a;q.question=`Area square side ${a}=?`;q.explanation=`Area of square = side×side = ${a}×${a}=${correct}.`;}
      else if(shape==="rectangle"){a=rand(range);b=rand(range);correct=a*b;q.question=`Area rectangle ${a}×${b}=?`;q.explanation=`Area = length×breadth = ${a}×${b}=${correct}.`;}
      else if(shape==="triangle"){a=rand(range);b=rand(range);correct=0.5*a*b;q.question=`Area triangle base ${a}, h ${b}=?`;q.explanation=`Area = ½×base×height = 0.5×${a}×${b}=${correct}.`;}
      else {a=rand(range);correct=+(3.14*a*a).toFixed(2);q.question=`Area circle r=${a}=?`;q.explanation=`Area = πr² ≈ 3.14×${a}² = ${correct}.`;}
      break;
    case "perimeter":
      const p=perimeterShapes[Math.floor(Math.random()*perimeterShapes.length)];
      if(p==="square"){a=rand(range);correct=4*a;q.question=`Perimeter square side ${a}=?`;q.explanation=`Perimeter = 4×side = 4×${a}=${correct}.`;}
      else if(p==="rectangle"){a=rand(range);b=rand(range);correct=2*(a+b);q.question=`Perimeter rectangle ${a},${b}=?`;q.explanation=`Perimeter = 2×(l+b) = 2×(${a}+${b})=${correct}.`;}
      else if(p==="triangle"){a=rand(range);b=rand(range);c=rand(range);correct=a+b+c;q.question=`Perimeter triangle ${a},${b},${c}=?`;q.explanation=`Perimeter = sum of sides = ${a}+${b}+${c}=${correct}.`;}
      else {a=rand(range);correct=+(2*3.14*a).toFixed(2);q.question=`Circumference circle r=${a}=?`;q.explanation=`Circumference = 2πr ≈ 2×3.14×${a}=${correct}.`;}
      break;
  }
  const opts=[correct];
  while(opts.length<4){
    let wrong; const d=Math.floor(Math.random()*10)+1;
    wrong=Math.round(correct+(Math.random()>0.5?d:-d));
    if(!opts.includes(wrong)) opts.push(wrong);
  }
  q.options=shuffle(opts); q.answer=correct; return q;
}

/* -------- Start Modes -------- */
function startPractice(){
  mode="practice"; quizSubmitted=false;
  difficulty=document.getElementById("difficultyPractice").value;
  totalQuestions=15;
  timeLeft=timeLimits.practice[["easy","medium","hard"].indexOf(difficulty)] || 120;
  totalTime=timeLeft;
  const topic=document.getElementById("topicSelect").value;
  questions=generateQuestions(totalQuestions,difficulty,[topic]);
  beginQuiz();
}

function startExam(){
  mode="exam"; quizSubmitted=false;
  difficulty=document.getElementById("difficultyExam").value;
  totalQuestions=50;
  timeLeft=timeLimits.exam[["easy","medium","hard"].indexOf(difficulty)] || 180;
  totalTime=timeLeft;
  questions=generateQuestions(totalQuestions,difficulty,questionTypes);
  beginQuiz();
}

function beginQuiz(){
  userAnswers=Array(totalQuestions).fill(null);
  currentQuestion=0; markedQuestions=new Set(); visitedQuestions=new Set();
  showScreen("quizArea");
  renderQuiz(); startTimer();
}

/* -------- Render Quiz -------- */
function renderQuiz(){
  visitedQuestions.add(currentQuestion);
  renderQuestionNumbers();
  const q=questions[currentQuestion];
  document.getElementById("quizQuestion").textContent=`Q${currentQuestion+1}. ${q.question}`;
  const optsEl=document.getElementById("quizOptions"); optsEl.innerHTML="";
  const userAns=userAnswers[currentQuestion];
  const explBox=document.getElementById("explanationBox");
  
  q.options.forEach((opt,idx)=>{
    const label=document.createElement("label"); label.className="option-label";
    if(userAns!==null){
      if(idx===userAns && q.options[idx]===q.answer) label.classList.add("correct");
      else if(idx===userAns && q.options[idx]!==q.answer) label.classList.add("wrong");
    }
    const input=document.createElement("input"); input.type="radio"; input.name="option"; input.value=idx;
    if(userAns!==null) input.disabled=true; if(userAns===idx) input.checked=true;
    input.addEventListener("change",()=>selectOption(idx));
    const txt=document.createElement("span"); txt.textContent=opt;
    label.appendChild(input); label.appendChild(txt); optsEl.appendChild(label);
  });

  // Show explanation only in practice mode and only after answering
  if (mode === "practice" && userAns !== null && q.explanation) {
    explBox.textContent = q.explanation;
    explBox.classList.add('visible');
    explBox.style.display = "block";
  } else {
    explBox.textContent = "";
    explBox.classList.remove('visible');
    explBox.style.display = "none";
  }

  const prevBtn=document.getElementById("prevBtn"),nextBtn=document.getElementById("nextBtn"),submitBtn=document.getElementById("submitQuizBtn");
  prevBtn.style.display=currentQuestion===0?"none":"inline-block";
  if(currentQuestion===questions.length-1){nextBtn.style.display="none"; submitBtn.style.display="inline-block";}
  else{nextBtn.style.display="inline-block"; submitBtn.style.display="none";}
  document.getElementById("markBtn").textContent=markedQuestions.has(currentQuestion)?"⭐ Unmark":"⭐ Mark";
  drawClockTimer(timeLeft,totalTime);
}

function renderQuestionNumbers(){
  const c=document.getElementById("questionNumbers"); c.innerHTML="";
  for(let i=0;i<questions.length;i++){
    const b=document.createElement("button"); b.className="qnum-btn";
    if(visitedQuestions.has(i)) b.classList.add("visited");
    if(markedQuestions.has(i)){b.classList.remove("visited"); b.classList.add("marked");}
    b.textContent=i+1; b.addEventListener("click",()=>{currentQuestion=i; renderQuiz();}); c.appendChild(b);
  }
}

/* -------- Navigation -------- */
function selectOption(idx){
  userAnswers[currentQuestion] = idx;
  renderQuiz();
}

function prevQuestion(){if(currentQuestion>0){currentQuestion--; renderQuiz();}}
function nextQuestion(){if(currentQuestion<questions.length-1){currentQuestion++; renderQuiz();}}
function toggleMark(){if(markedQuestions.has(currentQuestion)) markedQuestions.delete(currentQuestion); else markedQuestions.add(currentQuestion); renderQuiz();}

/* -------- Timer -------- */
function startTimer(){
  drawClockTimer(timeLeft,totalTime);
  if(timer) clearInterval(timer);
  timer=setInterval(()=>{
    timeLeft--; if(timeLeft<0) timeLeft=0; drawClockTimer(timeLeft,totalTime);
    if(timeLeft<=0){clearInterval(timer); timer=null; submitQuiz();}
  },1000);
}

function drawClockTimer(sec,total){
  const canvas=document.getElementById("clockTimer"); if(!canvas) return;
  const ctx=canvas.getContext("2d"); ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.beginPath(); ctx.arc(60,60,50,Math.PI*0.75,Math.PI*0.25,false); ctx.strokeStyle="#555"; ctx.lineWidth=10; ctx.stroke();
  const frac=total>0?Math.max(0,Math.min(1,sec/total)):0; const end=Math.PI*0.75+(Math.PI*1.5)*frac;
  ctx.beginPath(); ctx.arc(60,60,50,Math.PI*0.75,end,false); ctx.strokeStyle=sec<=10?"red":"#32cd32"; ctx.lineWidth=10; ctx.stroke();
  ctx.font="bold 1.1em Segoe UI"; ctx.fillStyle="white"; ctx.textAlign="center"; ctx.textBaseline="middle";
  const m=Math.floor(sec/60),s=sec%60; ctx.fillText(`${m}:${s.toString().padStart(2,"0")}`,60,65);
}

/* -------- Submit & Results -------- */
function submitQuiz() {
  if(timer) clearInterval(timer);
  showScreen("resultArea");
  showResults();
}

function showResults() {
  let score = 0;
  for (let i = 0; i < questions.length; i++) {
    if (userAnswers[i] !== null && questions[i].options[userAnswers[i]] === questions[i].answer) {
      score++;
    }
  }
  const percent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  // Get username from localStorage
  const userName = localStorage.getItem("quizUser") || "User";

  // Show results summary first
  let congratsText = percent === 100 ? `Congratulations ${userName}!` : `Quiz Complete, ${userName}!`;
  
  document.getElementById("resultSummary").innerHTML = `
    <div style="font-size:2em;font-weight:800;margin-bottom:12px;">
      ${congratsText}
    </div>
    <div style="font-size:1.3em;">
      You scored <b>${score}/${questions.length}</b> (${percent}%)
    </div>
  `;

  // Trigger blast effect after a brief delay so results page loads first
  setTimeout(() => {
    triggerBlast(score, questions.length);
  }, 300);
}

function renderResultsDetail(){
  const container = document.getElementById("resultsDetail");
  container.innerHTML = "";
  questions.forEach((q, idx) => {
    const wrapper = document.createElement("div");
    wrapper.className = "result-item";
    const header = document.createElement("div");
    header.className = "result-header";
    header.innerHTML = `<strong>Q${idx+1}.</strong> ${q.question}`;
    wrapper.appendChild(header);
    const yourAnsIndex = userAnswers[idx];
    const yourAnsText = (yourAnsIndex === null || yourAnsIndex === undefined) ? "<em>Not answered</em>" : q.options[yourAnsIndex];
    const correctText = q.answer;
    const info = document.createElement("div");
    info.className = "result-info";
    info.innerHTML = `<div><strong>Your answer:</strong> ${yourAnsText}</div>
                      <div><strong>Correct answer:</strong> ${correctText}</div>`;
    wrapper.appendChild(info);
    container.appendChild(wrapper);
  });
}

/* -------- Celebration Blast -------- */
function triggerBlast(score, total){
  const blast = document.getElementById("blastEffect");
  if(!blast) return;
  
  const percent = Math.round((score/total)*100);
  
  // Only show blast for perfect score
  if(percent !== 100) return;
  
  blast.innerHTML = ""; 
  const inner = document.createElement("div"); 
  inner.className = "blast-inner";
  blast.appendChild(inner);
  
  // Create confetti
  const confettiCount = 60;
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");
    confetti.style.setProperty("--hue", Math.floor(Math.random() * 360));
    const dx = (Math.random() - 0.5) * 1200;
    const dy = -200 - Math.random() * 800;
    confetti.style.setProperty("--x", dx);
    confetti.style.setProperty("--y", dy + (Math.random() * 400));
    const dur = (2 + Math.random()*2).toFixed(2) + "s";
    confetti.style.animationDuration = dur;
    confetti.style.left = "50%";
    confetti.style.top = "50%";
    inner.appendChild(confetti);
  }
  
  blast.style.display = "flex";
  
  // Quick blast - 3 seconds
  setTimeout(()=>{
    blast.style.display = "none";
    blast.innerHTML = "";
  }, 3000);
}

/* -------- Background Particles -------- */
function startParticles(){
  const canvas=document.getElementById("bgParticles"); if(!canvas) return;
  const ctx=canvas.getContext("2d");
  function resize(){canvas.width=window.innerWidth; canvas.height=window.innerHeight;}
  resize(); window.addEventListener("resize",resize);
  const count=Math.max(30,Math.floor((canvas.width*canvas.height)/90000));
  const ps=Array.from({length:count},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*2.8+0.6,dx:(Math.random()-0.5)*0.35,dy:(Math.random()-0.5)*0.35,alpha:0.12+Math.random()*0.5})); 
  function draw(){ctx.clearRect(0,0,canvas.width,canvas.height); ps.forEach(p=>{ctx.beginPath(); ctx.fillStyle=`rgba(255,255,255,${p.alpha})`; ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();});}
  function update(){ps.forEach(p=>{p.x+=p.dx; p.y+=p.dy; if(p.x<0||p.x>canvas.width) p.dx*=-1; if(p.y<0||p.y>canvas.height) p.dy*=-1;});}
  (function loop(){draw(); update(); requestAnimationFrame(loop);})();
}

/* -------- Floating Symbols -------- */
const symbolPool=["+","−","×","÷","∑","√","π","∞"];
function createSymbol(){
  const s=document.createElement("div"); s.className="symbol";
  s.textContent=symbolPool[Math.floor(Math.random()*symbolPool.length)];
  s.style.left=(Math.random()*(window.innerWidth-60))+"px";
  s.style.top=(window.innerHeight+40)+"px";
  s.style.fontSize=(14+Math.random()*34)+"px";
  s.style.animation=`floatup ${10+Math.random()*12}s linear forwards`;
  document.body.appendChild(s); setTimeout(()=>s.remove(),26000);
}

/* -------- Event Listeners -------- */
window.onload = function() {
  showScreen("modePage");
  startParticles();
  setInterval(createSymbol, 3000);

  document.getElementById("practiceModeBtn").onclick = () => showScreen("practiceScreen");
  document.getElementById("examModeBtn").onclick = () => showScreen("examScreen");
  document.getElementById("startPracticeBtn").onclick = startPractice;
  document.getElementById("startExamBtn").onclick = startExam;
  
  // Handle all "Home" buttons
  document.querySelectorAll("#homeBtn").forEach(btn => {
    btn.onclick = () => {
      if(timer) clearInterval(timer);
      showScreen("modePage");
    };
  });
  
  document.getElementById("prevBtn").onclick = prevQuestion;
  document.getElementById("nextBtn").onclick = nextQuestion;
  document.getElementById("markBtn").onclick = toggleMark;
  document.getElementById("submitQuizBtn").onclick = submitQuiz;
};