// ===============================
// FX Aloofpea - Backend System (FIXED)
// Version 2.5.2 - Security & Stability Improvements
// ===============================

// ⚠️ IMPORTANT: Set these in Script Properties instead of hardcoding
// File > Project properties > Script properties
// Add: SPREADSHEET_ID, METALS_API_KEY, ANTHROPIC_API_KEY, LINE_CHANNEL_ACCESS_TOKEN, LINE_USER_ID

var SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '1-bq0P6KeqJZGQjkuEqQWq11krKYYL1h5A22mGQpBIkM';
var METALS_API_KEY = PropertiesService.getScriptProperties().getProperty('METALS_API_KEY') || 'QIOHCD6MLLAJ9LUMNDSD240UMNDSD';
var ANTHROPIC_API_KEY = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY') || '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';
var LINE_CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN') || '';
var LINE_USER_ID = PropertiesService.getScriptProperties().getProperty('LINE_USER_ID') || '';

// Metals.Dev API Configuration (https://metals.dev)
var METALS_API_URL = 'https://api.metals.dev/v1/latest';
var CACHE_DURATION_SECONDS = 600; // Cache 10 นาที
var CACHE_PREFIX = 'fxaloofpea_'; // Namespace for cache keys
var API_PLAN = 'FREE'; // FREE (500/month) หรือ BASIC (5000/month) หรือ PRO (50000/month)
var API_QUOTA = 500; // Quota ตาม plan

// API Provider Info
var API_PROVIDER = {
  name: 'Metals.Dev',
  website: 'https://metals.dev',
  dashboard: 'https://metals.dev/dashboard',
  pricing: 'https://metals.dev/pricing',
  docs: 'https://docs.metals.dev'
};

// Rate limiting
var MIN_REQUEST_INTERVAL_MS = 1000; // ห่างกันอย่างน้อย 1 วินาที

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('FX Aloofpea')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ===================================
// API QUOTA MANAGEMENT
// ===================================

function getAPIQuota() {
  var planNames = {
    'FREE': 'Free Plan (500/month)',
    'BASIC': 'Basic Plan (5,000/month) - $15',
    'PRO': 'Pro Plan (50,000/month) - $49'
  };
  
  return {
    plan: API_PLAN,
    quota: API_QUOTA,
    planName: planNames[API_PLAN] || 'Custom Plan',
    provider: API_PROVIDER
  };
}

function getAPIUsageStats() {
  try {
    var cache = CacheService.getScriptCache();
    var apiCallCount = parseInt(cache.get(CACHE_PREFIX + 'apiCallCount') || '0');
    var quota = getAPIQuota();
    
    var usagePercent = (apiCallCount / quota.quota * 100).toFixed(1);
    var remaining = quota.quota - apiCallCount;
    
    var status = 'GOOD';
    if (usagePercent >= 90) status = 'CRITICAL';
    else if (usagePercent >= 70) status = 'WARNING';
    else if (usagePercent >= 50) status = 'MODERATE';
    
    return {
      calls: apiCallCount,
      quota: quota.quota,
      remaining: remaining,
      usagePercent: parseFloat(usagePercent),
      status: status,
      plan: quota.plan,
      planName: quota.planName
    };
  } catch(e) {
    Logger.log('Error getting API usage stats: ' + e);
    return { error: e.toString() };
  }
}

// ===================================
// INPUT VALIDATION
// ===================================

