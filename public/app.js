"use strict";
const $ = (id) => document.getElementById(id);

// Paraphrased from the ETS "TOEIC Listening / Reading Score Descriptors" (nearest level).
const LEVELS = {
  l: {
    cuts: [[350, 400], [250, 300], [150, 200], [0, 0]],
    info: {
      400: { s: ["จับใจความสำคัญ จุดประสงค์ และบริบทของบทสนทนาสั้นและบทพูดยาวได้ แม้คำตอบไม่ตรงไปตรงมา", "เข้าใจรายละเอียดได้ แม้มีประโยคปฏิเสธ โครงสร้างซับซ้อน หรือคำศัพท์ยาก"], w: ["พลาดเฉพาะเมื่อเจอไวยากรณ์หรือคำศัพท์ที่ไม่ค่อยพบ"] },
      300: { s: ["จับใจความบทสนทนาสั้นได้เป็นบางครั้ง เมื่อคำศัพท์ไม่ยาก", "เข้าใจใจความบทพูดยาวเมื่อมีการพูดซ้ำหรือถอดความ", "เข้าใจรายละเอียดเมื่อคำศัพท์ง่าย–ปานกลาง และข้อมูลอยู่ต้นหรือท้ายบท"], w: ["ยากเมื่อคำตอบเป็นทางอ้อม คาดเดาไม่ได้ หรือคำศัพท์ยาก", "ยังเชื่อมโยงข้อมูลหลายจุดในบทพูดยาวไม่ได้", "ประโยคปฏิเสธและการถอดความยังเป็นอุปสรรค"] },
      200: { s: ["เข้าใจประโยคสั้น ๆ ที่บรรยายภาพถ่ายได้", "เข้าใจบทพูดยาวได้บางส่วน เมื่อมีการพูดซ้ำมากและคำศัพท์ง่าย", "เข้าใจรายละเอียดเมื่อคำที่ได้ยินตรงกับคำในตัวเลือก"], w: ["ยังจับใจความบทสนทนาสั้นไม่ได้ แม้ภาษาจะตรงไปตรงมา", "พลาดเมื่อข้อมูลอยู่กลางบทพูด หรือมีการถอดความ"] },
      0: { s: ["กำลังอยู่ในช่วงเริ่มต้นของการพัฒนาทักษะการฟัง"], w: ["แนะนำให้ฝึกฟังประโยคสั้น ๆ คำศัพท์พื้นฐาน และบรรยายภาพ อย่างสม่ำเสมอทุกวัน"] },
    },
  },
  r: {
    cuts: [[400, 450], [300, 350], [200, 250], [100, 150], [0, 0]],
    info: {
      450: { s: ["อนุมานใจความสำคัญ จุดประสงค์ และรายละเอียดจากข้อความได้", "เชื่อมโยงข้อมูลทั้งบทความและระหว่างสองข้อความได้", "เข้าใจคำศัพท์กว้าง สำนวน และไวยากรณ์ที่ซับซ้อน"], w: ["พลาดเฉพาะเมื่อข้อมูลหนาแน่นมากหรือคำศัพท์ยาก"] },
      350: { s: ["อนุมานและอ่านเอาความได้ แม้ข้อมูลถูกถอดความ", "เชื่อมโยงข้อมูลในช่วงสั้น ๆ ได้ แม้ภาษายาก", "เข้าใจคำศัพท์ระดับกลาง และไวยากรณ์ที่ซับซ้อน"], w: ["ยังเชื่อมโยงข้อมูลข้ามพื้นที่กว้างในบทอ่านไม่ได้", "ยังไม่สม่ำเสมอกับคำศัพท์ยาก สำนวน และการแยกความหมายของคำใกล้เคียง"] },
      250: { s: ["อนุมานง่าย ๆ จากข้อความที่จำกัดได้", "หาคำตอบได้เมื่อถ้อยคำในบทอ่านตรงกับคำถาม", "เชื่อมโยงข้อมูลภายใน 1–2 ประโยคได้ เข้าใจคำศัพท์ง่ายและไวยากรณ์พื้นฐาน"], w: ["ยากเมื่อต้องอนุมานที่ต้องถอดความหรือเชื่อมโยงข้อมูล", "มักพึ่งการจับคู่คำเดียวกันระหว่างคำถามกับบทอ่าน", "ยังเชื่อมโยงข้อมูลเกิน 2 ประโยคไม่ค่อยได้"] },
      150: { s: ["หาคำตอบได้เมื่ออ่านไม่มากและถ้อยคำตรงกับคำถาม", "เข้าใจคำศัพท์ง่ายและวลีที่ใช้บ่อย"], w: ["ยังอนุมานจากข้อความไม่ได้ พึ่งการจับคู่คำเป็นหลัก", "ศัพท์ยังจำกัด และเชื่อมโยงข้อมูลแม้ในประโยคเดียวได้ยาก"] },
      0: { s: ["กำลังอยู่ในช่วงเริ่มต้นของการพัฒนาทักษะการอ่าน"], w: ["แนะนำให้สะสมคำศัพท์พื้นฐาน ฝึกอ่านข้อความสั้น ๆ และไวยากรณ์พื้นฐานอย่างสม่ำเสมอ"] },
    },
  },
};

