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

## Deploy บน Cloudflare Pages (รองรับ ~800 คนได้สบาย ใช้แผนฟรี)
1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git → เลือก repo นี้
2. Build command: *(ว่าง)* · Build output directory: `public`
3. Settings → Variables and Secrets → เพิ่ม **Secret** ชื่อ `DATA_KEY` แล้ว Redeploy
4. (แนะนำ) Security → WAF → Rate limiting rule: path `/api/score` จำกัด ~10 ครั้ง/นาที/IP เพื่อกันการไล่เดารหัส

## ทดลองในเครื่อง
```bash
node --env-file=.dev.vars dev-server.mjs   # เปิด http://localhost:8788
```