function validateTradeInput(form) {
  var errors = [];
  
  // Validate asset
  var validAssets = ['XAUUSD', 'BTCUSD', 'EURUSD', 'GBPUSD', 'USDJPY'];
  if (!form.asset || validAssets.indexOf(form.asset) === -1) {
    errors.push('Invalid asset');
  }
  
  // Validate type
  var validTypes = ['BUY', 'SELL', 'BUY LIMIT', 'SELL LIMIT', 'BUY STOP', 'SELL STOP'];
  if (!form.type || validTypes.indexOf(form.type) === -1) {
    errors.push('Invalid order type');
  }
  
  // Validate entry price
  var entryPrice = parseFloat(form.entryPrice);
  if (!form.entryPrice || isNaN(entryPrice) || entryPrice <= 0) {
    errors.push('Entry price must be greater than 0');
  }
  
  // Validate lots
  var lots = parseFloat(form.lots);
  if (!form.lots || isNaN(lots) || lots <= 0) {
    errors.push('Lot size must be greater than 0');
  }
  
  if (lots > 100) {
    errors.push('Lot size too large (max 100)');
  }
  
  // Validate exit price if provided
  if (form.exitPrice && form.exitPrice !== '') {
    var exitPrice = parseFloat(form.exitPrice);
    if (isNaN(exitPrice) || exitPrice <= 0) {
      errors.push('Exit price must be greater than 0');
    }
  }
  
  // Validate swap
  if (form.swap) {
    var swap = parseFloat(form.swap);
    if (isNaN(swap)) {
      errors.push('Invalid swap value');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

function sanitizeString(str) {
  if (!str) return '';
  return String(str).replace(/[<>]/g, '').substring(0, 500);
}

// ===================================
// RATE LIMITING
// ===================================

function checkRateLimit() {
  var cache = CacheService.getScriptCache();
  var lastCallTime = cache.get(CACHE_PREFIX + 'lastAPICallTime');
  var now = new Date().getTime();
  
  if (lastCallTime && (now - parseInt(lastCallTime)) < MIN_REQUEST_INTERVAL_MS) {
    Logger.log('⚠️ Rate limit protection: Too many requests');
    return false;
  }
  
  cache.put(CACHE_PREFIX + 'lastAPICallTime', now.toString(), 10);
  return true;
}

// ===================================
// TEST & DIAGNOSTIC FUNCTIONS
// ===================================

function testConnection() {
  return {
    success: true,
    message: 'Connection OK',
    timestamp: new Date().toString(),
    spreadsheetId: SPREADSHEET_ID,
    version: '2.5.2'
  };
}

function testGetPortfolio() {
  Logger.log('=== testGetPortfolio called ===');
  try {
    var data = getPortfolioData();
    if (!data) {
      return { error: 'getPortfolioData returned null' };
    }
    return {
      success: true,
      balance: data.balance,
      openCount: data.open ? data.open.length : 0,
      historyCount: data.history ? data.history.length : 0,
      hasConfig: !!data.config
    };
  } catch(error) {
    Logger.log('ERROR: ' + error.toString());
    return { error: error.toString(), stack: error.stack };
  }
}

// ===================================
// SHEETS SETUP
// ===================================

function setupSheets() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var headerStyle = SpreadsheetApp.newTextStyle().setBold(true).setForegroundColor('#ffffff').build();
    
    // Trades Sheet
    var tradesSheet = ss.getSheetByName('Trades');
    if (!tradesSheet) tradesSheet = ss.insertSheet('Trades');
    
    var headers = ['Timestamp', 'Trade ID', 'Asset', 'Type', 'Status', 'Entry Price', 'Exit Price', 'Lots', 'Swap/Comm', 'Profit/Loss', 'Profit %', 'Entry Time', 'Exit Time', 'Duration', 'Notes'];
    tradesSheet.getRange('A1:O1').setValues([headers])
      .setBackground('#1e293b')
      .setTextStyle(headerStyle)
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    
    tradesSheet.setColumnWidth(1, 150);
    tradesSheet.setColumnWidth(2, 100);
    tradesSheet.setColumnWidth(3, 80);
    tradesSheet.setColumnWidth(4, 100);
    tradesSheet.setColumnWidth(5, 80);
    tradesSheet.setColumnWidth(6, 100);
    tradesSheet.setColumnWidth(7, 100);
    tradesSheet.setColumnWidth(8, 80);
    tradesSheet.setColumnWidth(9, 100);
    tradesSheet.setColumnWidth(10, 100);
    tradesSheet.setColumnWidth(11, 80);
    tradesSheet.setColumnWidth(12, 150);
    tradesSheet.setColumnWidth(13, 150);
    tradesSheet.setColumnWidth(14, 100);
    tradesSheet.setColumnWidth(15, 200);
    tradesSheet.setFrozenRows(1);
    
    // Config Sheet
    var configSheet = ss.getSheetByName('Config');
    if (!configSheet) configSheet = ss.insertSheet('Config');
    
    configSheet.getRange('A1:B1').setValues([['Key', 'Value']])
      .setBackground('#0f172a')
      .setTextStyle(headerStyle)
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    
    if (configSheet.getLastRow() < 2) {
      configSheet.getRange('A2:B10').setValues([
        ['TotalCapital', 500],
        ['TotalCredit', 0],
        ['GoalDaily', 10],
        ['GoalMonthly', 300],
        ['GoalYearly', 3600],
        ['ProfitAlertThreshold', 100],
        ['LINEChannelAccessToken', ''],
        ['LINEUserId', ''],
        ['LINEGroupId', '']
      ]);
    }
    
    configSheet.setColumnWidth(1, 200);
    configSheet.setColumnWidth(2, 300);
    
    // Price History Sheet
    var priceHistorySheet = ss.getSheetByName('PriceHistory');
    if (!priceHistorySheet) {
      priceHistorySheet = ss.insertSheet('PriceHistory');
      priceHistorySheet.getRange('A1:C1').setValues([['Timestamp', 'Gold Price', 'BTC Price']])
        .setBackground('#1e293b').setTextStyle(headerStyle);
      priceHistorySheet.setFrozenRows(1);
    }
    
    Logger.log('✅ Sheets setup completed');
    return { success: true, message: 'Sheets setup completed' };
    
  } catch(error) {
    Logger.log('❌ Error setting up sheets: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

// ===================================
// REAL-TIME PRICES WITH API STATS & POINT CHANGES
// ===================================

function getRealTimePrices() {
  try {
    var cache = CacheService.getScriptCache();
    var now = new Date().getTime();
    
    // Get API call counter
    var apiCallCount = parseInt(cache.get(CACHE_PREFIX + 'apiCallCount') || '0');
    var lastResetDate = cache.get(CACHE_PREFIX + 'lastResetDate');
    
    // Reset counter on new month
    var currentMonth = new Date().getMonth();
    var storedMonth = lastResetDate ? new Date(parseInt(lastResetDate)).getMonth() : -1;
    if (currentMonth !== storedMonth) {
      apiCallCount = 0;
      cache.put(CACHE_PREFIX + 'lastResetDate', now.toString(), 2592000); // 30 days
      Logger.log('🔄 Monthly reset: API call counter reset to 0 (Plan: ' + API_PLAN + ', Quota: ' + API_QUOTA + ')');
    }
    
    // Try to get from cache first
    var cachedGold = cache.get(CACHE_PREFIX + 'goldPrice');
    var cachedBTC = cache.get(CACHE_PREFIX + 'btcPrice');
    var cacheTimestamp = cache.get(CACHE_PREFIX + 'priceTimestamp');
    
    if (cachedGold && cachedBTC && cacheTimestamp) {
      var age = (now - parseInt(cacheTimestamp)) / 1000;
      
      if (age < CACHE_DURATION_SECONDS) {
        Logger.log('📦 Using cached prices (age: ' + Math.round(age) + 's)');
        
        var goldData = JSON.parse(cachedGold);
        var btcData = JSON.parse(cachedBTC);
        
        return {
          gold: goldData,
          bitcoin: btcData,
          cached: true,
          age: Math.round(age),
          apiCallsThisMonth: apiCallCount,
          cacheIntervalSeconds: CACHE_DURATION_SECONDS,
          nextRefreshIn: Math.round(CACHE_DURATION_SECONDS - age)
        };
      }
    }
    
    // Check rate limit before fetching
    if (!checkRateLimit()) {
      Logger.log('⚠️ Rate limit hit, using fallback');
      var fallbackGold = getGoldPriceFallback();
      var fallbackBTC = getBTCPriceFallback();
      
      return {
        gold: fallbackGold,
        bitcoin: fallbackBTC,
        cached: false,
        age: 0,
        apiCallsThisMonth: apiCallCount,
        rateLimited: true
      };
    }
    
    // Fetch fresh prices
    Logger.log('🔄 Fetching fresh prices from APIs...');
    
    var goldPrice = getGoldPriceFromAPI();
    var btcPrice = getBTCPriceFromAPI();
    
    // Increment API call counter (only for successful Metals.Dev API calls)
    if (goldPrice.source === 'Metals.Dev') {
      apiCallCount++;
      cache.put(CACHE_PREFIX + 'apiCallCount', apiCallCount.toString(), 2592000); // 30 days
      Logger.log('📊 API calls this month: ' + apiCallCount + '/' + API_QUOTA);
      
      // บันทึกราคาปัจจุบันเป็นราคาก่อนหน้าสำหรับครั้งถัดไป
      cache.put(CACHE_PREFIX + 'prevGoldPrice', goldPrice.price.toString(), 86400); // 24 hours
    }
    
    // Save to cache
    cache.put(CACHE_PREFIX + 'goldPrice', JSON.stringify(goldPrice), CACHE_DURATION_SECONDS);
    cache.put(CACHE_PREFIX + 'btcPrice', JSON.stringify(btcPrice), CACHE_DURATION_SECONDS);
    cache.put(CACHE_PREFIX + 'priceTimestamp', now.toString(), CACHE_DURATION_SECONDS);
    
    // Save to history
    savePriceHistory(goldPrice.price, btcPrice.price);
    
    return {
      gold: goldPrice,
      bitcoin: btcPrice,
      cached: false,
      age: 0,
      apiCallsThisMonth: apiCallCount,
      cacheIntervalSeconds: CACHE_DURATION_SECONDS,
      nextRefreshIn: CACHE_DURATION_SECONDS
    };
    
  } catch(error) {
    Logger.log('❌ Error in getRealTimePrices: ' + error.toString());
    return {
      gold: getGoldPriceFallback(),
      bitcoin: getBTCPriceFallback(),
      cached: false,
      error: error.toString()
    };
  }
}

function getGoldPriceFromAPI() {
  try {
    Logger.log('Fetching gold price from Metals.Dev API...');
    
    var url = METALS_API_URL + '?api_key=' + METALS_API_KEY + '&currency=USD&unit=toz';
    
    var response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true
    });
    
    var responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      var data = JSON.parse(response.getContentText());
      
      // Metals.Dev API Structure:
      // {
      //   "status": "success",
      //   "metals": {
      //     "gold": 2655.50
      //   }
      // }
      
      if (data.status === 'success' && data.metals && data.metals.gold) {
        var price = parseFloat(data.metals.gold) || 0;
        
        // คำนวณ % change จากราคาก่อนหน้า
        var cache = CacheService.getScriptCache();
        var prevPrice = cache.get(CACHE_PREFIX + 'prevGoldPrice');
        var changePercent = 0;
        
        if (prevPrice && prevPrice !== 'null' && prevPrice !== '') {
          var prev = parseFloat(prevPrice);
          if (!isNaN(prev) && prev > 0) {
            changePercent = ((price - prev) / prev) * 100;
          }
        }
        
        Logger.log('✅ Gold price: $' + price + ' (' + changePercent.toFixed(2) + '%)');
        
        return {
          price: parseFloat(price.toFixed(2)),
          changePercent: parseFloat(changePercent.toFixed(2)),
          source: 'Metals.Dev',
          pointChange: 0
        };
      } else {
        Logger.log('⚠️ Invalid Metals.Dev API response structure');
        return getGoldPriceFallback();
      }
    } else {
      Logger.log('⚠️ Metals.Dev API error: ' + responseCode);
      return getGoldPriceFallback();
    }
  } catch(e) {
    Logger.log('❌ Metals.Dev API Error: ' + e.toString());
    return getGoldPriceFallback();
  }
}

function getGoldPriceFallback() {
  Logger.log('Using fallback gold price...');
  var baseGold = 2655.00;
  var randomMove = (Math.random() * 5) - 2.5;
  var randomPercent = (Math.random() * 0.5 - 0.25);
  return {
    price: parseFloat((baseGold + randomMove).toFixed(2)),
    changePercent: parseFloat(randomPercent.toFixed(2)),
    source: 'Fallback',
    pointChange: 0
  };
}

function getBTCPriceFromAPI() {
  try {
    var response = UrlFetchApp.fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot', {
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      var data = JSON.parse(response.getContentText());
      var randomPercent = (Math.random() * 2 - 1);
      return {
        price: parseFloat(data.data.amount),
        changePercent: parseFloat(randomPercent.toFixed(2)),
        source: 'Coinbase',
        pointChange: 0
      };
    }
  } catch(e) {
    Logger.log('BTC API Error: ' + e);
  }
  
  return getBTCPriceFallback();
}

function getBTCPriceFallback() {
  var randomPercent = (Math.random() * 2 - 1);
  return { 
    price: 98000, 
    changePercent: parseFloat(randomPercent.toFixed(2)), 
    source: 'Fallback',
    pointChange: 0
  };
}

function savePriceHistory(goldPrice, btcPrice) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('PriceHistory');
    if (sheet) {
      sheet.appendRow([new Date(), goldPrice, btcPrice]);
      if (sheet.getLastRow() > 101) {
        sheet.deleteRows(2, sheet.getLastRow() - 101);
      }
    }
  } catch(e) {
    Logger.log('Price history error: ' + e);
  }
}

