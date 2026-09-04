# 🤖 AI News Analysis - Guide

## ✨ คุณสมบัติใหม่

ระบบวิเคราะห์ข่าวตลาดด้วย **Google Gemini AI** สำหรับทองคำและบิตคอยน์

---

## 🎯 Features

### **1. ปุ่ม AI News Analysis**
```
┌─────────────────────────────────────┐
│  🧠 AI News Analysis                │
│  Powered by Gemini                  │
└─────────────────────────────────────┘
```
- สีม่วง-ชมพู (Purple-Pink gradient)
- อยู่ระหว่าง Refresh Prices และ Portfolio

---

### **2. Asset Selection**
```
┌──────────────┬──────────────┐
│ 🥇 Gold      │ ₿ Bitcoin    │
└──────────────┴──────────────┘
```
- เลือกสินทรัพย์ที่ต้องการวิเคราะห์
- Gold (XAU/USD) หรือ Bitcoin (BTC/USD)

---

### **3. Period Selection**
```
┌──────────────┬──────────────┐
│ 📅 Daily     │ 📊 Weekly    │
└──────────────┴──────────────┘
```
- **Daily**: วิเคราะห์ข่าววันนี้ / 24 ชม.ล่าสุด
- **Weekly**: วิเคราะห์ข่าวสัปดาห์นี้ / 7 วันล่าสุด

---

### **4. AI Analysis**
```
┌─────────────────────────────────────┐
│ 🤖 Gold (XAU/USD) - Daily Analysis  │
│ Powered by Google Gemini            │
├─────────────────────────────────────┤
│ Key Market Events                   │
│ • Federal Reserve maintains rates   │
│ • Gold up 0.5% on inflation data   │
│                                     │
│ Price Impact Analysis               │
│ 📈 Bullish - Support at $2,650     │
│                                     │
│ Technical Sentiment                 │
│ 🟢 Positive momentum building       │
│                                     │
│ Trading Recommendation              │
│ • Consider long positions           │
│ • Set stop loss at $2,645          │
│                                     │
│ Risk Factors                        │
│ ⚠️ Watch for USD strength           │
└─────────────────────────────────────┘
```

---

## 🔧 การตั้งค่า

### **1. Google AI API Key**

#### **วิธีขอ API Key:**

1. ไปที่ https://makersuite.google.com/app/apikey
2. เข้าสู่ระบบด้วย Google Account
3. คลิก **"Get API Key"**
4. คลิก **"Create API key in new project"**
5. คัดลอก API Key

#### **ใส่ใน Script Properties:**
```
Key: GOOGLE_AI_API_KEY
Value: AIzaSyD0XnWbQFiP6zBfHm5_Im6JoTzwXreB8s0
```

---

### **2. ตั้งค่าใน Code.gs**

```javascript
var GOOGLE_AI_API_KEY = 
  PropertiesService.getScriptProperties()
    .getProperty('GOOGLE_AI_API_KEY') || 
  'AIzaSyD0XnWbQFiP6zBfHm5_Im6JoTzwXreB8s0';
```

---

## 📊 การทำงาน

### **Backend (Code.gs)**

#### **Function: analyzeMarketNews(asset, period)**

```javascript
1. สร้าง Prompt สำหรับ AI
   - ระบุสินทรัพย์ (Gold/Bitcoin)
   - ระบุช่วงเวลา (Daily/Weekly)
   - ขอข้อมูล 5 หัวข้อ:
     * Key Market Events
     * Price Impact Analysis
     * Technical Sentiment
     * Trading Recommendation
     * Risk Factors

2. เรียก Gemini API
   - Model: gemini-pro
   - Temperature: 0.7
   - Max Tokens: 1024

3. บันทึกผลลงใน Cache (1 ชม.)

4. Return Analysis
```

---

### **Frontend (index.html)**

```javascript
1. เปิด Modal
2. เลือก Asset (Gold/Bitcoin)
3. เลือก Period (Daily/Weekly)
4. กด "Analyze Market"
5. แสดง Loading (5-10 วินาที)
6. แสดงผลการวิเคราะห์
```

---

## 💡 ตัวอย่างการใช้งาน

