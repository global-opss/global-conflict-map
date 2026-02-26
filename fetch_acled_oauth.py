import feedparser
import json
import time
import os

# СПЕЦИАЛИЗИРАНИ ВОЕННИ ИЗТОЧНИЦИ
ALARM_SOURCES = [
    "https://www.militarytimes.com/arc/outboundfeeds/rss/category/flashpoints/?outputType=xml",
    "https://www.defensenews.com/arc/outboundfeeds/rss/category/global/?outputType=xml",
    "https://www.longwarjournal.org/feed",
    "https://www.janes.com/rss",
    "https://www.nato.int/cps/en/natolive/rss.xml"
]

# КЛЮЧОВИ ДУМИ - ДОБАВИХМЕ АФГАНИСТАН И ПАКИСТАН
CRITICAL_KEYWORDS = [
    "nuclear", "atomic", "npp", "mobilization", "carrier strike group", 
    "5th fleet", "declaration of war", "icbm", "ballistic missile", 
    "chemical weapon", "emergency evacuation", "pentagon alert",
    "taliban", "durand line", "afghanistan", "pakistan offensive"
]

def run_watch_officer():
    print("🚨 ВАХТЕН ОФИЦЕР: МОНИТОРИНГЪТ Е АКТИВЕН...")
    found_alerts = []

    for url in ALARM_SOURCES:
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:10]:
                title = entry.title.lower()
                summary = entry.summary.lower() if 'summary' in entry else ""
                
                if any(word in title or word in summary for word in CRITICAL_KEYWORDS):
                    print(f"!!! КРИТИЧНО СЪБИТИЕ: {entry.title} !!!")
                    found_alerts.append(entry.title)
        except Exception as e:
            print(f"Грешка при сканиране на {url}: {e}")

    # ФОРМИРАНЕ НА КОМАНДАТА ЗА САЙТА (Снощния ни формат)
    if found_alerts:
        alert_data = {
            "alert_level": "CRITICAL",
            "active": True,
            "sound_alarm": True,
            "breaking_news": f"🚨 BREAKING: {found_alerts[0]}",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        }
    else:
        # АКО НЯМА НОВИНИ, НЕ ТРИЙ АЛАРМАТА, А ПАЗИ СТАТУСА
        # Или остави алармата активна, ако искаш да я движиш ръчно
        alert_data = {
            "alert_level": "NORMAL",
            "active": False,
            "sound_alarm": False,
            "breaking_news": "Ситуацията е спокойна.",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        }

    # ЗАПИС ВЪВ ФОРМАТА, КОЙТО СНОЩИ ГЛЕДАХМЕ
    with open('critical_alerts.json', 'w', encoding='utf-8') as f:
        json.dump(alert_data, f, indent=4, ensure_ascii=False)
    
    if found_alerts:
        print(f"⚠️ ПРЕДУПРЕЖДЕНИЕ: Сирената е активирана автоматично!")
    else:
        print("✅ Няма нови критични събития.")

if __name__ == "__main__":
    run_watch_officer()