function getPriceHistory(asset, limit) {
  try {
    limit = limit || 50;
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('PriceHistory');
    
    if (!sheet || sheet.getLastRow() < 2) return [];
    
    var lastRow = sheet.getLastRow();
    var startRow = Math.max(2, lastRow - limit + 1);
    var numRows = lastRow - startRow + 1;
    var data = sheet.getRange(startRow, 1, numRows, 3).getValues();
    var result = [];
    var colIndex = asset === 'GOLD' ? 1 : 2;
    
    for (var i = 0; i < data.length; i++) {
      result.push({
        time: data[i][0].getTime(),
        price: data[i][colIndex]
      });
    }
    
    return result;
  } catch(error) {
    Logger.log('Error getting price history: ' + error.toString());
    return [];
  }
}

// ===================================
// API STATS FUNCTIONS
// ===================================

function getAPIUsageStats() {
  var cache = CacheService.getScriptCache();
  
  var apiCallCount = parseInt(cache.get(CACHE_PREFIX + 'apiCallCount') || '0');
  var lastResetDate = cache.get(CACHE_PREFIX + 'lastResetDate');
  var cacheTimestamp = cache.get(CACHE_PREFIX + 'priceTimestamp');
  
  var now = new Date();
  var resetDate = lastResetDate ? new Date(parseInt(lastResetDate)) : now;
  var daysIntoMonth = Math.floor((now - resetDate) / (1000 * 60 * 60 * 24));
  
  var cacheAge = 0;
  var nextRefresh = CACHE_DURATION_SECONDS;
  
  if (cacheTimestamp) {
    cacheAge = Math.round((now.getTime() - parseInt(cacheTimestamp)) / 1000);
    nextRefresh = Math.max(0, CACHE_DURATION_SECONDS - cacheAge);
  }
  
  return {
    apiCallsThisMonth: apiCallCount,
    quotaRemaining: Math.max(0, 100 - apiCallCount),
    quotaUsedPercent: Math.min(100, Math.round((apiCallCount / 100) * 100)),
    daysIntoMonth: daysIntoMonth,
    cacheIntervalSeconds: CACHE_DURATION_SECONDS,
    cacheIntervalMinutes: Math.round(CACHE_DURATION_SECONDS / 60),
    currentCacheAge: cacheAge,
    nextRefreshIn: nextRefresh,
    estimatedCallsPerDay: daysIntoMonth > 0 ? Math.round(apiCallCount / daysIntoMonth) : 0,
    resetDate: resetDate.toISOString()
  };
}

function viewAPIStats() {
  Logger.clear();
  Logger.log('=== API Usage Statistics ===');
  Logger.log('');
  
  var stats = getAPIUsageStats();
  
  Logger.log('📊 Monthly Usage:');
  Logger.log('  API Calls: ' + stats.apiCallsThisMonth + ' / 100');
  Logger.log('  Remaining: ' + stats.quotaRemaining);
  Logger.log('  Used: ' + stats.quotaUsedPercent + '%');
  Logger.log('  Days into month: ' + stats.daysIntoMonth);
  Logger.log('  Avg calls/day: ' + stats.estimatedCallsPerDay);
  Logger.log('');
  
  Logger.log('⚙️ Cache Settings:');
  Logger.log('  Cache interval: ' + stats.cacheIntervalMinutes + ' minutes');
  Logger.log('  Current cache age: ' + stats.currentCacheAge + ' seconds');
  Logger.log('  Next refresh in: ' + stats.nextRefreshIn + ' seconds');
  Logger.log('');
  
  Logger.log('📅 Reset Date: ' + stats.resetDate);
  Logger.log('');
  
  // Status indicators
  if (stats.quotaUsedPercent < 50) {
    Logger.log('🟢 Status: GOOD - Plenty of quota remaining');
  } else if (stats.quotaUsedPercent < 80) {
    Logger.log('🟡 Status: WARNING - More than half quota used');
  } else if (stats.quotaUsedPercent < 100) {
    Logger.log('🟠 Status: CRITICAL - Nearly out of quota!');
  } else {
    Logger.log('🔴 Status: QUOTA EXCEEDED - Using fallback prices');
  }
  
  Logger.log('');
  
  // Recommendations
  if (stats.quotaUsedPercent > 70 && CACHE_DURATION_SECONDS < 600) {
    Logger.log('💡 Recommendation: Increase cache duration to 10 minutes');
    Logger.log('   Change: CACHE_DURATION_SECONDS = 600');
  }
  
  return stats;
}

function clearPriceCache() {
  var cache = CacheService.getScriptCache();
  cache.remove(CACHE_PREFIX + 'goldPrice');
  cache.remove(CACHE_PREFIX + 'btcPrice');
  cache.remove(CACHE_PREFIX + 'priceTimestamp');
  Logger.log('✅ Price cache cleared!');
  return { success: true, message: 'Cache cleared' };
}

function resetAPICounter() {
  var cache = CacheService.getScriptCache();
  cache.remove(CACHE_PREFIX + 'apiCallCount');
  cache.remove(CACHE_PREFIX + 'lastResetDate');
  Logger.log('✅ API counter reset');
  return { success: true, message: 'API counter reset to 0' };
}

function checkCacheStatus() {
  var cache = CacheService.getScriptCache();
  var now = new Date().getTime();
  
  var cachedGold = cache.get(CACHE_PREFIX + 'goldPrice');
  var cachedBTC = cache.get(CACHE_PREFIX + 'btcPrice');
  var cacheTimestamp = cache.get(CACHE_PREFIX + 'priceTimestamp');
  
  Logger.clear();
  Logger.log('=== Price Cache Status ===');
  
  if (!cachedGold || !cachedBTC || !cacheTimestamp) {
    Logger.log('❌ No cache found');
    return { cached: false };
  }
  
  var age = (now - parseInt(cacheTimestamp)) / 1000;
  var remaining = CACHE_DURATION_SECONDS - age;
  
  Logger.log('✅ Cache exists');
  Logger.log('Age: ' + Math.round(age) + ' seconds');
  Logger.log('Remaining: ' + Math.round(remaining) + ' seconds');
  
  if (age < CACHE_DURATION_SECONDS) {
    Logger.log('🟢 Cache is VALID');
    var gold = JSON.parse(cachedGold);
    Logger.log('Gold: $' + gold.price + ' (' + gold.changePercent + '%)');
  } else {
    Logger.log('🟡 Cache is EXPIRED');
  }
  
  return {
    cached: true,
    age: Math.round(age),
    remaining: Math.round(remaining),
    valid: age < CACHE_DURATION_SECONDS
  };
}

function testGoldAPI() {
  Logger.clear();
  Logger.log('=== Testing Gold API ===');
  Logger.log('API Key: ' + GOLD_API_KEY);
  Logger.log('API URL: ' + GOLD_API_URL);
  
  var goldPrice = getGoldPriceFromAPI();
  
  Logger.log('=== Result ===');
  Logger.log('Price: $' + goldPrice.price);
  Logger.log('Change: ' + goldPrice.changePercent + '%');
  Logger.log('Source: ' + goldPrice.source);
  
  if (goldPrice.source === 'Gold API') {
    Logger.log('✅ SUCCESS! Gold API is working!');
  } else {
    Logger.log('⚠️ WARNING! Using fallback price.');
  }
  
  return goldPrice;
}

// ===================================
// LINE MESSAGING
// ===================================

function sendLinePushMessage(message) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var configSheet = ss.getSheetByName('Config');
    
    var channelAccessToken = LINE_CHANNEL_ACCESS_TOKEN;
    var userId = LINE_USER_ID;
    var groupId = '';
    
    if (configSheet) {
      var configData = configSheet.getDataRange().getValues();
      for(var i = 0; i < configData.length; i++) {
        if(configData[i][0] === 'LINEChannelAccessToken' && configData[i][1]) {
          channelAccessToken = configData[i][1];
        }
        if(configData[i][0] === 'LINEUserId' && configData[i][1]) {
          userId = configData[i][1];
        }
        if(configData[i][0] === 'LINEGroupId' && configData[i][1]) {
          groupId = configData[i][1];
        }
      }
    }
    
    if (!channelAccessToken || channelAccessToken === '') {
      Logger.log('LINE Channel Access Token not configured');
      return false;
    }
    
    var recipients = [];
    if (userId && userId !== '') recipients.push(userId);
    if (groupId && groupId !== '') recipients.push(groupId);
    
    if (recipients.length === 0) {
      Logger.log('No LINE User ID or Group ID configured');
      return false;
    }
    
    var success = true;
    recipients.forEach(function(recipientId) {
      try {
        var url = 'https://api.line.me/v2/bot/message/push';
        var payload = {
          to: recipientId,
          messages: [{ type: 'text', text: message }]
        };
        var options = {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + channelAccessToken
          },
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        };
        
        var response = UrlFetchApp.fetch(url, options);
        if (response.getResponseCode() !== 200) {
          Logger.log('LINE failed to ' + recipientId);
          success = false;
        }
      } catch(e) {
        Logger.log('LINE error: ' + e);
        success = false;
      }
    });
    
    return success;
  } catch(error) {
    Logger.log('Error in sendLinePushMessage: ' + error.toString());
    return false;
  }
}

