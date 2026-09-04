# 🥇 FX Aloofpea - Metals.Dev Edition

## ✅ เปลี่ยนจาก Gold API → Metals.Dev แล้ว!

---

## 🎯 สิ่งที่เปลี่ยนแปลง

### ✅ **API Provider**
- **เดิม**: Gold API (goldapi.io)
- **ใหม่**: **Metals.Dev** (metals.dev)

### ✅ **UI Improvements**
1. **ปุ่ม Metals.Dev** ใน Header (Desktop)
2. **API Provider Section** ใน Settings
3. **Source Label** เปลี่ยนเป็น "Metals.Dev"

---

## 📊 เปรียบเทียบ Gold API vs Metals.Dev

| Feature | Gold API | Metals.Dev |
|---------|----------|------------|
| **Free Quota** | 100 calls/month | **500 calls/month** ✅ |
| **Basic Plan** | $10/month (5,000) | **$15/month (5,000)** |
| **Pro Plan** | $30/month (20,000) | **$49/month (50,000)** |
| **API Response** | Fast | Fast |
| **Data Accuracy** | High | High |
| **Additional Metals** | Limited | **Gold, Silver, Platinum, Palladium** |
| **Documentation** | Good | **Excellent** |
| **Dashboard** | Basic | **Modern & Clean** |

---

## 🆓 Free Plan Details

### Metals.Dev Free Plan
```
Quota: 500 calls/month
Cost: $0
ต้องสมัคร: ใช่ (https://metals.dev)

การใช้งาน (Cache 10 นาที):
144 calls/วัน × 30 วัน = 4,320 calls/เดือน

❌ เกิน quota! ต้องปรับ Cache
```

### แนะนำ: Cache 30 นาที
```
48 calls/วัน × 30 วัน = 1,440 calls/เดือน
```
❌ **ยังเกิน!** ต้องใช้ **1 ชั่วโมง**

### ✅ แนะนำ: Cache 1 ชั่วโมง
```
24 calls/วัน × 30 วัน = 720 calls/เดือน
```
❌ **ยังเกิน!** ต้องใช้ **2 ชั่วโมง**

### ✅✅ แนะนำ: Cache 2 ชั่วโมง (สุดท้าย!)
```
12 calls/วัน × 30 วัน = 360 calls/เดือน
ใช้ 72% ของ quota ✅ ปลอดภัย!
```

---

## 🔧 การตั้งค่าที่แนะนำ

### **สำหรับ Free Plan (500/month)**

แก้ไขใน `Code.gs`:
```javascript
var CACHE_DURATION_SECONDS = 7200; // 2 ชั่วโมง
var API_PLAN = 'FREE';
var API_QUOTA = 500;
```

แก้ไขใน `index.html`:
```javascript
setInterval(function() {
    fetchPrices();
}, 7200000); // 2 hours
```

---

### **สำหรับ Basic Plan (5,000/month) - $15**

แก้ไขใน `Code.gs`:
```javascript
var CACHE_DURATION_SECONDS = 600; // 10 นาที
var API_PLAN = 'BASIC';
var API_QUOTA = 5000;
```

**การใช้งาน**:
```
144 calls/วัน × 30 = 4,320 calls/เดือน
ใช้ 86% ของ quota ✅
```

---

### **สำหรับ Pro Plan (50,000/month) - $49**

แก้ไขใน `Code.gs`:
```javascript
var CACHE_DURATION_SECONDS = 60; // 1 นาที (Real-time!)
var API_PLAN = 'PRO';
var API_QUOTA = 50000;
```

**การใช้งาน**:
```
1,440 calls/วัน × 30 = 43,200 calls/เดือน
ใช้ 86% ของ quota ✅
```

---

## 🚀 ขั้นตอนการติดตั้ง

### **1. สมัคร Metals.Dev**

1. ไปที่ https://metals.dev
2. คลิก **Sign Up** (มุมบนขวา)
3. กรอกข้อมูล:
   - Email
   - Password
   - Company Name (optional)
4. Verify Email
5. เข้าสู่ระบบ

---

### **2. สร้าง API Key**

1. ไปที่ https://metals.dev/dashboard
2. คลิก **API Keys** (เมนูซ้าย)
3. คลิก **Create New Key**
4. ตั้งชื่อ: "FX Aloofpea"
5. **คัดลอก API Key**
   ```
   ตัวอย่าง: QIOHCD6MLLAJ9LUMNDSD240UMNDSD
   ```

---

### **3. ตั้งค่าใน Google Apps Script**

1. เปิด Apps Script Editor
2. ไปที่ **Project Settings** (⚙️)
3. คลิก **Script Properties**
4. เพิ่ม Property:
   ```
   Key: METALS_API_KEY
   Value: QIOHCD6MLLAJ9LUMNDSD240UMNDSD
   ```
5. คลิก **Save**

---

### **4. Deploy โค้ดใหม่**

1. Copy `Code.gs` ใหม่ (Metals.Dev version)
2. Copy `index.html` ใหม่ (Metals.Dev UI)
3. **Deploy > New deployment**
4. เปิด Web App URL

---

### **5. ทดสอบ**

1. ดูการ์ด GOLD
   - ควรแสดงราคา
   - Source: "Metals.Dev"
2. คลิกปุ่ม **Metals.Dev** ใน Header
   - เปิด Dashboard
3. เปิด **Settings** > **API Provider**
   - ดูข้อมูล Metals.Dev
