# ตรวจสอบผลสอบการจำลองสอบ TOEIC (27 ต.ค.2569)

เว็บให้นักศึกษากรอกรหัสนักศึกษา 8 หลักเพื่อดูคะแนนของตนเอง (Listening / Reading / Total)

## ความลับของคะแนน
- ข้อมูลทั้งหมดอยู่ใน `functions/_lib/scores.enc.json` ซึ่ง **เข้ารหัส AES-256-GCM** อ่านไม่ได้ถ้าไม่มีกุญแจ `DATA_KEY`
- เบราว์เซอร์ไม่เคยได้รับข้อมูลทั้งชั้น — `POST /api/score` ถอดรหัสบนเซิร์ฟเวอร์และตอบกลับเฉพาะรหัสที่ตรงกันเท่านั้น
- ห้าม commit ไฟล์ .xlsx และ `.dev.vars` (อยู่ใน `.gitignore` แล้ว)

## การแปลงคะแนน
ตอบถูกกี่ข้อ (จาก 100) → ร้อยละ → ตาราง ETS (`scripts/toeic_conversion.json`)
- `Subj_1#Obj_01` → Listening scaled score
- `Subj_1#Obj_02` → Reading scaled score
- Total = Listening + Reading

## อัปเดตข้อมูลใหม่
```bash
pip install openpyxl cryptography
DATA_KEY="<กุญแจเดิม>" python3 scripts/build_data.py path/to/scores.xlsx   # ไม่ใส่ DATA_KEY = สร้างกุญแจใหม่
```

## Deploy บน Cloudflare Workers (static assets + API) — ใช้แผนฟรี รองรับ ~800 คน
1. Cloudflare → Workers & Pages → Create application → เชื่อม Git → เลือก repo นี้ ตั้งชื่อ Worker ให้ตรงกับ `name` ใน `wrangler.toml` (`toeicresults`)
2. Build command: *(ว่าง)* · Deploy command: `npx wrangler deploy` · Root directory: `/`
3. Settings → Variables and secrets → เพิ่ม **Secret** ชื่อ `DATA_KEY` แล้ว Deploy ใหม่
4. (แนะนำ) ตั้ง rate limit บน `/api/score`

## ทดลองในเครื่อง
```bash
node --env-file=.dev.vars dev-server.mjs   # เปิด http://localhost:8788
```
