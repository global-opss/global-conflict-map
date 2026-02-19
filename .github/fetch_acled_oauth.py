import requests
import json
import os

email = os.environ.get("ACLED_EMAIL")
password = os.environ.get("ACLED_PASSWORD")

token_resp = requests.post(
    "https://acleddata.com/oauth/token",
    data={"username": email, "password": password, "grant_type": "password", "client_id": "acled"}
)
token_resp.raise_for_status()
access_token = token_resp.json().get("access_token")

headers = {"Authorization": f"Bearer {access_token}"}
api_url = "https://api.acleddata.com/acled/read?limit=500"
response = requests.get(api_url, headers=headers)
response.raise_for_status()
data = response.json()

events = []
for item in data.get("data", []):
    events.append({
        "country": item.get("country"),
        "date": item.get("event_date"),
        "fatalities": item.get("fatalities") or 0,
        "actor1": item.get("actor1"),
        "actor2": item.get("actor2"),
        "lat": item.get("geo_lat"),
        "lon": item.get("geo_lon")
    })

with open("conflicts.json", "w", encoding="utf-8") as f:
    json.dump(events, f, indent=2)

print(f"Fetched {len(events)} events from ACLED.")