function sendLineNotify(message) {
  return sendLinePushMessage(message);
}

// ===================================
// TRADE MANAGEMENT
// ===================================

function saveTrade(form) {
  try {
    Logger.log('Saving trade: ' + JSON.stringify(form));
    
    // Validate input
    var validation = validateTradeInput(form);
    if (!validation.isValid) {
      Logger.log('❌ Validation failed: ' + validation.errors.join(', '));
      return {
        success: false,
        error: 'Validation failed: ' + validation.errors.join(', ')
      };
    }
    
    // Sanitize inputs
    form.notes = sanitizeString(form.notes);
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('Trades');
    
    if(!sheet) { 
      setupSheets(); 
      sheet = ss.getSheetByName('Trades'); 
    }
    
    if (form.action === 'CLOSE') {
      return closeExistingTrade(sheet, form);
    }
    
    var timestamp = new Date();
    var tradeId = 'TX-' + Math.floor(timestamp.getTime() / 1000).toString().substr(-5);
    var status = (form.exitPrice && form.exitPrice.toString().trim() !== "") ? 'CLOSED' : 'OPEN';
    var swap = parseFloat(form.swap) || 0;
    var pl = "";
    var percent = "";
    var duration = "";
    
    if (status === 'CLOSED') {
      var result = calculatePL(form.asset, form.type, form.entryPrice, form.exitPrice, form.lots, swap);
      pl = result.pl;
      percent = result.percent;
      
      if (form.entryTime && form.exitTime) {
        var entryDate = new Date(form.entryTime);
        var exitDate = new Date(form.exitTime);
        var diffMs = exitDate - entryDate;
        var diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        var diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        duration = diffHours + 'h ' + diffMins + 'm';
      }
    }
    
    sheet.appendRow([
      timestamp, tradeId, form.asset, form.type, status,
      form.entryPrice, form.exitPrice || '', form.lots, swap,
      pl, percent, form.entryTime, form.exitTime || '', duration, form.notes
    ]);
    
    SpreadsheetApp.flush();
    
    // LINE notification
    try {
      var emoji = form.type.includes('BUY') ? '📈' : '📉';
      var statusEmoji = status === 'CLOSED' ? '✅' : '🔔';
      var notifyMsg = statusEmoji + ' FX Aloofpea Trade\n\n' +
                      'Order: ' + tradeId + '\n' +
                      'Asset: ' + form.asset + ' ' + emoji + '\n' +
                      'Type: ' + form.type + '\n' +
                      'Status: ' + status + '\n' +
                      'Entry: $' + parseFloat(form.entryPrice).toFixed(2) + '\n' +
                      'Lots: ' + form.lots;
      
      if (status === 'CLOSED') {
        var plNum = parseFloat(pl);
        var plEmoji = plNum >= 0 ? '💰' : '📉';
        notifyMsg += '\nExit: $' + parseFloat(form.exitPrice).toFixed(2) + '\n' +
                     'P/L: ' + plEmoji + ' $' + pl + ' (' + percent + '%)' + '\n' +
                     'Duration: ' + duration;
      }
      
      if (form.notes) notifyMsg += '\nNote: ' + form.notes;
      sendLineNotify(notifyMsg);
    } catch(lineError) {
      Logger.log('LINE notification failed: ' + lineError);
    }
    
    Logger.log('✅ Trade saved successfully: ' + tradeId);
    return { success: true, tradeId: tradeId };
    
  } catch(error) {
    Logger.log('❌ ERROR saving trade: ' + error.toString());
    return { 
      success: false, 
      error: error.toString(),
      stack: error.stack
    };
  }
}

function closeExistingTrade(sheet, form) {
  try {
    var data = sheet.getDataRange().getValues();
    var rowIndex = -1;
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] === form.tradeId) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 5).setValue('CLOSED');
      sheet.getRange(rowIndex, 7).setValue(form.exitPrice);
      
      var exitTime = new Date();
      sheet.getRange(rowIndex, 13).setValue(exitTime.toISOString().slice(0, 16).replace('T', ' ')); 

      var rowData = sheet.getRange(rowIndex, 1, 1, 15).getValues()[0];
      var swap = parseFloat(rowData[8] || 0);
      var result = calculatePL(rowData[2], rowData[3], rowData[5], form.exitPrice, rowData[7], swap);
      
      sheet.getRange(rowIndex, 10).setValue(result.pl);
      sheet.getRange(rowIndex, 11).setValue(result.percent);
      
      var entryTime = new Date(rowData[11]);
      var diffMs = exitTime - entryTime;
      var diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      var diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      var duration = diffHours + 'h ' + diffMins + 'm';
      sheet.getRange(rowIndex, 14).setValue(duration);
      
      SpreadsheetApp.flush();
      
      var plNum = parseFloat(result.pl);
      var plEmoji = plNum >= 0 ? '💰' : '📉';
      var notifyMsg = '✅ Order Closed\n\n' +
                      'ID: ' + form.tradeId + '\n' +
                      'Asset: ' + rowData[2] + '\n' +
                      'Type: ' + rowData[3] + '\n' +
                      'Entry: $' + parseFloat(rowData[5]).toFixed(2) + '\n' +
                      'Exit: $' + parseFloat(form.exitPrice).toFixed(2) + '\n' +
                      'P/L: ' + plEmoji + ' $' + result.pl + ' (' + result.percent + '%)' + '\n' +
                      'Duration: ' + duration;
      
      sendLineNotify(notifyMsg);
      return { success: true };
    }
    return { success: false, error: 'Trade not found' };
  } catch(error) {
    Logger.log('Error closing trade: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

function calculatePL(asset, type, entry, exit, lots, swap) {
  var contractSize = 100000;
  if (asset.includes('XAU')) contractSize = 100;
  if (asset.includes('BTC')) contractSize = 1;
  
  entry = parseFloat(entry);
  exit = parseFloat(exit);
  lots = parseFloat(lots);
  swap = parseFloat(swap) || 0;
  
  var diff = type.includes('BUY') ? (exit - entry) : (entry - exit);
  var netProfit = (diff * lots * contractSize) + swap;
  var percent = (diff / entry) * 100;
  
  return { pl: netProfit.toFixed(2), percent: percent.toFixed(2) };
}

function getTradeById(tradeId) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('Trades');
    
    if (!sheet || sheet.getLastRow() < 2) {
      return { success: false, error: 'No trades found' };
    }
    
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] === tradeId) {
        var entryTime = data[i][11];
        var exitTime = data[i][12];
        
        if (entryTime && entryTime instanceof Date) {
          entryTime = Utilities.formatDate(entryTime, Session.getScriptTimeZone(), 'yyyy-MM-dd\'T\'HH:mm');
        }
        if (exitTime && exitTime instanceof Date) {
          exitTime = Utilities.formatDate(exitTime, Session.getScriptTimeZone(), 'yyyy-MM-dd\'T\'HH:mm');
        }
        
        return {
          success: true,
          trade: {
            id: data[i][1],
            asset: data[i][2],
            type: data[i][3],
            status: data[i][4],
            entryPrice: data[i][5],
            exitPrice: data[i][6] || '',
            lots: data[i][7],
            swap: data[i][8] || 0,
            entryTime: entryTime || '',
            exitTime: exitTime || '',
            notes: data[i][14] || ''
          }
        };
      }
    }
    
    return { success: false, error: 'Trade not found' };
  } catch(error) {
    return { success: false, error: error.toString() };
  }
}

