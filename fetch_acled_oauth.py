import json
import os
import time

# ПЪТ ДО ТВОЯ ФАЙЛ
JSON_FILE = 'conflicts.json'

def maintain_manual_control():
    """
    Този скрипт само поддържа структурата. 
    Той НЯМА да променя нищо, ако ти вече си сложил новина.
    """
    
    # 1. Проверяваме дали файлът съществува
    if os.path.exists(JSON_FILE):
        with open(JSON_FILE, 'r', encoding='utf-8') as f:
            try:
                current_data = json.load(f)
            except:
                current_data = []
    else:
        current_data = []

    # 2. Ако файлът е празен, създаваме само скелет (празен шаблон)
    if not current_data:
        template = [{
            "id": "0000",
            "alert_level": "NORMAL",
            "active": False,
            "sound_alarm": False,
            "title": "SYSTEM READY - Awaiting Manual Input",
            "breaking_news": "",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%00Z")
        }]
        with open(JSON_FILE, 'w', encoding='utf-8') as f:
            json.dump(template, f, indent=4)
        print("✅ Празен шаблон е създаден. Системата чака твоя намеса.")
    else:
        # АКО ВЪТРЕ ИМА ДАННИ, БОТЪТ НЕ ПРАВИ НИЩО!
        # Така твоята новина за Афганистан няма да бъде презаписана.
        print("📡 Ръчни данни открити. Ботът остава в режим на изчакване.")

if __name__ == "__main__":
    while True:
        maintain_manual_control()
        # Проверява на всеки 60 секунди, но не променя нищо, ако ти си сложил новина
        time.sleep(60)
