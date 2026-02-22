import requests
import xml.etree.ElementTree as ET
import json
import time
import re
import os
from geopy.geocoders import Nominatim
from bs4 import BeautifulSoup

# =============================================================================
# GLOBAL CONFLICT MONITOR BOT v9.7 - TOTAL DATA INTEGRITY CHECKED
# =============================================================================

USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
geolocator = Nominatim(user_agent="conflict_monitor_global_v9")

FEEDS = [
    "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", "https://feeds.bbci.co.uk/news/world/rss.xml",
    "https://www.aljazeera.com/xml/rss/all.xml", "https://www.reutersagency.com/feed/",
    "https://p.dw.com/p/24CH", "https://www.france24.com/en/rss",
    "https://www.militarytimes.com/arc/outboundfeeds/rss/category/flashpoints/?outputType=xml",
    "https://www.defensenews.com/arc/outboundfeeds/rss/category/global/?outputType=xml",
    "https://www.janes.com/rss", "https://www.criticalthreats.org/rss",
    "https://defense-update.com/feed", "https://www.longwarjournal.org/feed",
    "https://www.army-technology.com/feed/", "https://www.naval-technology.com/feed/",
    "https://theaviationist.com/feed/", "https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?max=10",
    "https://www.axios.com/world", "https://www.whitehouse.gov/briefing-room/"
]

LOCATION_CACHE = {
    "tehran": [35.6892, 51.3890], "kyiv": [50.4501, 30.5234], "tel aviv": [32.0853, 34.7818],
    "beirut": [33.8938, 35.5018], "gaza": [31.5047, 34.4648], "isfahan": [32.6539, 51.6660],
    "moscow": [55.7558, 37.6173], "sevastopol": [44.6167, 33.5254], "odesa": [46.4825, 30.7233],
    "kharkiv": [50.0017, 36.2304], "lviv": [49.8397, 24.0297], "bushehr": [28.9234, 50.8203],
    "tabriz": [38.0962, 46.2731], "mashhad": [36.2972, 59.6067], "belgorod": [50.5937, 36.5858],
    "engels": [51.4822, 46.1214], "damascus": [33.5138, 36.2765], "taipei": [25.0330, 121.5654],
    "washington": [38.8951, -77.0364], "pentagon": [38.8719, -77.0563], "warsaw": [52.2297, 21.0122],
    "rzeszow": [50.0412, 21.9991], "bucharest": [44.4268, 26.1025], "taiwan strait": [24.4786, 119.3490],
    "south china sea": [12.0000, 113.0000], "vovchansk": [50.2839, 36.9358], "pokrovsk": [48.2819, 37.1762],
    "raleigh": [35.7796, -78.6382], "norfolk": [36.8508, -76.2859], "san diego": [32.7157, -117.1611],
    "poland": [52.0000, 19.0000], "romania": [46.0000, 25.0000], "khartoum": [15.5007, 32.5599],
    "mogadishu": [2.0469, 45.3182], "niamey": [13.5116, 2.1254], "bamako": [12.6392, -8.0029],
    "ouagadougou": [12.3714, -1.5197], "sudan": [12.8628, 30.2176], "somalia": [5.1521, 46.1996],
    "libya": [26.3351, 17.2283], "tripoli": [32.8872, 13.1913], "djibouti": [11.5721, 43.1456],
    "kabul": [34.5553, 69.1770], "islamabad": [33.6844, 73.0479], "karachi": [24.8607, 67.0011],
    "peshawar": [34.0151, 71.5249], "kandahar": [31.6289, 65.7372]
}

def clean_html(raw):
    if not raw: return ""
    return re.sub(r'<.*?>|&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-f]{1,6});', '', raw).strip()

def extract_info(text, loc_map):
    t = text.lower()
    ev_map = {
        "Evacuation": ["evacuate", "leave now", "citizens must leave", "evacuation", "emergency departure", "leave immediately", "urges citizens", "travel warning", "diplomatic exit", "security alert", "warns citizens", "orders citizens", "advice to leave", "flee"],
        "Naval": ["ship", "vessel", "navy", "maritime", "carrier", "destroyer", "frigate", "naval base", "black sea", "baltic", "mediterranean", "red sea", "houthi", "strait", "carrier group", "freedom of navigation", "submarine", "warship"],
        "Airstrike": ["airstrike", "missile", "rocket", "bombing", "strikes", "attack", "ballistic", "kinzhal", "iskander", "kalibr", "kh-101", "storm shadow", "himars", "patriot", "intercepted", "air defense", "scramble", "bomber"],
        "Explosion": ["explosion", "blast", "shelling", "artillery", "detonation", "shook", "smoke", "grad", "mlrs", "howitzer", "mortar", "bombardment"],
        "Drone": ["drone", "uav", "shahed", "fpv", "kamikaze", "unmanned aerial", "reconnaissance", "electronic warfare", "jamming"],
        "Clashes": ["clashes", "fighting", "battle", "siege", "frontline", "tank", "combat", "soldiers", "infantry", "offensive", "war", "invasion", "military drills", "nato", "pentagon", "mobilization", "deployment", "suwalki gap"],
        "Nuclear": ["nuclear", "atomic", "radiation", "npp", "icbm", "uranium", "reactor", "zaporizhzhia npp", "iaea", "fallout", "deterrence"]
    }
    f_city, f_reg, f_type = None, "World", "Breaking News"
    for reg, cities in loc_map.items():
        for c in cities:
            if c.lower() in t: f_city, f_reg = c.capitalize(), reg; break
        if f_city: break
    if not f_city:
        for reg, cities in loc_map.items():
            if reg.lower() in t: f_city, f_reg = cities[0], reg; break
    for ev, keys in ev_map.items():
        if any(k in t for k in keys): f_type = ev; break
    return f_city, f_reg, f_type