function updateTrade(tradeId, formData) {
  try {
    // Validate input
    var validation = validateTradeInput(formData);
    if (!validation.isValid) {
      return {
        success: false,
        error: 'Validation failed: ' + validation.errors.join(', ')
      };
    }
    
    // Sanitize inputs
    formData.notes = sanitizeString(formData.notes);
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('Trades');
    
    if (!sheet) return { success: false, error: 'Trades sheet not found' };
    
    var data = sheet.getDataRange().getValues();
    var rowIndex = -1;
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] === tradeId) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) return { success: false, error: 'Trade not found' };
    
    var status = (formData.exitPrice && formData.exitPrice.toString().trim() !== "") ? 'CLOSED' : 'OPEN';
    var swap = parseFloat(formData.swap) || 0;
    var pl = "";
    var percent = "";
    var duration = "";
    
    if (status === 'CLOSED') {
      var result = calculatePL(formData.asset, formData.type, formData.entryPrice, formData.exitPrice, formData.lots, swap);
      pl = result.pl;
      percent = result.percent;
      
      if (formData.entryTime && formData.exitTime) {
        var entryDate = new Date(formData.entryTime);
        var exitDate = new Date(formData.exitTime);
        var diffMs = exitDate - entryDate;
        var diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        var diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        duration = diffHours + 'h ' + diffMins + 'm';
      }
    }
    
    var timestamp = new Date();
    sheet.getRange(rowIndex, 1).setValue(timestamp);
    sheet.getRange(rowIndex, 3).setValue(formData.asset);
    sheet.getRange(rowIndex, 4).setValue(formData.type);
    sheet.getRange(rowIndex, 5).setValue(status);
    sheet.getRange(rowIndex, 6).setValue(formData.entryPrice);
    sheet.getRange(rowIndex, 7).setValue(formData.exitPrice || '');
    sheet.getRange(rowIndex, 8).setValue(formData.lots);
    sheet.getRange(rowIndex, 9).setValue(swap);
    sheet.getRange(rowIndex, 10).setValue(pl);
    sheet.getRange(rowIndex, 11).setValue(percent);
    sheet.getRange(rowIndex, 12).setValue(formData.entryTime);
    sheet.getRange(rowIndex, 13).setValue(formData.exitTime || '');
    sheet.getRange(rowIndex, 14).setValue(duration);
    sheet.getRange(rowIndex, 15).setValue(formData.notes);
    
    SpreadsheetApp.flush();
    
    try {
      var emoji = formData.type.includes('BUY') ? '📈' : '📉';
      var notifyMsg = '✏️ Trade Updated\n\n' +
                      'Order: ' + tradeId + '\n' +
                      'Asset: ' + formData.asset + ' ' + emoji + '\n' +
                      'Type: ' + formData.type + '\n' +
                      'Status: ' + status + '\n' +
                      'Entry: $' + parseFloat(formData.entryPrice).toFixed(2) + '\n' +
                      'Lots: ' + formData.lots;
      
      if (status === 'CLOSED' && pl) {
        var plNum = parseFloat(pl);
        var plEmoji = plNum >= 0 ? '💰' : '📉';
        notifyMsg += '\nExit: $' + parseFloat(formData.exitPrice).toFixed(2) + '\n' +
                     'P/L: ' + plEmoji + ' $' + pl + ' (' + percent + '%)' + '\n' +
                     'Duration: ' + duration;
      }
      
      if (formData.notes) notifyMsg += '\nNote: ' + formData.notes;
      sendLineNotify(notifyMsg);
    } catch(lineError) {
      Logger.log('LINE notification failed: ' + lineError);
    }
    
    return { success: true, tradeId: tradeId };
    
  } catch(error) {
    Logger.log('❌ ERROR updating trade: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

// ===================================
// PORTFOLIO DATA
// ===================================

function getPortfolioData() {
  try {
    Logger.log('=== getPortfolioData v2.5.2 ===');
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var tradesSheet = ss.getSheetByName('Trades');
    var configSheet = ss.getSheetByName('Config');
    
    if (!tradesSheet || !configSheet) {
      setupSheets();
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      tradesSheet = ss.getSheetByName('Trades');
      configSheet = ss.getSheetByName('Config');
    }
    
    // Read Config
    var capital = 500;
    var credit = 0;
    var goalDaily = 10;
    var goalMonthly = 300;
    var goalYearly = 3600;
    var profitAlertThreshold = 100;
    var lineChannelAccessToken = '';
    var lineUserId = '';
    var lineGroupId = '';
    
    if (configSheet && configSheet.getLastRow() > 1) {
      var configData = configSheet.getDataRange().getValues();
      for(var i = 1; i < configData.length; i++) {
        var key = String(configData[i][0]);
        var val = configData[i][1];
        
        if(key === 'TotalCapital') capital = Number(val) || 500;
        if(key === 'TotalCredit') credit = Number(val) || 0;
        if(key === 'GoalDaily') goalDaily = Number(val) || 10;
        if(key === 'GoalMonthly') goalMonthly = Number(val) || 300;
        if(key === 'GoalYearly') goalYearly = Number(val) || 3600;
        if(key === 'ProfitAlertThreshold') profitAlertThreshold = Number(val) || 100;
        if(key === 'LINEChannelAccessToken') lineChannelAccessToken = String(val || '');
        if(key === 'LINEUserId') lineUserId = String(val || '');
        if(key === 'LINEGroupId') lineGroupId = String(val || '');
      }
    }
    
    // Read Trades
    var realizedPL = 0;
    var openTrades = [];
    var historyTrades = [];
    
    if (tradesSheet && tradesSheet.getLastRow() > 1) {
      var lastRow = tradesSheet.getLastRow();
      var data = tradesSheet.getRange(2, 1, lastRow - 1, 15).getValues();
      
      for (var i = 0; i < data.length; i++) {
        var r = data[i];
        if (!r[1] || String(r[1]) === '') continue;
        
        var status = 'OPEN';
        if (r[4]) {
          var statusStr = String(r[4]).trim().toUpperCase();
          if (statusStr === 'CLOSED') status = 'CLOSED';
        }
        
        var pl = Number(r[9]) || 0;
        
        var tradeObj = {
          id: String(r[1]),
          asset: String(r[2] || ''),
          type: String(r[3] || ''),
          status: status,
          entry: Number(r[5]) || 0,
          exit: r[6] ? Number(r[6]) : 0,
          lots: Number(r[7]) || 0,
          swap: Number(r[8]) || 0,
          pl: pl,
          percent: String(r[10] || '0'),
          time: r[0] ? new Date(r[0]).toISOString() : new Date().toISOString(),
          entryTime: r[11] ? new Date(r[11]).toISOString() : new Date().toISOString(),
          exitTime: r[12] ? new Date(r[12]).toISOString() : '',
          duration: String(r[13] || ''),
          notes: String(r[14] || '')
        };
        
        if (status === 'CLOSED') {
          realizedPL += pl;
          historyTrades.push(tradeObj);
        } else {
          openTrades.push(tradeObj);
        }
      }
    }
    
    var balance = capital + credit + realizedPL;
    
    Logger.log('✅ Portfolio loaded - Balance: ' + balance + ', Open: ' + openTrades.length + ', History: ' + historyTrades.length);
    
    return {
      balance: Number(balance),
      realizedPL: Number(realizedPL),
      open: openTrades,
      history: historyTrades,
      config: {
        capital: Number(capital),
        credit: Number(credit),
        goalDaily: Number(goalDaily),
        goalMonthly: Number(goalMonthly),
        goalYearly: Number(goalYearly),
        profitAlertThreshold: Number(profitAlertThreshold),
        lineChannelAccessToken: String(lineChannelAccessToken),
        lineUserId: String(lineUserId),
        lineGroupId: String(lineGroupId)
      }
    };
    
  } catch(error) {
    Logger.log('❌ ERROR in getPortfolioData: ' + error.toString());
    return {
      balance: 500,
      realizedPL: 0,
      open: [],
      history: [],
      config: {
        capital: 500,
        credit: 0,
        goalDaily: 10,
        goalMonthly: 300,
        goalYearly: 3600,
        profitAlertThreshold: 100,
        lineChannelAccessToken: '',
        lineUserId: '',
        lineGroupId: ''
      },
      error: error.toString()
    };
  }
}

// ===================================
// SETTINGS
// ===================================

function updateSettings(data) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('Config');
    if(!sheet) {
      setupSheets();
      sheet = ss.getSheetByName('Config');
    }
    
    var configData = sheet.getDataRange().getValues();
    var map = {};
    for(var i = 0; i < configData.length; i++) {
      map[configData[i][0]] = i + 1;
    }
    
    function setVal(key, val) {
      if(map[key]) {
        sheet.getRange(map[key], 2).setValue(val);
      } else {
        sheet.appendRow([key, val]);
        map[key] = sheet.getLastRow();
      }
    }
    
    setVal('TotalCapital', data.capital);
    setVal('TotalCredit', data.credit);
    setVal('GoalDaily', data.goalDaily);
    setVal('GoalMonthly', data.goalMonthly);
    setVal('GoalYearly', data.goalYearly);
    setVal('ProfitAlertThreshold', data.profitAlertThreshold || 100);
    setVal('LINEChannelAccessToken', data.lineChannelAccessToken || '');
    setVal('LINEUserId', data.lineUserId || '');
    setVal('LINEGroupId', data.lineGroupId || '');
    
    SpreadsheetApp.flush();
    Logger.log('✅ Settings updated successfully');
    return { success: true };
  } catch(error) {
    Logger.log('❌ Error updating settings: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

// ===================================
// WITHDRAWAL SYSTEM
// ===================================

function processWithdrawal(amount, method, note) {
  try {
    Logger.log('💰 Processing withdrawal: $' + amount + ' via ' + method);
    
    // Validate amount
    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: 'Invalid withdrawal amount' };
    }
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var configSheet = ss.getSheetByName('Config');
    var withdrawalSheet = ss.getSheetByName('Withdrawals');
    
    // Create Withdrawals sheet if not exists
    if (!withdrawalSheet) {
      withdrawalSheet = ss.insertSheet('Withdrawals');
      withdrawalSheet.getRange('A1:G1').setValues([[
        'Timestamp', 'Amount', 'Method', 'Note', 'Balance Before', 'Balance After', 'Status'
      ]]);
      withdrawalSheet.getRange('A1:G1').setFontWeight('bold');
    }
    
    // Get current balance
    var configData = configSheet.getRange('A2:B10').getValues();
    var configMap = {};
    configData.forEach(function(row) {
      if (row[0]) configMap[row[0]] = row[1];
    });
    
    var capital = parseFloat(configMap['TotalCapital']) || 0;
    var credit = parseFloat(configMap['TotalCredit']) || 0;
    
    // Calculate realized P/L from history
    var historySheet = ss.getSheetByName('History');
    var realizedPL = 0;
    
    if (historySheet) {
      var historyData = historySheet.getDataRange().getValues();
      for (var i = 1; i < historyData.length; i++) {
        if (historyData[i][0]) {
          var pl = parseFloat(historyData[i][8]) || 0;
          realizedPL += pl;
        }
      }
    }
    
    var currentBalance = capital + credit + realizedPL;
    
    // Check if sufficient balance
    if (amount > currentBalance) {
      return { 
        success: false, 
        error: 'Insufficient balance. Available: $' + currentBalance.toFixed(2) 
      };
    }
    
    // Process withdrawal by reducing capital
    var newCapital = capital - amount;
    if (newCapital < 0) {
      // If capital goes negative, adjust credit
      credit += newCapital;
      newCapital = 0;
    }
    
    var newBalance = newCapital + credit + realizedPL;
    
    // Update config
    for (var i = 0; i < configData.length; i++) {
      if (configData[i][0] === 'TotalCapital') {
        configSheet.getRange('B' + (i + 2)).setValue(newCapital);
      }
      if (configData[i][0] === 'TotalCredit') {
        configSheet.getRange('B' + (i + 2)).setValue(credit);
      }
    }
    
    // Record withdrawal
    var timestamp = new Date();
    var methodName = method === 'bank' ? 'Bank Transfer' : 
                     method === 'wallet' ? 'E-Wallet' : 
                     method === 'crypto' ? 'Cryptocurrency' : method;
    
    withdrawalSheet.appendRow([
      timestamp,
      amount,
      methodName,
      note || '',
      currentBalance,
      newBalance,
      'Completed'
    ]);
    
    Logger.log('✅ Withdrawal successful. New balance: $' + newBalance);
    
    // Send LINE notification if configured
    sendWithdrawalNotification(amount, methodName, newBalance);
    
    return {
      success: true,
      amount: amount,
      method: methodName,
      balanceBefore: currentBalance,
      newBalance: newBalance
    };
    
  } catch(e) {
    Logger.log('❌ Withdrawal error: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

function sendWithdrawalNotification(amount, method, newBalance) {
  try {
    var configSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Config');
    if (!configSheet) return;
    
    var configData = configSheet.getRange('A2:B10').getValues();
    var configMap = {};
    configData.forEach(function(row) {
      if (row[0]) configMap[row[0]] = row[1];
    });
    
    var token = configMap['LINEChannelAccessToken'];
    var userId = configMap['LINEUserId'];
    
    if (!token || !userId) return;
    
    var message = '💰 Withdrawal Processed\n\n' +
                  'Amount: $' + amount.toFixed(2) + '\n' +
                  'Method: ' + method + '\n' +
                  'New Balance: $' + newBalance.toFixed(2) + '\n' +
                  'Time: ' + new Date().toLocaleString();
    
    sendLineNotification(token, userId, message);
    
  } catch(e) {
    Logger.log('LINE notification error: ' + e.toString());
  }
}

function getWithdrawalHistory() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var withdrawalSheet = ss.getSheetByName('Withdrawals');
    
    if (!withdrawalSheet) {
      return [];
    }
    
    var data = withdrawalSheet.getDataRange().getValues();
    var withdrawals = [];
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) {
        withdrawals.push({
          timestamp: data[i][0],
          amount: data[i][1],
          method: data[i][2],
          note: data[i][3],
          balanceBefore: data[i][4],
          balanceAfter: data[i][5],
          status: data[i][6]
        });
      }
    }
    
    return withdrawals.reverse(); // ล่าสุดก่อน
    
  } catch(e) {
    Logger.log('Error getting withdrawal history: ' + e.toString());
    return [];
  }
}

