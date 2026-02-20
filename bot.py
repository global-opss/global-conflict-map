import requests
import json
import re
from geopy.geocoders import Nominatim
import time

# Списък с новинарски RSS канали (работят без блокиране)
RSS_FEEDS = [
    "https://www.aljazeera.com/xml/rss/all.xml",
    "http://feeds.bbci.co.uk/news/world/rss.xml",
    "https://www.theguardian.com/world/rss"
]

geolocator = Nominatim(user_agent="conflict_tracker_stable")

def extract_data(text):
    # Разширен списък с ключови думи и градове
    cities = ["Kyiv", "Kharkiv", "Odesa", "Gaza", "Rafah", "Beirut", "Kherson", "Donetsk", "Bakhmut"]
    found_city = next((c for c in cities if c.lower() in text.lower()), None)
    
    keywords = ["airstrike", "shelling", "explosion", "attack", "clashes", "drone"]
    found_type = next((k.capitalize() for k in keywords if k.lower() in text.lower()), "Update")
    
    return found_city, found_type

def run_bot():
    all_events = []
    print("🚀 Стартирам стабилно сканиране през RSS...")

    for url in RSS_FEEDS:
        try:
            response = requests.get(url, timeout=15)
            # Търсим заглавия и описания чрез прост режекс
            items = re.findall(r'<title>(.*?)</title>', response.text)
            for title in items[2:10]: # Вземаме последните заглавия
                city, event_type = extract_data(title)
                if city:
                    location = geolocator.geocode(city)
                    if location:
                        all_events.append({
                            "country": "World",
                            "lat": location.latitude,
                            "lon": location.longitude,
                            "date": time.strftime("%Y-%m-%d"),
                            "type": event_type,
                            "title": title[:100],
                            "link": url
                        })
        except: continue

    # АКО НЯМА НОВИНИ, ВИНАГИ СЛАГАМЕ ЕДНА ТЕСТОВА ТОЧКА (за да видим картата жива)
    if not all_events:
        all_events.append({
            "country": "Ukraine", "lat": 50.45, "lon": 30.52,
            "date": time.strftime("%Y-%m-%d"), "type": "System OK",
            "title": "Системата е онлайн (Тестова точка)",
            "link": "https://google.com"
        })

    with open('conflicts.json', 'w', encoding='utf-8') as f:
        json.dump(all_events, f, indent=4, ensure_ascii=False)
    print(f"✅ Готово! Записани {len(all_events)} точки.")

if __name__ == "__main__":
    run_bot()
