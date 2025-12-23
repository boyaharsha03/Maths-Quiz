"use strict";

/* -------- Background Particles -------- */
function startParticles(){
  const canvas=document.getElementById("bgParticles"); 
  if(!canvas) return;
  const ctx=canvas.getContext("2d");
  
  function resize(){
    canvas.width=window.innerWidth; 
    canvas.height=window.innerHeight;
  }
  resize(); 
  window.addEventListener("resize",resize);
  
  const count=Math.max(30,Math.floor((canvas.width*canvas.height)/90000));
  const ps=Array.from({length:count},()=>({
    x:Math.random()*canvas.width,
    y:Math.random()*canvas.height,
    r:Math.random()*2.8+0.6,
    dx:(Math.random()-0.5)*0.35,
    dy:(Math.random()-0.5)*0.35,
    alpha:0.12+Math.random()*0.5
  })); 
  
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height); 
    ps.forEach(p=>{
      ctx.beginPath(); 
      ctx.fillStyle=`rgba(255,255,255,${p.alpha})`; 
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2); 
      ctx.fill();
    });
  }
  
  function update(){
    ps.forEach(p=>{
      p.x+=p.dx; 
      p.y+=p.dy; 
      if(p.x<0||p.x>canvas.width) p.dx*=-1; 
      if(p.y<0||p.y>canvas.height) p.dy*=-1;
    });
  }
  
  (function loop(){
    draw(); 
    update(); 
    requestAnimationFrame(loop);
  })();
}

/* -------- Floating Math Symbols -------- */
const symbolPool=["+","−","×","÷","∑","√","π","∞"];

function createSymbol(){
  const s=document.createElement("div"); 
  s.className="symbol";
  s.textContent=symbolPool[Math.floor(Math.random()*symbolPool.length)];
  s.style.left=(Math.random()*(window.innerWidth-60))+"px";
  s.style.top=(window.innerHeight+40)+"px";
  s.style.fontSize=(14+Math.random()*34)+"px";
  s.style.animation=`floatup ${10+Math.random()*12}s linear forwards`;
  document.body.appendChild(s); 
  setTimeout(()=>s.remove(),26000);
}

/* -------- Login Handler -------- */
function handleLogin(){
  const nameInput = document.getElementById("userName");
  const userName = nameInput.value.trim();
  const msgEl = document.getElementById("loginMsg");
  
  if (!userName) {
    msgEl.textContent = "Please enter your name!";
    nameInput.focus();
    return;
  }
  
  // Store username in localStorage
  localStorage.setItem("quizUser", userName);
  
  // Redirect to main quiz page
  window.location.href = "math.html";
}

/* -------- Event Listeners -------- */
window.onload = function() {
  startParticles();
  
  // Create floating symbols periodically
  setInterval(createSymbol, 3000);
  
  // Login button click
  document.getElementById("loginBtn").onclick = handleLogin;
  
  // Allow Enter key to submit
  document.getElementById("userName").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
      handleLogin();
    }
  });
  
  // Clear error message when user starts typing
  document.getElementById("userName").addEventListener("input", function() {
    document.getElementById("loginMsg").textContent = "";
  });
};