import requests
import xml.etree.ElementTree as ET
import random
import json
import time
import re
import os
from geopy.geocoders import Nominatim
from bs4 import BeautifulSoup

# =============================================================================
# GLOBAL CONFLICT MONITOR BOT v10.0 - FULL AUTO-INTEGRATION
# =============================================================================

USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
geolocator = Nominatim(user_agent="conflict_monitor_global_v10")

FEEDS = [
    "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    "https://feeds.bbci.co.uk/news/world/rss.xml",
    "https://www.aljazeera.com/xml/rss/all.xml",
    "https://www.reutersagency.com/feed/",
    "https://p.dw.com/p/24CH",
    "https://www.france24.com/en/rss",
    "https://www.militarytimes.com/arc/outboundfeeds/rss/category/flashpoints/?outputType=xml",
    "https://www.defensenews.com/arc/outboundfeeds/rss/category/global/?outputType=xml",
    "https://www.janes.com/rss", 
    "https://www.criticalthreats.org/rss",
    "https://defense-update.com/feed",
    "https://www.longwarjournal.org/feed",
    "https://www.army-technology.com/feed/",
    "https://www.naval-technology.com/feed/",
    "https://theaviationist.com/feed/",
    "https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?max=10",
    "https://api.axios.com/feed/",
    "https://www.whitehouse.gov/briefing-room/statements-releases/feed/"
]

LOCATION_CACHE = {
    "tehran": [35.6892, 51.3890], "kyiv": [50.4501, 30.5234], "tel aviv": [32.0853, 34.7818],
    "beirut": [33.8938, 35.5018], "gaza": [31.5047, 34.4648], "isfahan": [32.6539, 51.6660],
    "moscow": [55.7558, 37.6173], "sevastopol": [44.6167, 33.5254], "odesa": [46.4825, 30.7233],
    "kharkiv": [50.0017, 36.2304], "lviv": [49.8397, 24.0297], "bushehr": [28.9234, 50.8203],
    "tabriz": [38.0962, 46.2731], "mashhad": [36.2972, 59.6067], "belgorod": [50.5937, 36.5858],
    "washington": [38.8951, -77.0364], "warsaw": [52.2297, 21.0122], "taiwan strait": [24.4786, 119.3490]
}

def clean_html(raw_html):
    if not raw_html: return ""
    cleanr = re.compile('<.*?>|&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});')
    return re.sub(cleanr, '', raw_html).strip()

def extract_info(text, locations_map):
    t = text.lower()
    event_map = {
        "Evacuation": ["evacuate", "leave now", "emergency departure"],
        "Naval": ["ship", "vessel", "navy", "carrier", "destroyer", "warship"],
        "Airstrike": ["airstrike", "missile", "rocket", "bombing", "strikes"],
        "Explosion": ["explosion", "blast", "shelling", "artillery"],
        "Drone": ["drone", "uav", "shahed", "fpv", "kamikaze"],
        "Clashes": ["clashes", "fighting", "battle", "frontline", "tank"],
        "Nuclear": ["nuclear", "atomic", "radiation", "npp", "icbm"]
    }
    found_city, found_region = None, "World"
    for region, cities in locations_map.items():
        for city in cities:
            if city.lower() in t:
                found_city, found_region = city.capitalize(), region
                break
        if found_city: break
    
    found_type = "Breaking News"
    for event, keywords in event_map.items():
        if any(k in t for k in keywords):
            found_type = event
            break
    return found_city, found_region, found_type

def get_coordinates(city, region):
    city_low = city.lower()
    if city_low in LOCATION_CACHE: return LOCATION_CACHE[city_low][0], LOCATION_CACHE[city_low][1]
    try:
        time.sleep(1)
        loc = geolocator.geocode(f"{city}, {region}", timeout=10)
        if loc:
            LOCATION_CACHE[city_low] = [loc.latitude, loc.longitude]
            return loc.latitude, loc.longitude
    except: return None, None
    return None, None

