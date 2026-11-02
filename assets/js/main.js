"use strict";
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const root = document.documentElement;
const profile = window.portfolioProfile;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const colors = {Clay:"#ad4527", Moss:"#3d7046", Cobalt:"#355bb3", Plum:"#85508c", Teal:"#16746d"};
const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch {} }
};
let toastTimer;
function notify(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("on"), 3600);
}
function setTheme(theme) {
  root.dataset.theme = theme;
  const dark = theme === "dark";
  $(".mode").setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  $(".mode").innerHTML = dark
    ? '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/></svg>'
    : moonIcon;
  $('meta[name="theme-color"]').content = dark ? "#1e201d" : "#faf8f3";
}
const moonIcon = $(".mode").innerHTML;
setTheme(storage.get("portfolio-theme") || (matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light"));
$(".mode").addEventListener("click", () => {
  setTheme(root.dataset.theme === "dark" ? "light" : "dark"); storage.set("portfolio-theme", root.dataset.theme);
});
function setColor(name) {
  root.style.setProperty("--accent", colors[name]);
  root.style.setProperty("--accent-text", root.dataset.theme === "dark" ? "color-mix(in srgb,var(--accent),white 52%)" : "var(--accent)");
  $$("[data-color]").forEach(button => button.setAttribute("aria-pressed", button.dataset.color === name));
}
const savedColor = storage.get("studio-color");
setColor(Object.hasOwn(colors,savedColor) ? savedColor : "Clay");
$(".mode").addEventListener("click", () => setColor($('[data-color][aria-pressed="true"]').dataset.color));
function togglePalette(open) {
  $("#swatches").hidden = !open;
  $(".palette").setAttribute("aria-expanded", open);
}
$(".palette").addEventListener("click", () => togglePalette($("#swatches").hidden));
$$("[data-color]").forEach(button => button.addEventListener("click", () => {
  setColor(button.dataset.color); storage.set("studio-color",button.dataset.color);
  togglePalette(false); $(".palette").focus(); notify(button.dataset.color+" accent selected");
}));
function toggleNav(open) {
  $("#navigation").classList.toggle("open",open); $(".hamburger").setAttribute("aria-expanded",open);
}
$(".hamburger").addEventListener("click", () => toggleNav(!$("#navigation").classList.contains("open")));
$("#navigation").addEventListener("click", () => toggleNav(false));
function toggleOrbit(open) {
  $(".orbit").classList.toggle("open",open);
  $(".hub").setAttribute("aria-expanded",open);
  $("#channels").inert = !open; $("#channels").setAttribute("aria-hidden",!open);
}
$(".hub").addEventListener("click", () => toggleOrbit(!$(".orbit").classList.contains("open")));
document.addEventListener("click", event => {
  if (!event.target.closest(".palette-wrap")) togglePalette(false);
  if (!event.target.closest(".orbit")) toggleOrbit(false);
  if (!event.target.closest("header")) toggleNav(false);
});
document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  if (!$("#swatches").hidden) { togglePalette(false); $(".palette").focus(); }
  if ($("#navigation").classList.contains("open")) { toggleNav(false); $(".hamburger").focus(); }
  if ($(".orbit").classList.contains("open")) { toggleOrbit(false); $(".hub").focus(); }
});
const channels = ["whatsapp","facebook","github","twitter","messenger"];
const socialIcons = ["whatsapp","facebook","github","twitter-x","messenger"];
function webLink(value) {
  try { const url = new URL(value); return url.protocol === "https:" ? url.href : ""; } catch { return ""; }
}
$$(".satellite").forEach((button,index) => {
  button.innerHTML = '<img width="20" height="20" alt="" src="assets/images/'+socialIcons[index]+'.svg">';
  const url = webLink(profile.social[channels[index]]);
  if (url) {
    const link = document.createElement("a");
    for (const attr of button.attributes) link.setAttribute(attr.name,attr.value);
    link.innerHTML = button.innerHTML;
    link.href = url; link.target = "_blank"; link.rel = "noopener"; button.replaceWith(link);
  } else {
    button.addEventListener("click", () => notify(button.title+" profile hasn’t been added yet."));
  }
});
const navLinks = $$("#navigation a");
const sections = navLinks.map(link => $(link.hash));
let pendingFrame = false;
function drawScroll() {
  pendingFrame = false;
  const maxScroll = root.scrollHeight - innerHeight;
  $(".progress").style.transform = "scaleX("+(maxScroll ? Math.min(1,scrollY/maxScroll) : 0)+")";
  $(".top").classList.toggle("on",scrollY > 500);
  let current = 0;
  sections.forEach((section,index) => { if (section.getBoundingClientRect().top <= innerHeight*.35) current = index; });
  navLinks.forEach((link,index) => { if(index===current) link.setAttribute("aria-current","location"); else link.removeAttribute("aria-current"); });
}
function scheduleScroll() { if (!pendingFrame) { pendingFrame=true; requestAnimationFrame(drawScroll); } }
addEventListener("scroll",scheduleScroll,{passive:true}); addEventListener("resize",scheduleScroll); drawScroll();
const roles = ["UI explorer","Visual tinkerer","Web designer"];
let roleIndex = 0, timer;
function animateRole() {
  clearTimeout(timer);
  if (reduced.matches || document.hidden) { $(".typed").textContent=roles[roleIndex]; return; }
  const next = (roleIndex+1)%roles.length;
  let count = roles[roleIndex].length;
  function erase() {
    $(".typed").textContent = roles[roleIndex].slice(0,--count);
    if (count>0) timer=setTimeout(erase,45); else { roleIndex=next; timer=setTimeout(type,140); }
  }
  function type() {
    $(".typed").textContent=roles[roleIndex].slice(0,++count);
    if(count<roles[roleIndex].length) timer=setTimeout(type,85); else animateRole();
  }
  $(".typed").textContent=roles[roleIndex]; timer=setTimeout(erase,2300);
}
animateRole(); reduced.addEventListener("change",animateRole); document.addEventListener("visibilitychange",animateRole);
const poster=$(".tilt");
poster.addEventListener("pointermove", event => {
  if (event.pointerType !== "mouse" || reduced.matches) return;
  const rect=poster.getBoundingClientRect();
  poster.style.setProperty("--ry",((event.clientX-rect.left)/rect.width-.5)*6+"deg");
  poster.style.setProperty("--rx",((event.clientY-rect.top)/rect.height-.5)*-6+"deg");
});
poster.addEventListener("pointerleave", () => { poster.style.removeProperty("--rx"); poster.style.removeProperty("--ry"); });
$$("[data-filter]").forEach(button => button.addEventListener("click", () => {
  $$("[data-filter]").forEach(item => item.setAttribute("aria-pressed", item===button));
  $$("[data-category]").forEach(item => { item.hidden = button.dataset.filter !== "All" && item.dataset.category !== button.dataset.filter; });
}));
const studies = {
  chromatic:{title:"Chromatic",kind:"Web tool",copy:"An interactive four-color palette. Shift the hue to explore a family of colors, then select a swatch to copy its hex value."},
  fold:{title:"Fold study",kind:"Visual study",copy:"A sculptural loop made from repeating copper ribs. Turn the composition and adjust the backdrop to see how a small change reshapes the image."}
};
const dialog=$("#projectDialog");
$$("[data-project]").forEach(button => button.addEventListener("click", () => {
  const id=button.dataset.project, study=studies[id], repo=webLink(profile.repositories[id]);
  $("#dialog-title").textContent=study.title; $("#dialog-kind").textContent=study.kind;
  $("#dialog-copy").textContent=study.copy; $("#demoLink").href="demos/"+id+".html";
  $("#repoLink").hidden=!repo; $("#repoNote").hidden=!!repo;
  if(repo) $("#repoLink").href=repo; else $("#repoLink").removeAttribute("href");
  dialog.showModal();
}));
$(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {if(event.target===dialog) {
  const r=dialog.getBoundingClientRect();
  if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) dialog.close();
}});
const recipient=profile.email.trim();
if (!recipient) $("#emailNote").textContent="Your email app will open a draft. Add the recipient before sending.";
$("#copyEmail").addEventListener("click", async () => {
  if (!recipient) return notify("Contact email hasn’t been added yet.");
  try { await navigator.clipboard.writeText(recipient); notify("Email copied."); }
  catch { notify("Contact email: "+recipient); }
});
$("#contactForm").addEventListener("submit", event => {
  event.preventDefault();
  const fields=event.currentTarget.elements;
  for(const key of ["name","message"]) {
    const field=fields.namedItem(key);
    if (!field.value.trim()) {field.setCustomValidity("Please enter "+(key==="name"?"your name.":"a message."));field.reportValidity();return;}
  }
  const subject="Portfolio inquiry from "+fields.namedItem("name").value.trim();
  const body=fields.namedItem("message").value.trim()+"\n\nFrom "+fields.namedItem("name").value.trim()+"\nReply to "+fields.namedItem("email").value.trim();
  location.href="mailto:"+encodeURIComponent(recipient)+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
});
$("#contactForm").addEventListener("input",event=>event.target.setCustomValidity(""));