### **Scenario 1: วิเคราะห์ทองคำรายวัน**

```
1. กด "AI News Analysis"
2. เลือก 🥇 Gold
3. เลือก 📅 Daily
4. กด "Analyze Market"
5. รอ 5-10 วินาที
6. อ่านการวิเคราะห์
```

**ผลลัพธ์:**
```
🤖 Gold (XAU/USD) - Daily Analysis

Key Market Events
• Federal Reserve maintains interest rates
• Inflation data shows 3.1% year-over-year
• Gold price up 0.5% to $2,655

Price Impact Analysis
📈 Bullish - Strong support at $2,650
Resistance at $2,670

Technical Sentiment
🟢 Positive momentum building
RSI at 58 (neutral-bullish)

Trading Recommendation
• Consider long positions on dips
• Target: $2,680-$2,700
• Stop loss: $2,645

Risk Factors
⚠️ Watch for USD strength
⚠️ Monitor Fed speeches
```

---

### **Scenario 2: วิเคราะห์บิตคอยน์รายสัปดาห์**

```
1. กด "AI News Analysis"
2. เลือก ₿ Bitcoin
3. เลือก 📊 Weekly
4. กด "Analyze Market"
5. อ่านการวิเคราะห์
```

**ผลลัพธ์:**
```
🤖 Bitcoin (BTC/USD) - Weekly Analysis

Key Market Events
• Bitcoin ETF inflows reach $1.2B this week
• SEC approves new crypto regulations
• Mining difficulty increases 5%

Price Impact Analysis
📈 Bullish - Breaking $95,000 resistance
Next target: $100,000

Technical Sentiment
🟢 Strong bullish momentum
All moving averages trending up

Trading Recommendation
• HODL current positions
• Consider adding on pullbacks to $92,000
• Take partial profits at $100,000

Risk Factors
⚠️ Regulatory uncertainty
⚠️ High volatility expected
⚠️ Watch for whale movements
```

---

## 🎨 UI Details

### **Modal Design**

```
Width: max-w-2xl (large)
Height: max-h-90vh (scrollable)
Background: Dark with blur
Border: Purple gradient

Sections:
1. Header (Brain icon + Title)
2. Asset Selection (2 buttons)
3. Period Selection (2 buttons)
4. Analyze Button (Purple-Pink)
5. Result Area (Expandable)
6. Loading State (Spinner)
```

---

### **Button States**

#### **Asset Selection**
```css
Default: bg-slate-700
Selected Gold: bg-yellow-600 border-yellow-500
Selected BTC: bg-orange-600 border-orange-500
```

#### **Period Selection**
```css
Default: bg-slate-700
Selected: bg-purple-600 border-purple-500
```

---

## 📈 API Quota

### **Google AI (Gemini) Free Tier**

```
Quota: 60 requests/minute
Daily: Unlimited (with rate limit)
Cost: FREE

ตัวอย่าง:
- วิเคราะห์ 1 ครั้ง = 1 request
- Cache 1 ชั่วโมง = ลดการใช้งาน
- เรียกซ้ำภายใน 1 ชม. = ไม่ใช้ quota
```

---

## 🔄 Caching System

### **การทำงาน**

```javascript
Key: 'ai_analysis_' + asset + '_' + period

ตัวอย่าง:
- ai_analysis_GOLD_daily
- ai_analysis_GOLD_weekly
- ai_analysis_BTC_daily
- ai_analysis_BTC_weekly

Duration: 1 hour (3600 seconds)
```

### **ข้อดี**

```
✅ ประหยัด API quota
✅ Response เร็วขึ้น (instant)
✅ ลดโอกาส rate limit
```

---

## ⚠️ Error Handling

### **API Errors**

```javascript
1. Invalid API Key
   → ตรวจสอบ API Key ใน Script Properties

2. Rate Limit Exceeded
   → รอ 1 นาที แล้วลองใหม่

3. No Response
   → ตรวจสอบ internet connection

4. Invalid Request
   → ตรวจสอบ prompt format
```

---

## 🎯 Prompt Engineering

### **Prompt Structure**

