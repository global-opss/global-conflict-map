import requests
import json
import re
from geopy.geocoders import Nominatim
import time

FEEDS = [
    "https://www.politico.eu/rss", "https://rss.cnn.com/rss/edition_world.rss",
    "http://feeds.bbci.co.uk/news/world/rss.xml", "https://www.aljazeera.com/xml/rss/all.xml",
    "https://www.theguardian.com/world/rss", "https://www.kyivpost.com/feed",
    "https://www.militarytimes.com/arc/outboundfeeds/rss/", "https://www.longwarjournal.org/feed",
    "https://rss.nytimes.com/services/xml/rss/nyt/World.xml"
]

geolocator = Nominatim(user_agent="conflict_map_final_v12")

def extract_info(text):
    t = text.lower()
    # РАЗШИРЕН СПИСЪК С ЛОКАЦИИ И ДЪРЖАВИ
    locations = {
        "Ukraine": ["kyiv", "kharkiv", "donetsk", "crimea", "odesa", "donbas", "kursk", "zaporizhzhia"],
        "Russia": ["moscow", "kremlin", "voronezh", "belgorod", "rostov", "st. petersburg", "novorossiysk"],
        "Middle East": ["gaza", "israel", "lebanon", "iran", "yemen", "tehran", "tel aviv", "beirut", "red sea", "hamas", "idf", "palestinian"],
        "Africa": ["sudan", "mali", "congo", "khartoum", "darfur", "somalia", "el fasher", "ethiopia"],
        "USA": ["washington", "pentagon", "white house", "biden", "trump", "new york", "texas border"],
        "China": ["beijing", "taiwan", "south china sea", "xi jinping", "shanghai", "fujian"],
        "North Korea": ["pyongyang", "kim jong un", "north korea", "dprk"],
        "Japan": ["tokyo", "sea of japan", "okinawa", "japanese"],
        "Venezuela": ["caracas", "venezuela", "maduro", "essequibo"]
    }
    
    # ИНТЕЛИГЕНТНИ КАТЕГОРИИ ЗА ИКОНИТЕ
    event_map = {
        "Naval": ["ship", "vessel", "navy", "sea", "maritime", "boat", "port", "carrier", "destroyer"],
        "Airstrike": ["airstrike", "missile", "rocket", "bombing", "strikes", "attack", "hit", "intercepted", "ballistic"],
        "Explosion": ["explosion", "blast", "shelling", "artillery", "fire", "killed", "dead", "destroyed", "fatalities"],
        "Drone": ["drone", "uav", "shahed", "quadcopter", "unmanned"],
        "Clashes": ["clashes", "fighting", "battle", "siege", "forces", "military", "war", "clash", "offensive", "army"],
        "Nuclear": ["nuclear", "atomic", "radiation", "npp", "icbm", "warhead"],
        "Cyber": ["cyber", "hacking", "hacker", "ddos", "malware", "cyberattack"]
    }

    found_city, found_region = None, "World"
    for region, cities in locations.items():
        for city in cities:
            if city in t:
                # Ако намерим държава или град, ги ползваме за геолокация
                found_city, found_region = city.capitalize(), region
                break
        if found_city: break

    found_type = "Breaking News"
    for event, keywords in event_map.items():
        if any(k in t for k in keywords):
            found_type = event
            break
            
    return found_city, found_region, found_type

def run_bot():
    all_events = []
    print(f"Starting news sync at {time.strftime('%H:%M:%S')}...")
    
    for url in FEEDS:
        try:
            res = requests.get(url, timeout=15)
            # Търсим заглавия и линкове
            titles = re.findall(r'<title>(.*?)</title>', res.text)
            links = re.findall(r'<link>(.*?)</link>', res.text)
            
            for i in range(len(titles)):
                title = titles[i].replace("<![CDATA[", "").replace("]]>", "").strip()
                if len(title) < 15: continue
                
                city, region, event_type = extract_info(title)
                
                if city:
                    try:
                        # Тук ботът намира точните координати
                        loc = geolocator.geocode(city)
                        if loc:
                            # Опитваме се да извлечем число за fatalities, ако има такова
                            death_match = re.search(r'(\d+)\s+(killed|dead|fatalities)', title.lower())
                            fatalities = death_match.group(1) if death_match else "0"
                            
                            all_events.append({
                                "country": region,
                                "lat": loc.latitude, 
                                "lon": loc.longitude,
                                "date": time.strftime("%Y-%m-%d"),
                                "type": event_type, 
                                "title": title[:130],
                                "description": "Latest report from international sources regarding " + region + ".",
                                "fatalities": fatalities,
                                "link": links[i] if i < len(links) else url
                            })
                    except: continue
        except Exception as e: 
            print(f"Error fetching {url}: {e}")
            continue
    
    # Махаме дубликатите на база координати
    unique_events = { (e['lat'], e['lon']): e for e in all_events }.values()
    
    # ЗАПИСВАМЕ В JSON
    with open('conflicts.json', 'w', encoding='utf-8') as f:
        json.dump(list(unique_events), f, indent=4, ensure_ascii=False)
    
    print(f"Sync complete. Found {len(unique_events)} unique events.")

if __name__ == "__main__":
    run_bot()
