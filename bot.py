import requests
import json
import re
from geopy.geocoders import Nominatim
import time

# 1. Списък с портали (Instances)
INSTANCES = [
    "https://nitter.net", "https://nitter.cz", "https://nitter.privacydev.net", 
    "https://nitter.unixfox.eu", "https://nitter.poast.org", "https://nitter.moomoo.me"
]

# 2. Твоите 10 OSINT източника за постоянни новини
SOURCES = [
    "OSINTtechnical", "DeepStateUA", "UAWeapons", "Liveuamap", 
    "IAPonomarenko", "war_noir", "EuromaidanPress", "Gerashchenko_en",
    "clashreport", "Tendar"
]

geolocator = Nominatim(user_agent="global_war_tracker_v2")

def get_latest_tweet(username):
    """ Пробва да вземе пост от конкретен акаунт през наличните портали """
    for instance in INSTANCES:
        url = f"{instance}/{username}/rss"
        try:
            response = requests.get(url, timeout=8)
            if response.status_code == 200:
                titles = re.findall(r'<title>(.*?)</title>', response.text)
                if len(titles) > 1:
                    return titles[1]
        except:
            continue
    return None

def extract_location(text):
    """ Търси име на град в текста """
    cities = [
        "Kyiv", "Kharkiv", "Odesa", "Bakhmut", "Avdiivka", "Donetsk", 
        "Lviv", "Zaporizhzhia", "Kherson", "Dnipro", "Mariupol", "Luhansk",
        "Belgorod", "Crimea", "Sevastopol", "Sudzha", "Kursk"
    ]
    for city in cities:
        if city.lower() in text.lower():
            return city
    return None

def run_bot():
    all_events = []
    print(f"🚀 Стартирам сканиране на {len(SOURCES)} акаунта...")

    for user in SOURCES:
        print(f"🔎 Проверявам: {user}...")
        tweet = get_latest_tweet(user)
        
        if tweet:
            city = extract_location(tweet)
            if city:
                print(f"📍 Намерен град: {city} в пост на {user}")
                location = geolocator.geocode(city)
                if location:
                    all_events.append({
                        "country": "Ukraine/Region",
                        "lat": location.latitude,
                        "lon": location.longitude,
                        "date": time.strftime("%Y-%m-%d"),
                        "type": "Update",
                        "title": f"[{user}]: {tweet[:90]}...",
                        "link": f"https://x.com/{user}"
                    })
        # Малка пауза, за да не ни блокират порталите
        time.sleep(1)

    if all_events:
        # Записваме ВСИЧКИ намерени точки в файла
        with open('conflicts.json', 'w', encoding='utf-8') as f:
            json.dump(all_events, f, indent=4, ensure_ascii=False)
        print(f"✅ Готово! Картата е обновена с {len(all_events)} активни точки.")
    else:
        print("ℹ️ Този път не бяха открити нови локации в последните постове.")

if __name__ == "__main__":
    run_bot()
