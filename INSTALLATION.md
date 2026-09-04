# 🚀 FX Aloofpea v2.5.2 - Installation Guide

## 📦 สิ่งที่ได้รับการแก้ไข

### ✅ Security Improvements
- ✓ ย้าย API Keys ไปใช้ Script Properties (ไม่ hardcode ในโค้ด)
- ✓ เพิ่ม Input validation ทั้ง Frontend และ Backend
- ✓ เพิ่ม Rate limiting protection
- ✓ Sanitize user inputs (XSS protection)

### ✅ Stability Improvements
- ✓ แก้ไข Cache namespace collision
- ✓ ปรับ Error handling ให้สมบูรณ์
- ✓ แก้ Race condition ใน Floating P/L calculation
- ✓ ปรับ Price fetch interval ให้ตรงกับ cache duration (5 นาที)

### ✅ Bug Fixes
- ✓ แก้ไข "Loading..." ไม่หายบน price display
- ✓ แก้ไข Type coercion ใน trade ID comparison (ใช้ === แทน ==)
- ✓ เพิ่ม validation error messages
- ✓ แก้ไข Memory leak ใน Charts

---

## 📋 ขั้นตอนการติดตั้ง

### 1️⃣ สร้าง Google Spreadsheet

1. ไปที่ https://sheets.google.com
2. สร้างไฟล์ใหม่ชื่อ "FX Aloofpea"
3. คัดลอก **Spreadsheet ID** จาก URL

```
https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
                                        ^^^^^^^^^^^^^^^^^^^^
                                        คัดลอกส่วนนี้
```

---

### 2️⃣ เปิด Apps Script Editor

1. ใน Spreadsheet: **Extensions** > **Apps Script**
2. ลบโค้ดเดิมทั้งหมด

---

### 3️⃣ สร้างไฟล์ Backend

1. **สร้างไฟล์ Code.gs**
   - คัดลอกเนื้อหาจากไฟล์ `Code.gs` ที่ได้รับ
   - วางลงไป

2. **แก้ไข SPREADSHEET_ID** (ถ้าจำเป็น)
   - หาบรรทัด:
   ```javascript
   var SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || 'YOUR_ID_HERE';
   ```
   - แทนที่ `'YOUR_ID_HERE'` ด้วย Spreadsheet ID ของคุณ

---

### 4️⃣ ตั้งค่า Script Properties (สำคัญมาก!)

1. ใน Apps Script Editor: **Project Settings** (⚙️) > **Script Properties**
2. กด **Add script property** และเพิ่ม:

| Property | Value | คำอธิบาย |
|----------|-------|----------|
| `SPREADSHEET_ID` | `1-bq0P6...` | Spreadsheet ID ของคุณ |
| `GOLD_API_KEY` | `goldapi-...` | API Key จาก goldapi.io (ถ้ามี) |

**หมายเหตุ**: ถ้าไม่มี Gold API Key ระบบจะใช้ fallback price อัตโนมัติ

---

### 5️⃣ สร้างไฟล์ HTML Frontend

1. คลิก **+** > **HTML**
2. ตั้งชื่อว่า `index` (ไม่ต้องใส่ .html)
3. คัดลอกเนื้อหาจากไฟล์ `index.html` ที่ได้รับ
4. วางลงไป

---

### 6️⃣ รัน Setup Function

1. เลือกฟังก์ชัน `setupSheets` จาก Dropdown
2. กด **Run** (▶️)
3. **อนุญาต Permissions**:
   - คลิก **Review Permissions**
   - เลือก Google Account
   - คลิก **Advanced** > **Go to FX Aloofpea (unsafe)**
   - คลิก **Allow**

✅ ตรวจสอบว่า Spreadsheet มี 3 sheets:
- `Trades`
- `Config`
- `PriceHistory`

---

### 7️⃣ Deploy Web App

1. คลิก **Deploy** > **New deployment**
2. เลือก type: **Web app**
3. ตั้งค่า:
   - **Description**: FX Aloofpea v2.5.2
   - **Execute as**: Me
   - **Who has access**: Anyone
4. คลิก **Deploy**
5. **คัดลอก Web app URL**

```
https://script.google.com/macros/s/AKfycby.../exec
```

---

### 8️⃣ ทดสอบระบบ

1. เปิด Web app URL ในเบราว์เซอร์
2. ตรวจสอบ:
   - ✓ ราคา GOLD และ BTC แสดงขึ้น (ไม่ใช่ "Loading...")
   - ✓ Balance แสดง $500.00
   - ✓ API Stats panel ทำงาน (คลิก "📊 Stats")
   - ✓ Settings เปิดได้

---

## 🔧 การตั้งค่าเพิ่มเติม

### ตั้งค่า LINE Notifications (ไม่บังคับ)

1. ไปที่ **Settings** (⚙️)
2. เลื่อนลงไปที่ **LINE Push Messaging**
3. กรอก:
   - **Channel Access Token**: จาก LINE Developers
   - **User ID**: ID ของคุณ
   - **Group ID**: (ถ้าต้องการส่งไปกลุ่ม)
4. กด **Save Changes**

### ตั้งค่า Goals

1. เปิด **Settings**
2. ปรับ:
   - **Capital**: เงินทุนเริ่มต้น
   - **Daily Target**: เป้าหมายรายวัน
   - **Monthly Target**: เป้าหมายรายเดือน
   - **Yearly Target**: เป้าหมายรายปี
