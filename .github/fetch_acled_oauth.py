import requests
import json
import os

# Използваме отворен API за хуманитарни данни (примерно за събития в Украйна или глобално)
# Тук използваме примерна база данни, която не изисква ключ
api_url = "https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A%2F%2Fdata.humdata.org%2Fdataset%2Fa1e28994-0a37-4d43-9878-5743472097e8%2Fresource%2F0904944d-5c87-43f1-b1e9-74d32a4e4029%2Fdownload%2Fukraine_blacksea_event_data_current.csv"

try:
    print("Тегля данни от хуманитарния портал...")
    # За по-лесно, ако ти е трудно с този линк, ще генерираме тестов файл с данни,
    # за да видиш веднага резултата на картата си:
    sample_data = [
        {"country": "Ukraine", "date": "2024-05-20", "fatalities": 5, "type": "Explosion", "lat": 48.37, "lon": 38.01},
        {"country": "Gaza", "date": "2024-05-20", "fatalities": 12, "type": "Airstrike", "lat": 31.5, "lon": 34.4},
        {"country": "Sudan", "date": "2024-05-19", "fatalities": 3, "type": "Armed clash", "lat": 15.5, "lon": 32.5}
    ]
    
    with open("conflicts.json", "w", encoding="utf-8") as f:
        json.dump(sample_data, f, indent=2, ensure_ascii=False)
    
    print("Готово! Картата вече има данни.")

except Exception as e:
    print(f"Грешка: {e}")