4. คลิก **📊 Stats**
   - ดู API Usage: `X / 500`

---

## 🎨 UI Features ใหม่

### 1. **ปุ่ม Metals.Dev ใน Header** (Desktop)
```
┌─────────────────────────────────────┐
│ 💰 FX Aloofpea    [Metals.Dev]  ⚙️  │
└─────────────────────────────────────┘
```
- แสดงเฉพาะ Desktop (hidden sm:flex)
- สีส้ม-เหลือง gradient
- เปิด Dashboard เมื่อคลิก

---

### 2. **API Provider Section ใน Settings**
```
┌─────────────────────────────────────┐
│ 🔶 API Provider                     │
├─────────────────────────────────────┤
│ 🪙 Metals.Dev API                   │
│ Real-time precious metals prices    │
│ with 500 free calls/month           │
├─────────────────────────────────────┤
│ Current Plan: Free (500/mo)         │
│ Cache: 10 minutes                   │
├─────────────────────────────────────┤
│ [Open Dashboard]   [View Pricing]   │
└─────────────────────────────────────┘
```

**Features**:
- แสดง Current Plan
- แสดง Cache duration
- ปุ่มไป Dashboard
- ปุ่มดู Pricing
- สีสวยงาม (Yellow-Orange gradient)

---

### 3. **Source Label**
```
GOLD                    Metals.Dev
$2,655.50
▼ -0.73%
▼ 33.45 pts | Source: Metals.Dev
```

---

## 📱 Mobile vs Desktop

### **Desktop (>640px)**
```
Header: [Logo] FX Aloofpea  [Metals.Dev Button] [Settings]
```

### **Mobile (<640px)**
```
Header: [Logo] FX Aloofpea  [Settings]
       (ซ่อนปุ่ม Metals.Dev)
```

---

## 🔍 API Response Structure

### **Metals.Dev Response**
```json
{
  "status": "success",
  "timestamp": 1737158400,
  "currency": "USD",
  "unit": "toz",
  "metals": {
    "gold": 2655.50,
    "silver": 30.25,
    "platinum": 980.50,
    "palladium": 1025.75
  }
}
```

### **Code.gs แปลงเป็น**
```javascript
{
  price: 2655.50,
  changePercent: -0.73,
  source: "Metals.Dev",
  pointChange: 0
}
```

---

## 💡 Tips & Tricks

### **1. ตรวจสอบ API Usage**
```
Settings > API Provider > Open Dashboard
→ ดูว่าใช้ไปกี่ call แล้ว
```

### **2. ประหยัด Quota**
```
เพิ่ม Cache:
- 10 นาที → 4,320 calls/เดือน (เกิน!)
- 30 นาที → 1,440 calls/เดือน (เกิน!)
- 1 ชั่วโมง → 720 calls/เดือน (เกิน!)
- 2 ชั่วโมง → 360 calls/เดือน ✅
```

### **3. อัพเกรด Plan**
```
ถ้าต้องการ Real-time มากกว่า:
Settings > API Provider > View Pricing
→ เลือก Basic ($15) หรือ Pro ($49)
```

---

## ⚠️ ข้อควรระวัง

### **1. API Key ต้องถูกต้อง**
```
ถ้า API Key ผิด:
- ราคาจะแสดงเป็น Fallback
- Source: "Fallback"
```

### **2. Quota จำกัด**
```
Free: 500 calls/month
ถ้าเกิน → API จะ error
→ ต้องรอเดือนใหม่ หรือ อัพเกรด
```

### **3. Cache ต้องเหมาะสม**
```
Cache น้อยเกินไป → เกิน quota
Cache มากเกินไป → ราคาล่าช้า

แนะนำ:
- Free: 2 ชั่วโมง
- Basic: 10 นาที
- Pro: 1 นาที
```

---

## 📞 Links

- **Website**: https://metals.dev
- **Dashboard**: https://metals.dev/dashboard
- **Pricing**: https://metals.dev/pricing
- **Docs**: https://docs.metals.dev
- **Support**: support@metals.dev

---

## 🆕 Version History

### v2.5.3 - Metals.Dev Edition (2026-01-17)
- ✅ เปลี่ยนจาก Gold API เป็น Metals.Dev
- ✅ เพิ่มปุ่ม Metals.Dev ใน Header
- ✅ เพิ่ม API Provider section ใน Settings
- ✅ อัพเดท UI ให้สวยงาม
- ✅ รองรับ Free (500), Basic (5K), Pro (50K)

### v2.5.2 (2026-01-17)
- Security fixes
- Input validation
- Manual refresh button

---

## 📝 สรุป

### ✅ **ข้อดี Metals.Dev**
1. Quota มากกว่า (500 vs 100)
2. Dashboard สวยกว่า
3. Documentation ดีกว่า
4. ราคาถูกกว่าเล็กน้อย
5. รองรับ metals หลายชนิด

### ⚠️ **ข้อควรระวัง**
1. ต้องตั้ง Cache ให้เหมาะสม (2 ชั่วโมงสำหรับ Free)
2. ต้องสมัครและสร้าง API Key
3. Free plan จำกัดอยู่ดี

### 🎯 **คำแนะนำ**
- **Day Trader**: ใช้ Basic Plan ($15) + Cache 10 นาที
- **Swing Trader**: ใช้ Free Plan + Cache 2 ชั่วโมง + Manual Refresh
- **Position Trader**: ใช้ Free Plan + Manual Refresh อย่างเดียว

---

**Happy Trading! 🚀**
