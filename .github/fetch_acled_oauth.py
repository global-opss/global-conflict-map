import requests
import json
import os

# ACLED изискват вашия Email и API Key (който те наричат "Key")
email = os.environ.get("ACLED_EMAIL")
key = os.environ.get("ACLED_PASSWORD") # Ще използваме същия secret за ключа

# Директно правим заявка към API-то (без сложния OAuth процес)
# Тук добавяме параметри, за да вземем последните 500 събития
api_url = f"https://api.acleddata.com/acled/read?email={email}&key={key}&limit=500"

try:
    print("Опит за изтегляне на данни от ACLED...")
    response = requests.get(api_url)
    response.raise_for_status()
    data = response.json()

    events = []
    # ACLED връща данните в обект "data"
    for item in data.get("data", []):
        events.append({
            "country": item.get("country"),
            "date": item.get("event_date"),
            "fatalities": int(item.get("fatalities") or 0),
            "type": item.get("event_type"),
            "actor1": item.get("actor1"),
            "actor2": item.get("actor2"),
            "lat": float(item.get("latitude")),
            "lon": float(item.get("longitude"))
        })

    with open("conflicts.json", "w", encoding="utf-8") as f:
        json.dump(events, f, indent=2, ensure_ascii=False)

    print(f"Успех! Изтеглени са {len(events)} събития.")

except Exception as e:
    print(f"Грешка при изтеглянето: {e}")
    # Създаваме празен файл, за да не гърми сайта, ако API-то откаже
    if not os.path.exists("conflicts.json"):
        with open("conflicts.json", "w") as f:
            json.dump([], f)