function level(kind, scaled) {
  const { cuts, info } = LEVELS[kind];
  const lv = cuts.find(([min]) => scaled >= min)[1];
  return { lv, ...info[lv] };
}

function levelCard(kind, scaled) {
  const { lv, s, w } = level(kind, scaled);
  const name = kind === "l" ? "Listening" : "Reading";
  const tag = lv ? `ใกล้เคียงระดับ ${lv}` : "ระดับเริ่มต้น";
  const li = (a) => a.map((t) => `<li></li>`).join("");
  const el = document.createElement("div");
  el.className = `level ${kind === "l" ? "listening" : "reading"}`;
  el.innerHTML = `<h4>${name} <span class="tag">${tag}</span></h4><h5>จุดแข็งโดยทั่วไป</h5><ul>${li(s)}</ul><h5>จุดที่ควรพัฒนา</h5><ul>${li(w)}</ul>`;
  const [us, uw] = el.querySelectorAll("ul");
  s.forEach((t, i) => (us.children[i].textContent = t));
  w.forEach((t, i) => (uw.children[i].textContent = t));
  return el;
}

const MESSAGES = {
  invalid_id: "กรุณากรอกรหัสนักศึกษาเป็นตัวเลข 8 หลัก",
  not_found: "ไม่พบรหัสนักศึกษานี้ในรายชื่อผู้เข้าสอบ กรุณาตรวจสอบรหัสอีกครั้ง",
  network: "เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่อีกครั้ง",
  server: "ระบบขัดข้องชั่วคราว กรุณาลองใหม่ภายหลัง หรือแจ้งอาจารย์ผู้สอน",
};

let timer, tick;
function clearResult() {
  clearInterval(tick); clearTimeout(timer);
  $("result").hidden = true;
  $("lookup").hidden = false;
  $("sid").value = "";
  $("msg").textContent = "";
  for (const id of ["l-bar", "r-bar", "t-bar"]) $(id).style.width = "0";
  $("sid").focus();
}

function show(d) {
  $("r-name").textContent = d.name;
  $("r-id").textContent = `รหัส ${d.id}`;
  $("r-major").textContent = `วิชาเอก${d.major}`;
  $("l-scaled").textContent = d.l.scaled; $("l-raw").textContent = d.l.raw;
  $("r-scaled").textContent = d.r.scaled; $("r-raw").textContent = d.r.raw;
  $("t-scaled").textContent = d.total;
  $("l-level").replaceChildren(levelCard("l", d.l.scaled));
  $("r-level").replaceChildren(levelCard("r", d.r.scaled));
  $("lookup").hidden = true;
  $("result").hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    $("l-bar").style.width = `${(d.l.scaled / 495) * 100}%`;
    $("r-bar").style.width = `${(d.r.scaled / 495) * 100}%`;
    $("t-bar").style.width = `${(d.total / 990) * 100}%`;
  }));
  $("result").scrollIntoView({ behavior: "smooth", block: "start" });

  // Auto-clear after 2 minutes so the score doesn't linger on a shared screen.
  let left = 120;
  const paint = () => ($("count").textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`);
  paint(); clearInterval(tick);
  tick = setInterval(() => { left--; paint(); if (left <= 0) clearResult(); }, 1000);
}

$("sid").addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 8);
  $("msg").textContent = "";
});
$("clear").addEventListener("click", clearResult);

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = $("sid").value.trim();
  const msg = $("msg"), btn = $("go");
  if (!/^\d{8}$/.test(id)) { msg.textContent = MESSAGES.invalid_id; return; }
  btn.disabled = true; btn.textContent = "กำลังตรวจสอบ…"; msg.textContent = "";
  try {
    const res = await fetch("/api/score", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
      cache: "no-store",
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) show(body);
    else msg.textContent = MESSAGES[body.error] || (res.status >= 500 ? MESSAGES.server : MESSAGES.not_found);
  } catch {
    msg.textContent = MESSAGES.network;
  } finally {
    btn.disabled = false; btn.textContent = "ตรวจสอบคะแนน";
  }
});