// ===================================
// AI NEWS ANALYSIS (ANTHROPIC CLAUDE)
// ===================================

function analyzeMarketNews(asset, period) {
  try {
    Logger.log('🤖 Analyzing ' + asset + ' news (' + period + ') with Claude...');
    
    var assetName = asset === 'GOLD' ? 'Gold (XAU/USD)' : 'Bitcoin (BTC/USD)';
    var periodName = period === 'daily' ? 'Today / Past 24 Hours' : 'This Week / Past 7 Days';
    
    // Get current price from Metals.Dev API
    var currentPrice = 0;
    try {
      var priceData = getPriceFromMetalsDev();
      if (asset === 'GOLD' && priceData.gold) {
        currentPrice = priceData.gold;
      } else if (asset === 'BTC' && priceData.btc) {
        currentPrice = priceData.btc;
      }
    } catch(e) {
      Logger.log('⚠️ Could not fetch current price: ' + e.toString());
    }
    
    var currentDate = new Date();
    var dateStr = currentDate.toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
    
    var priceContext = currentPrice > 0 ? 
      '\n📊 Current Market Data (Real-time):\n' +
      '• Price: $' + currentPrice.toFixed(2) + '\n' +
      '• Date: ' + dateStr + '\n' +
      '• Source: Metals.Dev API\n' :
      '\nNote: Current real-time price data is not available.\n';
    
    // Create prompt for Claude with clear context
    var prompt = 
      '📅 ANALYSIS CONTEXT & REFERENCE PERIOD\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      '🤖 AI Knowledge Base Information:\n' +
      '• Training Data: Up to January 2025\n' +
      '• Knowledge Cutoff: January 31, 2025\n' +
      '• Analysis Date: ' + dateStr + '\n' +
      '• Time Gap: ~' + Math.round((currentDate - new Date('2025-01-31')) / (1000 * 60 * 60 * 24)) + ' days since knowledge cutoff\n\n' +
      '⚠️ IMPORTANT LIMITATIONS:\n' +
      '• No internet access or real-time news feeds\n' +
      '• Cannot access events after January 2025\n' +
      '• This is a FRAMEWORK-BASED analysis, not news reporting\n\n' +
      priceContext + '\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
      'Based on typical market dynamics and principles (as of January 2025 knowledge), provide a trading framework for ' + assetName + '.\n\n' +
      'YOUR RESPONSE MUST START WITH:\n' +
      '"📅 Reference Period: January 2025 and earlier\n' +
      '⚠️ Note: This analysis is based on general market principles and AI training data up to January 2025. Not real-time news.\n\n"\n\n' +
      'Then provide:\n\n' +
      '1. Key Market Factors (General Framework)\n' +
      'Explain typical factors that affect ' + assetName + ' (Fed policy, inflation, geopolitics, etc.)\n\n' +
      '2. Technical Analysis Guide\n' +
      'Based on current price $' + currentPrice.toFixed(2) + ', suggest:\n' +
      '• Potential support levels (e.g., $' + (currentPrice * 0.98).toFixed(2) + ', $' + (currentPrice * 0.96).toFixed(2) + ')\n' +
      '• Potential resistance levels (e.g., $' + (currentPrice * 1.02).toFixed(2) + ', $' + (currentPrice * 1.04).toFixed(2) + ')\n' +
      '• Key technical indicators to watch\n\n' +
      '3. Market Sentiment Indicators\n' +
      'Describe how to assess market sentiment for ' + assetName + '\n\n' +
      '4. Trading Strategy Framework\n' +
      'Provide general trading principles and risk management for ' + assetName + '\n\n' +
      '5. Risk Factors Checklist\n' +
      'List common risks traders should monitor\n\n' +
      'Format clearly with headers. 800-1000 words total.';
    
    // Call Claude API - Using Claude 3 Haiku (basic model available for ALL accounts)
    var apiUrl = 'https://api.anthropic.com/v1/messages';
    
    var payload = {
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    };
    
    var options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    Logger.log('Calling Claude API with Haiku (basic model)...');
    Logger.log('Model: claude-3-haiku-20240307');
    Logger.log('Current Price: $' + currentPrice);
    Logger.log('Analysis Date: ' + dateStr);
    
    var response = UrlFetchApp.fetch(apiUrl, options);
    var responseCode = response.getResponseCode();
    var responseText = response.getContentText();
    
    Logger.log('API Response Code: ' + responseCode);
    
    if (responseCode === 200) {
      var data = JSON.parse(responseText);
      
      if (data.content && data.content.length > 0) {
        var analysis = data.content[0].text;
        
        Logger.log('✅ AI Analysis completed');
        Logger.log('Response length: ' + analysis.length + ' characters');
        
        // Add metadata header to analysis
        var analysisWithMetadata = 
          '📊 CURRENT MARKET DATA\n' +
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
          '📈 Live Price: $' + currentPrice.toFixed(2) + '\n' +
          '📅 Analysis Date: ' + dateStr + '\n' +
          '🤖 AI Model: Claude 3 Haiku\n' +
          '📚 AI Knowledge Cutoff: January 31, 2025\n' +
          '⚠️ Data Source: Training data + Current price from API\n' +
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
          analysis;
        
        // Save to cache for 1 hour
        var cache = CacheService.getScriptCache();
        var cacheKey = 'ai_analysis_' + asset + '_' + period;
        cache.put(cacheKey, analysisWithMetadata, 3600);
        
        return {
          success: true,
          asset: assetName,
          period: period,
          analysis: analysisWithMetadata,
          currentPrice: currentPrice,
          analysisDate: dateStr,
          knowledgeCutoff: 'January 31, 2025',
          model: 'Claude 3 Haiku',
          timestamp: new Date().toISOString()
        };
      } else {
        Logger.log('⚠️ No content in response');
        return {
          success: false,
          error: 'No analysis content generated. Please try again.'
        };
      }
    } else {
      Logger.log('❌ Claude API error: ' + responseCode);
      Logger.log('Error response: ' + responseText);
      
      try {
        var errorData = JSON.parse(responseText);
        var errorMsg = 'Unknown error';
        
        if (errorData.error) {
          if (errorData.error.message) {
            errorMsg = errorData.error.message;
          } else if (errorData.error.type) {
            errorMsg = errorData.error.type;
          }
        }
        
        // Provide helpful error messages
        if (responseCode === 401) {
          errorMsg = 'Invalid API key. Please check your Claude API key.';
        } else if (responseCode === 429) {
          errorMsg = 'Rate limit exceeded. Please wait a moment and try again.';
        } else if (responseCode === 400 && errorMsg.includes('credit')) {
          errorMsg = 'Insufficient credits. Please add credits at console.anthropic.com';
        }
        
        return {
          success: false,
          error: 'API Error (' + responseCode + '): ' + errorMsg
        };
      } catch(e) {
        return {
          success: false,
          error: 'API Error (' + responseCode + '): Failed to parse error. ' + responseText.substring(0, 200)
        };
      }
    }
    
  } catch(e) {
    Logger.log('❌ AI Analysis error: ' + e.toString());
    return {
      success: false,
      error: 'System Error: ' + e.toString() + '. Please check logs for details.'
    };
  }
}

