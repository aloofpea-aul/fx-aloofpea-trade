# 🔧 แก้ไข Gemini API Error

## ❌ ปัญหา

```
❌ Analysis failed: API Error: models/gemini-pro is not found 
for API version v1beta, or is not supported for generateContent.
```

---

## ✅ แก้ไขแล้ว!

### **สิ่งที่เปลี่ยน**

#### **1. API Endpoint**
```javascript
// เดิม (ผิด)
v1beta/models/gemini-pro:generateContent

// ใหม่ (ถูกต้อง)
v1/models/gemini-1.5-flash:generateContent
```

#### **2. Model Name**
```javascript
// เดิม
gemini-pro (Deprecated!)

// ใหม่
gemini-1.5-flash (Latest!)
```

#### **3. Safety Settings**
เพิ่ม safety settings เพื่อป้องกัน content blocking:
```javascript
safetySettings: [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_NONE"
  },
  // ... other categories
]
```

---

## 📋 ขั้นตอนการแก้ไข

### **1. Copy Code.gs ใหม่**
- ใช้ไฟล์ Code.gs ที่แก้ไขแล้ว
- ใน function `analyzeMarketNews()`

### **2. Deploy**
```
1. เปิด Apps Script Editor
2. วาง Code.gs ใหม่
3. Save (Ctrl+S / Cmd+S)
4. Deploy > New deployment
```

### **3. ทดสอบ**
```
1. เปิด Web App
2. กด "AI News Analysis"
3. เลือก Gold + Daily
4. กด "Analyze Market"
5. ควรได้ผลลัพธ์ภายใน 5-10 วินาที
```

---

## 🔍 Gemini Models ที่ใช้ได้

### **gemini-1.5-flash** (แนะนำ! ⭐)
```
✅ เร็วที่สุด (1-3 seconds)
✅ ราคาถูก (Free tier ใหญ่)
✅ เหมาะกับ real-time analysis
✅ รองรับ v1 API

Endpoint:
/v1/models/gemini-1.5-flash:generateContent
```

### **gemini-1.5-pro**
```
✅ ฉลาดที่สุด
✅ วิเคราะห์ลึกซึ้งกว่า
⚠️ ช้ากว่า (3-7 seconds)
⚠️ Quota น้อยกว่า

Endpoint:
/v1/models/gemini-1.5-pro:generateContent
```

### **gemini-pro** (เลิกใช้แล้ว ❌)
```
❌ Deprecated
❌ ใช้ไม่ได้กับ v1 API
❌ อย่าใช้!
```

---

## 📊 API Versions

### **v1 (Stable - ใช้นี้!)**
```javascript
https://generativelanguage.googleapis.com/v1/
models/gemini-1.5-flash:generateContent

✅ Stable
✅ Production-ready
✅ รองรับ model ใหม่ๆ
✅ แนะนำสำหรับ production
```

### **v1beta (Beta)**
```javascript
https://generativelanguage.googleapis.com/v1beta/
models/gemini-1.5-flash:generateContent

⚠️ Beta version
⚠️ อาจมีการเปลี่ยนแปลง
⚠️ ไม่แนะนำสำหรับ production
```

---

## 🧪 การทดสอบ API

### **วิธีทดสอบด้วย curl**

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Analyze Gold market today"
      }]
    }]
  }'
```

### **Expected Response**
```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "Gold (XAU/USD) Market Analysis..."
      }]
    }
  }]
}
```

---

## ⚙️ Safety Settings (สำคัญ!)

### **ทำไมต้องมี?**
```
Gemini มี content filters ที่อาจบลอกคำว่า:
- "risk"
- "trade"
- "profit/loss"
- "volatile"

ทำให้ analysis ไม่ออก!

