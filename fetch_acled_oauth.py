import feedparser
import json
import time
import os

# СПЕЦИАЛИЗИРАНИ ВОЕННИ ИЗТОЧНИЦИ ЗА КРИТИЧНИ СЪБИТИЯ
ALARM_SOURCES = [
    "https://www.militarytimes.com/arc/outboundfeeds/rss/category/flashpoints/?outputType=xml",
    "https://www.defensenews.com/arc/outboundfeeds/rss/category/global/?outputType=xml",
    "https://www.longwarjournal.org/feed",
    "https://www.janes.com/rss",
    "https://www.nato.int/cps/en/natolive/rss.xml"
]

# КЛЮЧОВИ ДУМИ ЗА МОМЕНТАЛНА АЛАРМА
CRITICAL_KEYWORDS = [
    "nuclear", "atomic", "npp", "mobilization", "carrier strike group", "Afganistan", "Pakistan",
    "5th fleet", "declaration of war", "icbm", "ballistic missile", 
    "chemical weapon", "emergency evacuation", "pentagon alert"
]

def run_watch_officer():
    print("🚨 ВАХТЕН ОФИЦЕР: МОНИТОРИНГЪТ ЗА КРИТИЧНИ СЪБИТИЯ Е АКТИВЕН...")
    alerts = []

    for url in ALARM_SOURCES:
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries[:10]: # Гледаме само най-новото
                title = entry.title.lower()
                summary = entry.summary.lower() if 'summary' in entry else ""
                
                # Проверка за критични думи
                if any(word in title or word in summary for word in CRITICAL_KEYWORDS):
                    print(f"!!! КРИТИЧНО СЪБИТИЕ НАМЕРЕНО: {entry.title} !!!")
                    alerts.append({
                        "id": "ALARM_" + str(int(time.time())),
                        "title": entry.title,
                        "link": entry.link,
                        "time": time.strftime("%H:%M:%S"),
                        "level": "RED_ALERT"
                    })
        except Exception as e:
            print(f"Грешка при сканиране на {url}: {e}")

    # Записваме в отделен файл, за да не пречим на bot.py
    # Ако няма аларми, файлът ще е празен списък
    with open('critical_alerts.json', 'w', encoding='utf-8') as f:
        json.dump(alerts, f, indent=4, ensure_ascii=False)
    
    if alerts:
        print(f"⚠️ ПРЕДУПРЕЖДЕНИЕ: Записани са {len(alerts)} критични аларми!")
    else:
        print("✅ Ситуацията е спокойна. Няма активни аларми.")

if __name__ == "__main__":
    run_watch_officer()