def update_naval_tracking():
    """ Автоматично OSINT проследяване на реални кораби по MMSI """
    print("\n⚓ --- STARTING DYNAMIC NAVAL SCAN ---")
    
    mmsi_data = {
        "cvn-72": {"mmsi": "368926001", "name": "USS Abraham Lincoln", "type": "us-naval", "fallback": [23.5, 59.1]},
        "cvn-78": {"mmsi": "368926000", "name": "USS Gerald R. Ford", "type": "us-naval", "fallback": [34.2, 24.1]},
        "ddg-64": {"mmsi": "367112000", "name": "USS Carney", "type": "us-naval", "fallback": [15.5, 41.2]},
        "ir-bagheri": {"mmsi": "422000000", "name": "IRIS Shahid Bagheri", "type": "ir-naval", "fallback": [27.0, 56.1]},
        "ddg-111": {"mmsi": "367115000", "name": "USS Spruance", "type": "us-naval", "fallback": [23.4, 58.9]}
    }
    
    final_assets = []
    for key, info in mmsi_data.items():
        try:
            url = f"https://www.myshiptracking.com/vessels/mmsi-{info['mmsi']}"
            res = requests.get(url, headers={'User-Agent': USER_AGENT}, timeout=10)
            lat = float(re.search(r'lat:([0-9.-]+)', res.text).group(1))
            lon = float(re.search(r'lon:([0-9.-]+)', res.text).group(1))
            status = "LIVE OSINT"
        except:
            lat, lon = info['fallback']
            status = "AIS OFFLINE (LAST KNOWN)"
            
        final_assets.append({
            "id": key, "name": info['name'], "type": info['type'],
            "lat": lat, "lon": lon, "description": f"Status: {status} | MMSI: {info['mmsi']}"
        })
        print(f"🚢 {info['name']}: {lat}, {lon} ({status})")

    with open('naval_assets.json', 'w', encoding='utf-8') as f:
        json.dump(final_assets, f, indent=4, ensure_ascii=False)

def run_bot():
    locations_db = {
        "Ukraine": ["Kyiv", "Kharkiv", "Odesa", "Lviv", "Pokrovsk"],
        "Israel": ["Tel Aviv", "Jerusalem", "Gaza", "Rafah"],
        "Iran": ["Tehran", "Isfahan", "Bushehr"],
        "USA": ["Washington", "Pentagon", "Norfolk"]
    }
    
    all_events = []
    for url in FEEDS:
        try:
            res = requests.get(url, headers={'User-Agent': USER_AGENT}, timeout=10)
            root = ET.fromstring(res.content)
            for item in root.findall('.//item')[:10]:
                title = clean_html(item.find('title').text)
                desc = clean_html(item.find('description').text if item.find('description') is not None else "")
                link = item.find('link').text if item.find('link') is not None else "#"
                
                city, region, event_type = extract_info(title + " " + desc, locations_db)
                if city:
                    lat, lon = get_coordinates(city, region)
                    if lat and lon:
                        severity = "critical" if event_type in ["Nuclear", "Airstrike"] else "normal"
                        all_events.append({
                            "country": region, "city": city, "lat": lat + random.uniform(-0.02, 0.02),
                            "lon": lon + random.uniform(-0.02, 0.02), "date": time.strftime("%H:%M:%S"),
                            "type": event_type, "severity": severity, "title": title, "link": link
                        })
        except: continue
        
    with open('conflicts.json', 'w', encoding='utf-8') as f:
        json.dump(all_events[:150], f, indent=4, ensure_ascii=False)
    print(f"🚀 NEWS DATABASE UPDATED: {len(all_events)} items.")

if __name__ == "__main__":
    while True:
        print("\n--- NEW SCAN CYCLE STARTED ---")
        try:
            update_naval_tracking() # 1. Местим корабите
            run_bot()              # 2. Събираме новините
            print("\n--- CYCLE FINISHED. WAITING 15 MIN ---")
            time.sleep(900)
        except KeyboardInterrupt: break
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(60)