```
Analyze the latest market news for [Asset]

Time Period: [Period]

Provide:
1. Key Market Events
2. Price Impact Analysis
3. Technical Sentiment
4. Trading Recommendation
5. Risk Factors

Format: Clear, concise, under 500 words
```

### **Temperature & Parameters**

```javascript
temperature: 0.7  // Creative but controlled
topK: 40          // Diverse responses
topP: 0.95        // High quality
maxTokens: 1024   // Sufficient length
```

---

## 🔍 Response Format

### **Raw API Response**

```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "Key Market Events\\n• Event 1..."
      }]
    }
  }]
}
```

### **Processed Response**

```javascript
{
  success: true,
  asset: "Gold (XAU/USD)",
  period: "daily",
  analysis: "Key Market Events\\n• Event 1...",
  cached: false,
  timestamp: "2026-01-17T10:30:00.000Z"
}
```

---

## 💻 Code Examples

### **Call from Frontend**

```javascript
google.script.run
  .withSuccessHandler(function(result) {
    if (result.success) {
      displayAnalysis(result.analysis);
    }
  })
  .getAIAnalysis('GOLD', 'daily');
```

### **Backend Processing**

```javascript
function getAIAnalysis(asset, period) {
  // Check cache first
  var cached = getCachedAnalysis(asset, period);
  if (cached) return cached;
  
  // Generate new analysis
  return analyzeMarketNews(asset, period);
}
```

---

## 📱 Mobile Responsive

### **Desktop (>768px)**
```
Modal: 2xl (max-w-2xl)
Buttons: Full width
Text: Normal size
```

### **Mobile (<768px)**
```
Modal: Full width (px-4)
Buttons: Full width
Text: Slightly smaller
Scrollable: Yes
```

---

## 🎓 Best Practices

### **1. ใช้ Cache อย่างชาญฉลาด**
```
- วิเคราะห์ครั้งเดียว = ใช้ได้ 1 ชม.
- ไม่ต้องวิเคราะห์ซ้ำบ่อยๆ
- ประหยัด quota
```

### **2. เลือก Period ให้เหมาะสม**
```
- Day Trading → Daily
- Swing Trading → Weekly
- Position Trading → Weekly
```

### **3. ใช้ร่วมกับข้อมูลอื่น**
```
- Price Charts
- Technical Indicators
- News Sources
- Market Sentiment
```

---

## 🚀 Future Enhancements

### **Planned Features**

```
1. สรุปภาษาไทย
2. Voice output (Text-to-Speech)
3. Save analysis history
4. Compare periods (Daily vs Weekly)
5. Sentiment score (0-100)
6. Price prediction
7. Auto-refresh analysis
8. Email/LINE notification
```

---

## 📞 API Documentation

### **Google AI (Gemini) API**

- **Docs**: https://ai.google.dev/docs
- **API Key**: https://makersuite.google.com/app/apikey
- **Pricing**: https://ai.google.dev/pricing
- **Models**: https://ai.google.dev/models/gemini

---

## 🔐 Security

### **API Key Protection**

```javascript
✅ Store in Script Properties
✅ Never expose in client code
✅ Use environment variables
❌ Never commit to Git
❌ Never share publicly
```

---

## 📊 Usage Statistics

### **Typical Usage**

```
Request: 1x per analysis
Cache: 1 hour
Response Time: 5-10 seconds
Response Size: 500-1000 words

Daily Usage (Free Plan):
- 10 analyses/day = 10 requests
- Cache hit rate: ~60%
- Actual requests: ~4/day
```

---

## ✅ Checklist

### **Setup**
- [ ] Get Google AI API Key
- [ ] Add to Script Properties
- [ ] Deploy Code.gs
- [ ] Deploy index.html
- [ ] Test Gold Daily
- [ ] Test Gold Weekly
- [ ] Test BTC Daily
- [ ] Test BTC Weekly

### **Verification**
- [ ] Button appears
- [ ] Modal opens
- [ ] Asset selection works
- [ ] Period selection works
- [ ] Analysis loads
- [ ] Results display properly
- [ ] Cache works
- [ ] Errors handled

---

**Happy Trading with AI! 🤖💰**

Version: 2.6.0 - AI Edition
Date: 2026-01-17
Powered by: Google Gemini
