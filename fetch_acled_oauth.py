import feedparser
import json
import time
import os
import datetime

# =================================================================
# КОНФИГУРАЦИЯ НА ВАХТЕНИЯ ОФИЦЕР (ВЕРСИЯ 2.1)
# =================================================================

# СПЕЦИАЛИЗИРАНИ ВОЕННИ ИЗТОЧНИЦИ
ALARM_SOURCES = [
    "https://www.militarytimes.com/arc/outboundfeeds/rss/category/flashpoints/?outputType=xml",
    "https://www.defensenews.com/arc/outboundfeeds/rss/category/global/?outputType=xml",
    "https://www.longwarjournal.org/feed",
    "https://www.janes.com/rss",
    "https://www.nato.int/cps/en/natolive/rss.xml"
]

# КЛЮЧОВИ ДУМИ - АКТУАЛИЗИРАНИ ЗА ГОРЕЩИ ТОЧКИ
CRITICAL_KEYWORDS = [
    "nuclear", "atomic", "npp", "mobilization", "carrier strike group", 
    "5th fleet", "declaration of war", "icbm", "ballistic missile", 
    "chemical weapon", "emergency evacuation", "pentagon alert",
    "taliban", "durand line", "afghanistan", "pakistan offensive",
    "airstrike", "invasion", "tactical nukes", "martial law"
]

# ПЪТ ДО JSON ФАЙЛА (Увери се, че е същият, който GitHub вижда)
OUTPUT_FILE = 'critical_alerts.json'

def log_event(message):
    """Помощна функция за логове с времева марка"""
    now = datetime.datetime.now().strftime("%H:%M:%S")
    print(f"[{now}] {message}")

def run_watch_officer():
    log_event("🚨 ВАХТЕН ОФИЦЕР: МОНИТОРИНГЪТ СЕ СТАРТИРА...")
    found_alerts = []

    # 1. СКАНИРАНЕ НА ИЗТОЧНИЦИТЕ
    for url in ALARM_SOURCES:
        try:
            log_event(f"Проверка на източник: {url.split('/')[2]}...")
            feed = feedparser.parse(url)
            
            if not feed.entries:
                continue

            for entry in feed.entries[:15]:  # Проверяваме първите 15 за по-голяма сигурност
                title = entry.title.lower()
                summary = entry.summary.lower() if 'summary' in entry else ""
                
                # Търсене на съвпадения
                if any(word in title or word in summary for word in CRITICAL_KEYWORDS):
                    # Проверяваме дали вече не сме го намерили в друг фийд
                    if entry.title not in found_alerts:
                        log_event(f"🔥🔥🔥 ОТКРИТО КРИТИЧНО СЪБИТИЕ: {entry.title}")
                        found_alerts.append(entry.title)
                        
        except Exception as e:
            log_event(f"❌ ГРЕШКА при сканиране на {url}: {e}")

    # 2. ФОРМИРАНЕ НА ДАННИТЕ (ВАЖНО: ТРЯБВА ДА Е СПИСЪК [])
    # Снощният JS код очаква alerts[0], затова опаковаме обекта в скоби [ ]
    
    if found_alerts:
        # Взимаме само най-новата новина за банера
        main_news = found_alerts[0]
        
        alert_data = [{
            "id": str(int(time.time())), # Уникално ID базирано на времето
            "alert_level": "CRITICAL",
            "active": True,
            "sound_alarm": True,
            "title": f"BREAKING: {main_news}",
            "breaking_news": f"🚨 BREAKING: {main_news}",
            "timestamp": datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        }]
        log_event(f"⚠️ ПРЕДУПРЕЖДЕНИЕ: Подготвя се активиране на сирената!")
    else:
        # АКО НЯМА НОВИНИ, ПРАЩАМЕ ПРАЗЕН СПИСЪК ИЛИ НЕАКТИВЕН СТАТУС
        alert_data = [{
            "id": "none",
            "alert_level": "NORMAL",
            "active": False,
            "sound_alarm": False,
            "title": "Ситуацията е спокойна.",
            "breaking_news": "Ситуацията е спокойна.",
            "timestamp": datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        }]
        log_event("✅ Ситуацията е спокойна. Няма поводи за тревога.")

    # 3. ЗАПИС ВЪВ ФАЙЛА (С ГАРАНТИРАНО UTF-8)
    try:
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(alert_data, f, indent=4, ensure_ascii=False)
        log_event(f"💾 Файлът '{OUTPUT_FILE}' е актуализиран успешно.")
    except Exception as e:
        log_event(f"❌ КРИТИЧНА ГРЕШКА ПРИ ЗАПИС: {e}")

# =================================================================
# ГЛАВЕН ЦИКЪЛ (АКО ИСКАШ ДА РАБОТИ ПОСТОЯННО)
# =================================================================
if __name__ == "__main__":
    # Можеш да го сложиш в while loop, ако го пускаш на сървър/PC
    # Докато тестваш, го пускай ръчно.
    run_watch_officer()

# КРАЙ НА СКРИПТА
