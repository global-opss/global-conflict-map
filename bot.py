import requests
import xml.etree.ElementTree as ET
import json
import time
import re
from geopy.geocoders import Nominatim

# --- КОНФИГУРАЦИЯ ---
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
geolocator = Nominatim(user_agent="conflict_monitor_v6")

FEEDS = [
    "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    "https://feeds.bbci.co.uk/news/world/rss.xml",
    "https://www.aljazeera.com/xml/rss/all.xml"
]

# Кеш за локации за пестене на API заявки
LOCATION_CACHE = {
    "tehran": [35.6892, 51.3890],
    "kyiv": [50.4501, 30.5234],
    "tel aviv": [32.0853, 34.7818],
    "beirut": [33.8938, 35.5018]
}

def clean_html(raw_html):
    """Премахва HTML тагове и излишни интервали."""
    if not raw_html: return ""
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return cleantext.strip()

def extract_info(text, locations):
    """
    Разширена логика за засичане на тип събитие и локация.
    ДОБАВЕНО: Critical Evacuation Check.
    """
    t = text.lower()
    
    # 1. ДЕФИНИРАНЕ НА СЪБИТИЯ (Разширен списък за обем и точност)
    event_map = {
        "Evacuation": ["evacuate", "leave iran", "citizens must leave", "evacuation", "emergency departure"],
        "Naval": ["ship", "vessel", "navy", "maritime", "carrier", "destroyer", "black sea fleet", "frigate"],
        "Airstrike": ["airstrike", "missile", "rocket", "bombing", "strikes", "attack", "ballistic", "explosion"],
        "Explosion": ["explosion", "blast", "shelling", "artillery", "fire", "killed", "detonation"],
        "Drone": ["drone", "uav", "shahed", "fpv", "kamikaze", "bayraktar"],
        "Clashes": ["clashes", "fighting", "battle", "siege", "frontline", "tank", "infantry"],
        "Nuclear": ["nuclear", "atomic", "radiation", "npp", "icbm", "uranium", "reactor"]
    }

    found_city, found_region = None, "World"
    
    # 2. ТЪРСЕНЕ НА ЛОКАЦИЯ
    for region, cities in locations.items():
        for city in cities:
            if city.lower() in t:
                found_city, found_region = city.capitalize(), region
                break
        if found_city: break

    # 3. ОПРЕДЕЛЯНЕ НА ТИП СЪБИТИЕ
    found_type = "Breaking News"
    for event, keywords in event_map.items():
        if any(k in t for k in keywords):
            found_type = event
            break
            
    return found_city, found_region, found_type

def get_coordinates(city, region):
    """Извличане на координати с Nominatim и кеширане."""
    city_low = city.lower()
    if city_low in LOCATION_CACHE:
        return LOCATION_CACHE[city_low][0], LOCATION_CACHE[city_low][1]
    
    try:
        print(f"🌐 Geocoding: {city}...")
        time.sleep(1.2) # Пауза съгласно правилата на Nominatim
        loc = geolocator.geocode(f"{city}, {region}", timeout=10)
        if loc:
            LOCATION_CACHE[city_low] = [loc.latitude, loc.longitude]
            return loc.latitude, loc.longitude
    except Exception as e:
        print(f"❌ Geocode Error: {e}")
        return None, None
    return None, None

def run_bot():
    """Основна логика на бота - СТРИКТНО 151+ РЕДА."""
    all_events = []
    
    # Списък с градове за търсене (Примерен - разшири го в твоя проект)
    locations = {
        "Iran": ["Tehran", "Isfahan", "Bushehr", "Tabriz", "Mashhad"],
        "Ukraine": ["Kyiv", "Kharkiv", "Odesa", "Lviv", "Donetsk"],
        "Russia": ["Moscow", "Sevastopol", "Belgorod", "Engels"],
        "Israel": ["Tel Aviv", "Jerusalem", "Haifa", "Gaza"]
    }

    print(f"📡 --- STARTING INTEL SCAN v7 (CRITICAL EVACUATION UPDATE) ---")
    
    for url in FEEDS:
        domain = url.split('/')[2]
        print(f"🔍 Accessing Source: {domain}...")
        
        try:
            headers = {'User-Agent': USER_AGENT}
            res = requests.get(url, headers=headers, timeout=10)
            
            if res.status_code != 200:
                print(f"⚠️ Source Offline ({res.status_code}): {domain}")
                continue
            
            # Парсване на RSS структурата
            root = ET.fromstring(res.content)
            items = root.findall('.//item')
            print(f"🗞️ Found {len(items)} potential headlines in {domain}")

            for item in items[:15]: # Анализ на топ 15 новини
                raw_title = item.find('title').text if item.find('title') is not None else ""
                raw_desc = item.find('description').text if item.find('description') is not None else ""
                link = item.find('link').text if item.find('link') is not None else "#"

                title = clean_html(raw_title)
                desc = clean_html(raw_desc)

                # Валидация на дължината
                if len(title) < 20: continue
                
                # ИЗВЛИЧАНЕ НА ИНФОРМАЦИЯ
                city, region, event_type = extract_info(title + " " + desc, locations)
                
                if city:
                    lat, lon = get_coordinates(city, region)
                    
                    if lat and lon:
                        # Логика за смъртни случаи
                        death_match = re.search(r'(\d+)\s+(killed|dead|fatalities|casualties)', (title + " " + desc).lower())
                        fatalities = death_match.group(1) if death_match else "0"
                        
                        # Добавяне към списъка
                        event_data = {
                            "country": region,
                            "city": city,
                            "lat": lat,
                            "lon": lon,
                            "date": time.strftime("%Y-%m-%d %H:%M:%S"),
                            "type": event_type, 
                            "title": title[:120],
                            "description": desc[:400] if desc else f"Strategic update from {city} sector.",
                            "fatalities": fatalities,
                            "link": link,
                            "critical": True if event_type == "Evacuation" else False
                        }
                        
                        all_events.append(event_data)
                        print(f"✅ Event Captured: [{event_type}] in {city}")

        except Exception as e:
            print(f"💥 Critical Error on {url}: {str(e)}")

    # ПРЕМАХВАНЕ НА ДУБЛИКАТИ (базирано на заглавие)
    print(f"🧹 Filtering duplicates...")
    unique_events = {}
    for event in all_events:
        unique_events[event['title']] = event
    
    final_list = list(unique_events.values())

    # ЗАПИС В JSON ФАЙЛ
    try:
        print(f"💾 Saving data to conflicts.json...")
        with open('conflicts.json', 'w', encoding='utf-8') as f:
            json.dump(final_list, f, indent=4, ensure_ascii=False)
        print(f"🚀 DEPLOYMENT READY. TOTAL EVENTS: {len(final_list)}")
    except IOError as io_err:
        print(f"📁 File Error: Could not write JSON: {io_err}")

# --- ТОЧКА НА СТАРТИРАНЕ ---
if __name__ == "__main__":
    start_time = time.time()
    run_bot()
    end_time = time.time()
    print(f"⏱️ Process completed in {round(end_time - start_time, 2)} seconds.")
    # Край на скрипта - GitHub Actions ще затвори автоматично.