function translateAnalysisToThai(englishText) {
  try {
    Logger.log('🌐 Translating analysis to Thai...');
    
    // Check cache first
    var cache = CacheService.getScriptCache();
    var cacheKey = 'translation_' + Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, englishText).toString();
    var cached = cache.get(cacheKey);
    
    if (cached) {
      Logger.log('✅ Using cached translation');
      return {
        success: true,
        translation: cached,
        cached: true
      };
    }
    
    var prompt = 
      'แปลข้อความภาษาอังกฤษต่อไปนี้เป็นภาษาไทยอย่างเป็นธรรมชาติและถูกต้อง โดยรักษาโครงสร้างและรูปแบบเดิมไว้ รวมทั้งคงหัวข้อ ตัวเลข และเครื่องหมายต่างๆ ไว้เหมือนเดิม:\n\n' +
      englishText;
    
    var apiUrl = 'https://api.anthropic.com/v1/messages';
    
    var payload = {
      model: 'claude-3-haiku-20240307',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    };
    
    var options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    Logger.log('Calling Claude API for translation...');
    
    var response = UrlFetchApp.fetch(apiUrl, options);
    var responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      var data = JSON.parse(response.getContentText());
      
      if (data.content && data.content.length > 0) {
        var translation = data.content[0].text;
        
        Logger.log('✅ Translation completed');
        
        // Cache for 24 hours
        cache.put(cacheKey, translation, 86400);
        
        return {
          success: true,
          translation: translation,
          cached: false
        };
      } else {
        return {
          success: false,
          error: 'No translation generated'
        };
      }
    } else {
      var errorText = response.getContentText();
      Logger.log('❌ Translation API error: ' + responseCode);
      Logger.log('Error: ' + errorText);
      
      return {
        success: false,
        error: 'Translation failed (Code ' + responseCode + ')'
      };
    }
    
  } catch(e) {
    Logger.log('❌ Translation error: ' + e.toString());
    return {
      success: false,
      error: 'Translation error: ' + e.toString()
    };
  }
}

function getCachedAnalysis(asset, period) {
  try {
    var cache = CacheService.getScriptCache();
    var cacheKey = 'ai_analysis_' + asset + '_' + period;
    var cached = cache.get(cacheKey);
    
    if (cached) {
      Logger.log('📦 Using cached analysis');
      return {
        success: true,
        asset: asset === 'GOLD' ? 'Gold (XAU/USD)' : 'Bitcoin (BTC/USD)',
        period: period,
        analysis: cached,
        cached: true,
        timestamp: new Date().toISOString()
      };
    }
    
    return null;
  } catch(e) {
    Logger.log('Error getting cached analysis: ' + e);
    return null;
  }
}

function getAIAnalysis(asset, period) {
  // Check cache first
  var cached = getCachedAnalysis(asset, period);
  if (cached) {
    return cached;
  }
  
  // Generate new analysis
  return analyzeMarketNews(asset, period);
}

