import feedparser
import json
from geopy.geocoders import Nominatim
import time

# Списък с източници на новини за конфликти
RSS_URL = "https://reliefweb.int/updates/rss.xml?search=primary_country.id%3A%28250%20OR%20228%20OR%20229%29%20AND%20content_type%3A%28Report%20OR%20News%20and%20Press%20Release%29"

geolocator = Nominatim(user_agent="my_conflict_tracker")

def get_coords(country_name):
    try:
        location = geolocator.geocode(country_name)
        if location:
            return location.latitude, location.longitude
    except:
        return None, None

def fetch_news():
    feed = feedparser.parse(RSS_URL)
    new_data = []
    
    # Вземаме последните 10 новини
    for entry in feed.entries[:10]:
        # Опростена логика за разпознаване на държава (може да се разшири)
        country = "Sudan" # Пример, тук ще добавим по-умна логика
        if "Ukraine" in entry.title: country = "Ukraine"
        elif "Gaza" in entry.title: country = "Palestine"
        elif "Syria" in entry.title: country = "Syria"
        
        lat, lon = get_coords(country)
        
        if lat and lon:
            new_data.append({
                "country": country,
                "date": time.strftime("%Y-%m-%d"),
                "fatalities": 0, # Новините рядко дават точна цифра веднага
                "type": "News Alert",
                "lat": lat,
                "lon": lon,
                "title": entry.title
            })
    
    with open('conflicts.json', 'w', encoding='utf-8') as f:
        json.dump(new_data, f, indent=4)

if __name__ == "__main__":
    fetch_news()