แก้: ตั้ง threshold = "BLOCK_NONE"
```

### **Categories**
```javascript
1. HARM_CATEGORY_HARASSMENT
2. HARM_CATEGORY_HATE_SPEECH
3. HARM_CATEGORY_SEXUALLY_EXPLICIT
4. HARM_CATEGORY_DANGEROUS_CONTENT
```

### **Thresholds**
```javascript
BLOCK_NONE          // ไม่บลอก (ใช้นี้!)
BLOCK_ONLY_HIGH     // บลอกแค่ high-risk
BLOCK_MEDIUM_AND_ABOVE
BLOCK_LOW_AND_ABOVE
```

---

## 🔧 Troubleshooting

### **Error 1: API Key Invalid**
```
Error: API key not valid

แก้:
1. ตรวจสอบ API Key
2. ไปที่ https://makersuite.google.com/app/apikey
3. สร้าง key ใหม่
4. อัพเดทใน Script Properties
```

### **Error 2: Quota Exceeded**
```
Error: Resource exhausted

แก้:
1. รอ 1 นาที
2. ใช้ cache (อัตโนมัติ 1 ชม.)
3. ลดจำนวนการเรียก API
```

### **Error 3: Content Blocked**
```
Error: Blocked by safety filter

แก้:
1. ตรวจสอบ safetySettings
2. ตั้ง threshold = "BLOCK_NONE"
3. Deploy code ใหม่
```

### **Error 4: Model Not Found**
```
Error: models/gemini-pro is not found

แก้:
✅ ใช้ Code.gs ใหม่ที่แก้แล้ว
✅ Model: gemini-1.5-flash
✅ API: v1 (ไม่ใช่ v1beta)
```

---

## 📈 Performance Comparison

| Model | Speed | Quality | Quota | Use Case |
|-------|-------|---------|-------|----------|
| **gemini-1.5-flash** | ⚡⚡⚡ Very Fast | ⭐⭐⭐ Good | 🔥 High | Daily analysis |
| **gemini-1.5-pro** | ⚡⚡ Fast | ⭐⭐⭐⭐⭐ Excellent | 🔥 Medium | Deep analysis |
| ~~gemini-pro~~ | ❌ N/A | ❌ N/A | ❌ N/A | Deprecated |

---

## 💰 Free Tier Quota

### **gemini-1.5-flash**
```
Free Tier:
- 15 requests/minute
- 1,500 requests/day
- 1 million tokens/day

เพียงพอสำหรับ:
✅ วิเคราะห์ 100+ ครั้ง/วัน
✅ ใช้งานทั่วไป
✅ Development
```

### **gemini-1.5-pro**
```
Free Tier:
- 2 requests/minute
- 50 requests/day
- 32,000 tokens/day

เหมาะสำหรับ:
⚠️ วิเคราะห์เฉพาะเจาะจง
⚠️ Deep research
```

---

## ✅ Verification Checklist

- [ ] API Key ถูกต้อง
- [ ] ใช้ v1 endpoint (ไม่ใช่ v1beta)
- [ ] Model: gemini-1.5-flash
- [ ] มี safetySettings
- [ ] Deploy code ใหม่
- [ ] ทดสอบ Gold Daily
- [ ] ทดสอบ Gold Weekly
- [ ] ทดสอบ BTC Daily
- [ ] ทดสอบ BTC Weekly
- [ ] ตรวจสอบ cache (รันซ้ำภายใน 1 ชม.)

---

## 📞 Resources

- **API Docs**: https://ai.google.dev/api/rest/v1/models/generateContent
- **Model List**: https://ai.google.dev/gemini-api/docs/models/gemini
- **API Key**: https://makersuite.google.com/app/apikey
- **Pricing**: https://ai.google.dev/pricing

---

## 🎉 สรุป

### **ปัญหา**
```
❌ ใช้ v1beta + gemini-pro (เลิกใช้แล้ว)
```

### **แก้ไข**
```
✅ ใช้ v1 + gemini-1.5-flash (ใหม่ล่าสุด)
✅ เพิ่ม safety settings
✅ Better error handling
```

### **ผลลัพธ์**
```
🎉 วิเคราะห์ได้แล้ว!
⚡ เร็วกว่า (1-3 วินาที)
💰 ประหยัดกว่า (quota มากกว่า)
```

---

**Happy Trading with AI! 🤖💰**

Date: 2026-01-17
Version: 2.6.1 - API Fixed