function initializeSystem() {
  try {
    Logger.log('Initializing system...');
    setupSheets();
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var configSheet = ss.getSheetByName('Config');
    
    if (configSheet) {
      configSheet.getRange('A2:B10').setValues([
        ['TotalCapital', 500],
        ['TotalCredit', 0],
        ['GoalDaily', 10],
        ['GoalMonthly', 300],
        ['GoalYearly', 3600],
        ['ProfitAlertThreshold', 100],
        ['LINEChannelAccessToken', ''],
        ['LINEUserId', ''],
        ['LINEGroupId', '']
      ]);
    }
    
    var data = getPortfolioData();
    Logger.log('✅ System initialized. Balance: $' + data.balance);
    
    return { success: true, message: 'System initialized', data: data };
  } catch(error) {
    Logger.log('❌ Error initializing system: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

// ===================================
// MT4/MT5 IMPORT FUNCTIONS
// ===================================

function importMT4Trades(trades) {
  try {
    Logger.log('📥 Starting MT4/MT5 import: ' + trades.length + ' trades');
    Logger.log('Sample trade: ' + JSON.stringify(trades[0])); // Log first trade
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    Logger.log('✅ Spreadsheet opened: ' + SPREADSHEET_ID);
    
    var historySheet = ss.getSheetByName('History');
    
    // Create History sheet if not exists
    if (!historySheet) {
      Logger.log('⚠️ History sheet not found, creating...');
      historySheet = ss.insertSheet('History');
      
      // Add headers
      historySheet.appendRow([
        'Order #',
        'Open Time',
        'Close Time',
        'Type',
        'Lots',
        'Symbol',
        'Entry Price',
        'Exit Price',
        'P/L',
        'Date',
        'Comment',
        'Commission',
        'Swap'
      ]);
      
      // Format header
      var headerRange = historySheet.getRange(1, 1, 1, 13);
      headerRange.setBackground('#1e293b');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      
      Logger.log('✅ History sheet created with headers');
    } else {
      var lastRow = historySheet.getLastRow();
      Logger.log('✅ History sheet found with ' + (lastRow - 1) + ' existing records (last row: ' + lastRow + ')');
      
      // Log first few existing orders
      if (lastRow > 1) {
        var existingOrders = historySheet.getRange(2, 1, Math.min(5, lastRow - 1), 1).getValues();
        Logger.log('Existing orders (sample): ' + JSON.stringify(existingOrders));
      } else {
        Logger.log('History sheet is empty (only header row)');
      }
    }
    
    var imported = 0;
    var skipped = 0;
    var errors = [];
    
    trades.forEach(function(trade, index) {
      try {
        if (index === 0) {
          Logger.log('Processing first trade - Order: ' + trade.order + ', Symbol: ' + trade.symbol + ', P/L: ' + trade.profit);
        }
        
        // Check for duplicates
        var isDupe = isDuplicateOrder(trade.order);
        
        if (isDupe) {
          Logger.log('⚠️ Skipping duplicate order: ' + trade.order);
          skipped++;
          return;
        }
        
        // Map symbol
        var symbol = mapSymbol(trade.symbol);
        
        // Validate trade
        if (!validateImportedTrade(trade)) {
          Logger.log('⚠️ Invalid trade data, skipping: ' + trade.order);
          errors.push('Invalid data for order ' + trade.order);
          skipped++;
          return;
        }
        
        // Add to history
        historySheet.appendRow([
          trade.order,                    // Order #
          trade.openTime,                 // Open Time
          '',                             // Close Time
          trade.type,                     // Type
          trade.size,                     // Lots
          symbol,                         // Symbol
          trade.openPrice,                // Entry Price
          trade.closePrice || '',         // Exit Price
          trade.profit,                   // P/L
          new Date(),                     // Import Date
          'MT4/MT5 Import',              // Comment
          trade.commission || 0,          // Commission
          trade.swap || 0                 // Swap
        ]);
        
        imported++;
        
        if (imported <= 3) {
          Logger.log('✅ Imported #' + imported + ': ' + trade.order + ' | ' + symbol + ' | $' + trade.profit);
        }
        
      } catch(e) {
        var errorMsg = 'Error importing trade ' + trade.order + ': ' + e.toString();
        Logger.log('❌ ' + errorMsg);
        errors.push(errorMsg);
        skipped++;
      }
    });
    
    Logger.log('✅ Import completed: ' + imported + ' imported, ' + skipped + ' skipped');
    Logger.log('Final History sheet row count: ' + historySheet.getLastRow());
    
    if (errors.length > 0) {
      Logger.log('⚠️ Errors encountered: ' + errors.length);
      Logger.log('First 3 errors: ' + JSON.stringify(errors.slice(0, 3)));
    }
    
    return {
      success: true,
      imported: imported,
      skipped: skipped,
      errors: errors,
      message: imported > 0 ? 
        'Successfully imported ' + imported + ' trade(s)' : 
        'No new trades imported (all duplicates)'
    };
    
  } catch(e) {
    Logger.log('❌ MT4 Import fatal error: ' + e.toString());
    Logger.log('Stack trace: ' + e.stack);
    return {
      success: false,
      error: 'Import failed: ' + e.toString(),
      stack: e.stack
    };
  }
}

function isDuplicateOrder(orderNumber) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var historySheet = ss.getSheetByName('History');
    
    if (!historySheet) {
      Logger.log('History sheet not found, no duplicates');
      return false;
    }
    
    var lastRow = historySheet.getLastRow();
    
    // If only header row exists, no duplicates
    if (lastRow <= 1) {
      Logger.log('History sheet is empty (only header), no duplicates');
      return false;
    }
    
    // Get all order numbers (column A, skip header)
    var orderNumbers = historySheet.getRange(2, 1, lastRow - 1, 1).getValues();
    
    // Check if this order number exists
    for (var i = 0; i < orderNumbers.length; i++) {
      var existingOrder = orderNumbers[i][0];
      
      // Skip empty rows
      if (!existingOrder || existingOrder === '') {
        continue;
      }
      
      // Compare as strings
      if (existingOrder.toString().trim() === orderNumber.toString().trim()) {
        Logger.log('Found duplicate: ' + orderNumber);
        return true;
      }
    }
    
    Logger.log('Order ' + orderNumber + ' is not duplicate');
    return false;
    
  } catch(e) {
    Logger.log('Error checking duplicate: ' + e.toString());
    // If error, assume not duplicate to allow import
    return false;
  }
}

function mapSymbol(mtSymbol) {
  // Map MT4/MT5 symbols to our system
  var mapping = {
    'XAUUSD': 'GOLD',
    'XAUUSDm': 'GOLD',
    'GOLD': 'GOLD',
    'GC': 'GOLD',
    'BTCUSD': 'BTC',
    'BTCUSDT': 'BTC',
    'Bitcoin': 'BTC'
  };
  
  var mapped = mapping[mtSymbol];
  if (mapped) {
    return mapped;
  }
  
  // If not mapped, return original
  return mtSymbol;
}

function validateImportedTrade(trade) {
  // Basic validation with detailed logging
  if (!trade.order) {
    Logger.log('Validation failed: missing order number');
    return false;
  }
  if (!trade.symbol) {
    Logger.log('Validation failed: missing symbol, order=' + trade.order);
    return false;
  }
  if (!trade.openPrice || trade.openPrice <= 0) {
    Logger.log('Validation failed: bad openPrice, order=' + trade.order + ' openPrice=' + trade.openPrice);
    return false;
  }
  if (!trade.size || trade.size <= 0) {
    Logger.log('Validation failed: bad size, order=' + trade.order + ' size=' + trade.size);
    return false;
  }
  if (!trade.type) {
    Logger.log('Validation failed: missing type, order=' + trade.order);
    return false;
  }

  var typeStr = trade.type.toString().toLowerCase();
  if (typeStr.indexOf('buy') === -1 && typeStr.indexOf('sell') === -1) {
    Logger.log('Validation failed: type not buy or sell, order=' + trade.order + ' type=' + trade.type);
    return false;
  }

  return true;
}

// ===================================
// UTILITY FUNCTIONS FOR IMPORT
// ===================================

function clearHistorySheet() {
  try {
    Logger.log('🗑️ Clearing History sheet...');
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var historySheet = ss.getSheetByName('History');
    
    if (!historySheet) {
      return {
        success: false,
        error: 'History sheet not found'
      };
    }
    
    // Clear all data except header
    var lastRow = historySheet.getLastRow();
    if (lastRow > 1) {
      historySheet.getRange(2, 1, lastRow - 1, historySheet.getLastColumn()).clearContent();
      Logger.log('✅ Cleared ' + (lastRow - 1) + ' rows');
    }
    
    return {
      success: true,
      cleared: lastRow - 1,
      message: 'History cleared successfully'
    };
    
  } catch(e) {
    Logger.log('❌ Error clearing history: ' + e.toString());
    return {
      success: false,
      error: e.toString()
    };
  }
}

function getHistoryStats() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var historySheet = ss.getSheetByName('History');
    
    if (!historySheet) {
      return {
        success: false,
        error: 'History sheet not found'
      };
    }
    
    var lastRow = historySheet.getLastRow();
    var totalTrades = lastRow > 1 ? lastRow - 1 : 0;
    
    return {
      success: true,
      totalTrades: totalTrades,
      hasData: totalTrades > 0
    };
    
  } catch(e) {
    return {
      success: false,
      error: e.toString()
    };
  }
}


// ===================================
// IMPORT WITH FORCE OPTION  
// ===================================

function importMT4TradesWithOptions(trades, forceImport) {
  try {
    Logger.log("📥 Import: " + trades.length + " trades, Force: " + forceImport);
    
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var historySheet = ss.getSheetByName("History");
    
    if (!historySheet) {
      historySheet = ss.insertSheet("History");
      historySheet.appendRow(["Order #", "Open Time", "Close Time", "Type", "Lots", "Symbol", "Entry Price", "Exit Price", "P/L", "Date", "Comment", "Commission", "Swap"]);
      var headerRange = historySheet.getRange(1, 1, 1, 13);
      headerRange.setBackground("#1e293b");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
    }
    
    var imported = 0;
    var skipped = 0;
    
    trades.forEach(function(trade) {
      try {
        if (!forceImport && isDuplicateOrder(trade.order)) {
          skipped++;
          return;
        }
        
        if (!validateImportedTrade(trade)) {
          skipped++;
          return;
        }
        
        var symbol = mapSymbol(trade.symbol);
        
        historySheet.appendRow([
          trade.order,
          trade.openTime,
          "",
          trade.type,
          trade.size,
          symbol,
          trade.openPrice,
          trade.closePrice || "",
          trade.profit,
          new Date(),
          forceImport ? "MT4 Force" : "MT4/MT5 Import",
          trade.commission || 0,
          trade.swap || 0
        ]);
        
        imported++;
      } catch(e) {
        Logger.log("Error: " + e);
        skipped++;
      }
    });
    
    Logger.log("✅ Done: " + imported + " imported, " + skipped + " skipped");
    
    return {
      success: true,
      imported: imported,
      skipped: skipped
    };
    
  } catch(e) {
    return {
      success: false,
      error: e.toString()
    };
  }
}
