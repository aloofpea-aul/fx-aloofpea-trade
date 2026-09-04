# 🚀 FX Aloofpea - อัพเกรดเป็น Basic Plan แล้ว!

## ✅ สิ่งที่เปลี่ยนแปลง

ระบบได้รับการปรับให้รองรับ **Gold API Basic Plan ($10/month)**

---

## 📊 เปรียบเทียบ Free vs Basic

| Feature | Free Plan | Basic Plan |
|---------|-----------|------------|
| **ราคา** | $0/month | $10/month |
| **API Quota** | 100 calls/month | 5,000 calls/month |
| **Auto-refresh** | ❌ ไม่ได้ (เกิน quota) | ✅ ได้ (ทุก 1 นาที) |
| **Manual Refresh** | ✅ ได้ | ✅ ได้ |
| **Real-time** | ⚠️ ต้องกดเอง | ✅ อัตโนมัติ |
| **การใช้งาน/วัน** | ~3-10 calls | ~1,440 calls |
| **เหมาะกับ** | Position Trader | Day Trader |

---

## 🎯 ตอนนี้ระบบทำอะไรได้บ้าง

### ✅ **Auto-refresh ทุก 1 นาที**
```
09:00:00 → ดึงราคา
09:01:00 → ดึงราคา (อัตโนมัติ)
09:02:00 → ดึงราคา (อัตโนมัติ)
09:03:00 → ดึงราคา (อัตโนมัติ)
...

= 1,440 calls/วัน
= ~43,200 calls/เดือน
```

⚠️ **หมายเหตุ**: เกินกว่า quota! ต้องปรับการใช้งาน

---

## 📈 การใช้งานที่แนะนำ

### **Option 1: ใช้ Manual Refresh (ประหยัดสุด)**

กดปุ่ม "Refresh Prices" เมื่อต้องการเท่านั้น

```
เช้า 09:00 → กด Refresh
กลางวัน 12:00 → กด Refresh  
บ่าย 15:00 → กด Refresh
เย็น 17:00 → กด Refresh

= 4 calls/วัน × 30 วัน = 120 calls/เดือน ✅
```

**ข้อดี**:
- ใช้แค่ 2.4% ของ quota
- ประหยัดมาก
- ควบคุมได้

---

### **Option 2: Auto-refresh ช่วงเวลาเทรด**

เปิด auto-refresh เฉพาะช่วงที่เทรด (แนะนำ!)

#### **วิธีตั้งค่า**:

แก้ไขใน `Code.gs`:

```javascript
function getCacheDuration() {
  var hour = new Date().getHours();
  var day = new Date().getDay(); // 0=Sunday, 6=Saturday
  
  // สุดสัปดาห์: ไม่ต้อง auto-refresh
  if (day === 0 || day === 6) {
    return 3600; // 1 ชั่วโมง
  }
  
  // วันธรรมดา เวลาเทรด (9:00-17:00): 1 นาที
  if (hour >= 9 && hour <= 17) {
    return 60;
  }
  
  // นอกเวลาเทรด: 10 นาที
  return 600;
}

var CACHE_DURATION_SECONDS = getCacheDuration();
```

**การใช้งาน**:
```
เวลาเทรด (9:00-17:00):
  8 ชม × 60 นาที = 480 calls/วัน
  
นอกเวลา (17:00-09:00 + สุดสัปดาห์):
  ประมาณ 100 calls/วัน

รวม: ~580 calls/วัน × 30 วัน = ~17,400 calls/เดือน
```

❌ **ยังเกิน quota!** ต้องลดลงอีก

---

### **Option 3: Cache 5 นาที (แนะนำที่สุด!)**

เปลี่ยน cache จาก 1 นาที เป็น 5 นาที

แก้ไขใน `Code.gs`:
```javascript
var CACHE_DURATION_SECONDS = 300; // 5 นาที
```

**การใช้งาน**:
```
24 ชม × (60 นาที ÷ 5) = 288 calls/วัน
288 × 30 วัน = 8,640 calls/เดือน
```

⚠️ **ยังเกิน quota!** ต้องเพิ่มเป็น 10 นาที

---

### **Option 4: Cache 10 นาที (ใช้ได้แน่นอน!) ⭐**

แก้ไขใน `Code.gs`:
```javascript
var CACHE_DURATION_SECONDS = 600; // 10 นาที
```

**การใช้งาน**:
```
24 ชม × (60 นาที ÷ 10) = 144 calls/วัน
144 × 30 วัน = 4,320 calls/เดือน ✅

ใช้ 86% ของ quota (ปลอดภัย!)
```

**ข้อดี**:
- ✅ อัพเดทอัตโนมัติ
- ✅ ไม่เกิน quota
- ✅ Real-time พอสมควร

**ข้อเสีย**:
- ราคาอาจช้า 10 นาที

---

## 💡 คำแนะนำตาม Trading Style

### **Day Trader** (เทรดบ่อย, ต้องการ real-time):
```
แนะนำ: Cache 10 นาที + Manual Refresh เมื่อต้องการ
- Auto: ~4,320 calls/เดือน
- Manual: ~300 calls/เดือน เพิ่มเติม
- รวม: ~4,620 calls/เดือน (92% ของ quota) ✅
```

