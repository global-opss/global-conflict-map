import feedparser
import json
from geopy.geocoders import Nominatim
import time

# Източник на новини от целия свят
RSS_URL = "https://reliefweb.int/updates/rss.xml"

geolocator = Nominatim(user_agent="global_conflict_tracker_final")

def fetch_news():
    feed = feedparser.parse(RSS_URL)
    new_data = []
    
    # Списък с държави за проверка (можеш да добавяш още)
    countries_list = ["Ukraine", "Sudan", "Gaza", "Israel", "Syria", "Yemen", "Congo", "Myanmar", "Somalia", "Mali", "Burkina Faso", "Nigeria", "Ethiopia", "Afghanistan", "Haiti", "Libya", "Iraq"]

    print(f"Намерени новини: {len(feed.entries)}")

    for entry in feed.entries[:20]: # Проверяваме последните 20 новини
        title = entry.title
        found_country = None
        
        # Търсим държава в заглавието
        for country in countries_list:
            if country.lower() in title.lower():
                found_country = country
                break
        
        if found_country:
            location = geolocator.geocode(found_country)
            if location:
                new_data.append({
                    "country": found_country,
                    "date": time.strftime("%Y-%m-%d"),
                    "fatalities": 1, 
                    "type": "News Alert",
                    "lat": location.latitude,
                    "lon": location.longitude,
                    "title": title[:100] + "..."
                })
                print(f"Добавена точка: {found_country}")

    # Ако все пак няма нищо, добавяме една тестова точка, за да не е празен файла
    if not new_data:
        new_data.append({
            "country": "World Update",
            "date": time.strftime("%Y-%m-%d"),
            "fatalities": 0,
            "type": "Other",
            "lat": 0.0, "lon": 0.0,
            "title": "No conflict news found in the last hour."
        })

    with open('conflicts.json', 'w', encoding='utf-8') as f:
        json.dump(new_data, f, indent=4)

if __name__ == "__main__":
    fetch_news()
