"use strict";
const $=s=>document.querySelector(s);
try {
  document.documentElement.dataset.theme=localStorage.getItem("portfolio-theme")||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light");
  const colors={Clay:"#ad4527",Moss:"#3d7046",Cobalt:"#355bb3",Plum:"#85508c",Teal:"#16746d"};
  document.documentElement.style.setProperty("--accent",colors[localStorage.getItem("studio-color")]||colors.Clay);
  if(document.documentElement.dataset.theme!=="dark") document.documentElement.style.setProperty("--accent-text","var(--accent)");
} catch {}
if(document.body.dataset.demo==="chromatic") {
  // Convert HSL to hex for a portable CSS color value.
  function color(h,s,l) {
    const a=s*Math.min(l,1-l);
    return "#"+[0,8,4].map(n=>{
      const k=(n+h/30)%12;
      return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1)))).toString(16).padStart(2,"0");
    }).join("").toUpperCase();
  }
  const buttons=[...document.querySelectorAll(".samples button")];
  function render() {
    const hue=Number($("#hue").value);
    $("#value").value=hue+"°";
    buttons.forEach((button,i)=>{
      const hex=color((hue+i*29)%360,.36+i*.05,.42+i*.10);
      button.style.background=hex; button.innerHTML="<span>"+hex+"</span>";
      button.setAttribute("aria-label","Copy "+hex);
    });
    $("#feedback").textContent="";
  }
  buttons.forEach(button=>button.addEventListener("click",async()=>{
    try{await navigator.clipboard.writeText(button.textContent);$("#feedback").textContent="Copied "+button.textContent;}
    catch{$("#feedback").textContent="Hex value: "+button.textContent;}
  }));
  $("#hue").addEventListener("input",render);render();
} else {
  function turn(){const value=$("#turn").value;$(".stage img").style.transform="rotate("+value+"deg)";$("#value").value=value+"°";}
  $("#turn").addEventListener("input",turn);turn();
  $("#back").addEventListener("change",()=>$(".stage").style.background=$("#back").value);
}