def get_coords(city, reg):
    cl = city.lower()
    if cl in LOCATION_CACHE: return LOCATION_CACHE[cl][0], LOCATION_CACHE[cl][1]
    try:
        time.sleep(1.5)
        l = geolocator.geocode(f"{city}, {reg}", timeout=10)
        if l:
            LOCATION_CACHE[cl] = [l.latitude, l.longitude]
            return l.latitude, l.longitude
    except: pass
    return None, None

def run_bot():
    new_found = []
    db = {
        "Ukraine": ["Kyiv", "Kharkiv", "Odesa", "Lviv", "Donetsk", "Zaporizhzhia", "Pokrovsk", "Vovchansk", "Kramatorsk", "Sumy"],
        "Russia": ["Moscow", "Sevastopol", "Belgorod", "Engels", "Kursk", "Rostov", "Novorossiysk", "St. Petersburg"],
        "Israel": ["Tel Aviv", "Jerusalem", "Haifa", "Gaza", "Ashdod", "Rafah", "Eilat"],
        "Iran": ["Tehran", "Isfahan", "Bushehr", "Tabriz", "Mashhad", "Shiraz", "Bandar Abbas"],
        "USA": ["Washington", "New York", "Pentagon", "Norfolk", "San Diego", "Alaska", "Hawaii"],
        "China": ["Beijing", "Shanghai", "Taiwan Strait", "South China Sea", "Hainan", "Fujian"],
        "Europe": ["Brussels", "Warsaw", "Rzeszow", "Bucharest", "Berlin", "Sofia", "Paris", "London", "Poland", "Romania", "Finland", "Sweden", "Bulgaria"],
        "Middle East": ["Beirut", "Tyre", "Sidon", "Damascus", "Aleppo", "Latakia", "Red Sea", "Yemen", "Sanaa"],
        "Asia": ["Tokyo", "Seoul", "Pyongyang", "Manila", "Afghanistan", "Pakistan"],
        "Africa": ["Khartoum", "Mogadishu", "Niamey", "Bamako", "Ouagadougou", "Sudan", "Somalia", "Mali", "Niger", "Burkina Faso", "Libya", "Tripoli"],
        "Red Sea Region": ["Bab el-Mandeb", "Djibouti", "Eritrea"]
    }
    print("📡 SCANNING GLOBAL SOURCES...")
    for url in FEEDS:
        dom = url.split('/')[2]
        try:
            r = requests.get(url, headers={'User-Agent': USER_AGENT}, timeout=15)
            if r.status_code != 200: continue
            items = []
            if "xml" in r.headers.get('Content-Type', '').lower() or url.endswith('.xml'):
                root = ET.fromstring(r.content)
                for i in root.findall('.//item')[:15]:
                    t_el, d_el, l_el = i.find('title'), i.find('description'), i.find('link')
                    if t_el is not None:
                        items.append({'t': clean_html(t_el.text), 'd': clean_html(d_el.text) if d_el is not None else "", 'l': l_el.text if l_el is not None else url})
            else:
                soup = BeautifulSoup(r.content, 'html.parser')
                for tag in soup.find_all(['h2', 'h3'])[:15]:
                    items.append({'t': clean_html(tag.text), 'd': f"Report from {dom}", 'l': url})
            for it in items:
                if len(it['t']) < 20: continue
                city, reg, ev = extract_info(it['t'] + " " + it['d'], db)
                if city:
                    lat, lon = get_coords(city, reg)
                    if lat and lon:
                        new_found.append({
                            "country": reg, "city": city, "lat": lat, "lon": lon, "date": time.strftime("%Y-%m-%d %H:%M:%S"),
                            "type": ev, "title": it['t'][:120], "description": it['d'][:450], "fatalities": "0", "link": it['l']
                        })
                        print(f"✅ {ev}: {city}")
        except: pass

    if new_found:
        events = {}
        if os.path.exists('conflicts.json'):
            try:
                with open('conflicts.json', 'r', encoding='utf-8') as f:
                    for e in json.load(f): events[e['title']] = e
            except: pass
        for e in new_found: events[e['title']] = e
        with open('conflicts.json', 'w', encoding='utf-8') as f:
            json.dump(list(events.values())[-120:], f, indent=4, ensure_ascii=False)
        print(f"📝 Saved {len(new_found)} updates.")

if __name__ == "__main__":
    run_bot()