### **Swing Trader** (เทรดปานกลาง):
```
แนะนำ: Manual Refresh อย่างเดียว
- 5-10 ครั้ง/วัน × 30 วัน = 150-300 calls/เดือน
- ใช้แค่ 3-6% ของ quota ✅
```

### **Position Trader** (เทรดน้อย):
```
แนะนำ: Manual Refresh อย่างเดียว
- 2-3 ครั้ง/วัน × 30 วัน = 60-90 calls/เดือน
- ใช้แค่ 1-2% ของ quota ✅
```

---

## 🔧 ขั้นตอนการตั้งค่า

### **1. อัพเกรด Gold API (ถ้ายังไม่ได้ทำ)**

1. ไปที่ https://www.goldapi.io
2. สมัครสมาชิก / เข้าสู่ระบบ
3. Upgrade เป็น **Basic Plan** ($10/month)
4. คัดลอก API Key ใหม่
5. ใส่ใน Script Properties:
   ```
   GOLD_API_KEY = your-new-api-key-here
   ```

---

### **2. ตั้งค่า Cache Duration (แนะนำ: 10 นาที)**

แก้ไข `Code.gs`:
```javascript
var CACHE_DURATION_SECONDS = 600; // 10 นาที
```

---

### **3. Deploy ระบบใหม่**

1. Copy `Code.gs` ใหม่
2. Copy `index.html` ใหม่
3. **Deploy > New deployment**
4. เปิด Web App

---

### **4. ตรวจสอบ API Usage**

1. เปิด Web App
2. คลิก **📊 Stats** (มุมล่างขวา)
3. ดู:
   ```
   API Calls: 0 / 5000
   Quota: 🟢 Good
   Plan: Basic Plan ($10/month)
   ```

---

## 📊 ตัวอย่าง API Stats

### **เดิม (Free Plan)**
```
┌─────────────────────────────┐
│ 📊 API Usage Stats          │
├─────────────────────────────┤
│ API Calls: 95 / 100         │
│ [████████████████████░] 95% │
│ Status: 🔴 Critical         │
│ Cache: 5 min | Next: 3m 24s │
└─────────────────────────────┘
```

### **ใหม่ (Basic Plan)**
```
┌─────────────────────────────┐
│ 📊 API Usage Stats          │
├─────────────────────────────┤
│ API Calls: 1,250 / 5,000    │
│ [█████░░░░░░░░░░░░░░░] 25%  │
│ Status: 🟢 Good             │
│ Cache: 10 min | Next: 7m 15s│
│ Plan: Basic ($10/month)     │
└─────────────────────────────┘
```

---

## ⚠️ สิ่งที่ต้องระวัง

### **1. ห้ามใช้ Cache < 3 นาที**
```
Cache 1 นาที = 43,200 calls/เดือน ❌ เกิน 8 เท่า!
Cache 2 นาที = 21,600 calls/เดือน ❌ เกิน 4 เท่า!
Cache 3 นาที = 14,400 calls/เดือน ❌ เกิน 3 เท่า!

✅ ใช้อย่างน้อย 5 นาที (8,640 calls) แต่ยังเกิน
✅ แนะนำ 10 นาที (4,320 calls) ปลอดภัย!
```

### **2. ระวัง Manual Refresh บ่อยเกินไป**
```
กด refresh ทุก 30 วินาที
= 120 calls/ชั่วโมง
= 2,880 calls/วัน
= 86,400 calls/เดือน ❌ เกิน 17 เท่า!

✅ กดไม่เกิน 10 ครั้ง/วัน
```

### **3. ตรวจสอบ Quota เป็นประจำ**
- ดู API Stats ทุกวัน
- ถ้าใกล้เกิน → ลด cache หรือหยุด auto-refresh

---

## 💰 ค่าใช้จ่ายที่แท้จริง

### **Basic Plan**
```
ราคา: $10/month
Quota: 5,000 calls

ค่าใช้จ่ายต่อ call:
$10 ÷ 5,000 = $0.002/call

ถ้าใช้ครบ quota:
5,000 calls × $0.002 = $10 (คุ้มค่า!)

ถ้าเกิน quota:
ต้องอัพเกรดเป็น Pro Plan ($30/month)
```

---

## 🎯 สรุป

### **ตั้งค่าที่แนะนำ**:
```javascript
// Code.gs
var CACHE_DURATION_SECONDS = 600; // 10 นาที
var API_PLAN = 'BASIC';
var API_QUOTA = 5000;
```

### **การใช้งาน**:
- Auto-refresh ทุก 10 นาที
- Manual refresh เมื่อต้องการเพิ่มเติม
- คาดการณ์: ~4,500 calls/เดือน (90% ของ quota)

### **ข้อดี**:
- ✅ Real-time พอสมควร (ล่าช้าแค่ 10 นาที)
- ✅ ไม่เกิน quota
- ✅ มี buffer 500 calls สำหรับ manual refresh

---

## 📞 ปัญหา?

ถ้ามีคำถามหรือต้องการปรับแต่งเพิ่มเติม บอกได้เลยครับ!

---

**Version**: 2.5.3 - Basic Plan Edition  
**Date**: 2026-01-17  
**Plan**: Basic ($10/month)  
**Quota**: 5,000 calls/month