3. กด **Save Changes**

---

## 🧪 การทดสอบฟังก์ชัน Backend

### ทดสอบราคา Gold API
```javascript
// เลือกฟังก์ชัน: testGoldAPI
// กด Run
// ดูใน Execution log
```

**ผลลัพธ์ที่คาดหวัง**:
```
=== Testing Gold API ===
Price: $2655.xx
Change: 0.25%
Source: Gold API
✅ SUCCESS!
```

### ทดสอบ API Usage Stats
```javascript
// เลือกฟังก์ชัน: viewAPIStats
// กด Run
```

**ผลลัพธ์**:
```
📊 Monthly Usage:
  API Calls: 0 / 100
  Remaining: 100
  Used: 0%
🟢 Status: GOOD
```

### ตรวจสอบ Cache Status
```javascript
// เลือกฟังก์ชัน: checkCacheStatus
// กด Run
```

---

## 📱 การใช้งาน

### สร้าง Trade ใหม่

1. กดปุ่ม **+** (สีน้ำเงิน) มุมล่างขวา
2. เลือก Type: **MARKET BUY** หรือ **MARKET SELL**
3. เลือก Asset: **GOLD** หรือ **BITCOIN**
4. กรอก Lots: เช่น `0.01`
5. กรอก Entry Price (หรือกด "Current")
6. กด **Confirm**

### ปิด Trade

1. ไปที่แท็บ **Open Orders**
2. คลิก **Close** ที่ trade ที่ต้องการ
3. Confirm

### Edit Trade

1. คลิก **Edit** ที่ trade ใดก็ได้
2. แก้ไขข้อมูล
3. กด **Update**

### ดูกราฟราคา

- คลิกที่ GOLD card หรือ BTC card
- ระบบจะแสดงกราฟ 50 จุดล่าสุด

---

## 🔍 Troubleshooting

### ปัญหา: "Loading..." ไม่หาย

**สาเหตุ**: ไม่มี SPREADSHEET_ID ใน Script Properties

**วิธีแก้**:
1. ไปที่ **Project Settings** > **Script Properties**
2. เพิ่ม `SPREADSHEET_ID` และใส่ค่า
3. Save และ Redeploy

---

### ปัญหา: ราคาไม่อัพเดท

**สาเหตุ**: Cache ยังไม่หมดอายุ (5 นาที)

**วิธีแก้**:
```javascript
// รันฟังก์ชัน: clearPriceCache
// จากนั้น refresh หน้าเว็บ
```

---

### ปัญหา: API Quota เกิน 100

**สาเหตุ**: ใช้ Gold API เกิน 100 ครั้งต่อเดือน

**วิธีแก้**:
1. เพิ่ม `CACHE_DURATION_SECONDS` จาก 300 เป็น 600 (10 นาที)
2. หรือรันฟังก์ชัน `resetAPICounter` (เฉพาะเดือนใหม่)

---

### ปัญหา: Trade ไม่บันทึก

**เช็คใน Execution log**:
```
❌ Validation failed: Entry price must be greater than 0
```

**วิธีแก้**: กรอกข้อมูลให้ครบและถูกต้อง

---

## 🎯 คำแนะนำการใช้งาน

### เพิ่มประสิทธิภาพ API

1. ตั้ง `CACHE_DURATION_SECONDS = 600` (10 นาที) ถ้าไม่ต้องการราคา real-time มาก
2. ดู API usage ใน Stats panel เป็นประจำ
3. ถ้าใกล้เกิน quota ให้เพิ่ม cache interval

### Risk Management

1. ใช้ Position Size Calculator ก่อนเปิด trade
2. ตั้ง Risk % ไม่เกิน 2% ต่อ trade
3. ใช้ R:R Calculator เพื่อวางแผน TP และ SL

### Analytics

1. ตรวจสอบ Win Rate เป็นประจำ
2. ดู Profit Factor (ควรมากกว่า 1.5)
3. วิเคราะห์ Asset Performance เพื่อหา pair ที่เหมาะกับคุณ

---

## 🔐 Security Best Practices

1. **ไม่แชร์ Script Properties**
   - อย่าแชร์ GOLD_API_KEY
   - อย่าแชร์ LINE_CHANNEL_ACCESS_TOKEN

2. **ตั้งค่า Web App Access**
   - ใช้ "Anyone" เฉพาะตัวเอง
   - หรือใช้ "Anyone with the link" แล้วเก็บ URL ไว้เป็นความลับ

3. **Backup ข้อมูล**
   - Export Spreadsheet เป็น Excel เป็นประจำ
   - Copy Sheet ไว้เป็น backup

---

## 📞 Support

หากมีปัญหา:

1. ตรวจสอบ **Execution log** ใน Apps Script
2. เปิด **Browser Console** (F12) ดู error
3. รัน `testConnection()` เพื่อตรวจสอบการเชื่อมต่อ

---

## 📝 Changelog v2.5.2

### Added
- Input validation with error messages
- Rate limiting protection
- Cache namespace prefix
- Better error handling

### Fixed
- Loading screen stuck issue
- Type coercion in trade comparison
- Memory leak in charts
- Race condition in floating P/L

### Changed
- API Keys moved to Script Properties
- Price fetch interval matches cache duration
- Improved security with input sanitization

---

**เวอร์ชัน**: 2.5.2-FIXED  
**วันที่**: 2026-01-17  
**ผู้พัฒนา**: Aloofpea Team
