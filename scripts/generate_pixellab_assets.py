import os
import time
import base64
import requests

API_KEY = "e0dd0f1f-975b-4bf8-b389-e9268ded44a2"
URL = "https://api.pixellab.ai/v1/generate-image-pixflux"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

ASSETS = [
    # Animals
    {"folder": "animals", "id": "sheep", "prompt": "cute fluffy white wool sheep standing, 16-bit top-down RPG pixel art"},
    {"folder": "animals", "id": "cow", "prompt": "black and white dairy cow standing, 16-bit top-down RPG pixel art"},
    {"folder": "animals", "id": "chicken", "prompt": "little white chicken with red comb, 16-bit top-down RPG pixel art"},
    {"folder": "animals", "id": "pig", "prompt": "cute pink farm pig standing, 16-bit top-down RPG pixel art"},

    # Blacksmith & Sawmill
    {"folder": "props", "id": "anvil", "prompt": "blacksmith iron anvil on wooden tree stump, 16-bit top-down RPG pixel art"},
    {"folder": "props", "id": "forge", "prompt": "stone blacksmith forge furnace with glowing red hot fire, 16-bit top-down RPG pixel art"},
    {"folder": "props", "id": "grindstone", "prompt": "sharpening grindstone wheel on wooden stand, 16-bit top-down RPG pixel art"},
    {"folder": "props", "id": "sawmill_logs", "prompt": "neat stack of cut wooden timber logs, 16-bit top-down RPG pixel art"},

    # Training Yard
    {"folder": "props", "id": "archery_target", "prompt": "round red white archery target on wooden tripod stand, 16-bit top-down RPG pixel art"},
    {"folder": "props", "id": "training_dummy", "prompt": "straw training combat dummy with wooden cross arms, 16-bit top-down RPG pixel art"},
    {"folder": "props", "id": "weapon_rack", "prompt": "wooden weapon rack holding iron swords and spears, 16-bit top-down RPG pixel art"},

    # Barn & Pasture Props
    {"folder": "props", "id": "hay_bale", "prompt": "golden rectangular hay bale of dry straw, 16-bit top-down RPG pixel art"},
    {"folder": "props", "id": "water_trough", "prompt": "wooden livestock water feeding trough, 16-bit top-down RPG pixel art"},

    # Tavern & Town Props
    {"folder": "props", "id": "stone_well", "prompt": "medieval stone water well with bucket and wooden roof, 16-bit top-down RPG pixel art"},
    {"folder": "props", "id": "street_lamp", "prompt": "iron street lantern lamppost with glowing warm lantern, 16-bit top-down RPG pixel art"},
    {"folder": "props", "id": "barrel", "prompt": "wooden oak barrel with iron hoops, 16-bit top-down RPG pixel art"},
    {"folder": "props", "id": "crate", "prompt": "wooden storage cargo crate, 16-bit top-down RPG pixel art"},
    {"folder": "props", "id": "tavern_table", "prompt": "round wooden tavern table with ale tankards and chairs, 16-bit top-down RPG pixel art"},
    {"folder": "props", "id": "fireplace", "prompt": "indoor stone fireplace with burning logs and fire, 16-bit top-down RPG pixel art"},

    # Townsfolk & NPCs
    {"folder": "npcs", "id": "blacksmith", "prompt": "chibi burly blacksmith in brown leather apron holding hammer, 16-bit top-down RPG pixel art"},
    {"folder": "npcs", "id": "barkeep", "prompt": "chibi friendly tavern barkeep wearing vest holding beer mug, 16-bit top-down RPG pixel art"},
    {"folder": "npcs", "id": "farmer", "prompt": "chibi farmer with straw hat and blue overalls holding pitchfork, 16-bit top-down RPG pixel art"},
    {"folder": "npcs", "id": "guard", "prompt": "chibi kingdom royal guard in steel armor and red plume helm with spear, 16-bit top-down RPG pixel art"}
]

def generate_asset(item):
    folder = os.path.join("assets/images/pixellab", item["folder"])
    os.makedirs(folder, exist_ok=True)
    out_path = os.path.join(folder, f"{item['id']}.png")
    
    if os.path.exists(out_path) and os.path.getsize(out_path) > 0:
        print(f"[SKIP] {item['id']} already exists at {out_path}")
        return True

    print(f"[GENERATING] {item['id']} ({item['prompt']})...")
    payload = {
        "description": item["prompt"],
        "image_size": {"width": 32, "height": 32},
        "no_background": True
    }
    
    for attempt in range(3):
        try:
            r = requests.post(URL, headers=HEADERS, json=payload, timeout=30)
            if r.status_code == 200:
                data = r.json()
                img_bytes = base64.b64decode(data["image"]["base64"])
                with open(out_path, "wb") as f:
                    f.write(img_bytes)
                print(f"[SUCCESS] Saved {out_path} ({len(img_bytes)} bytes)")
                return True
            elif r.status_code == 429:
                print(f"[RATE LIMIT] Waiting 5 seconds before retry...")
                time.sleep(5)
            else:
                print(f"[ERROR] {r.status_code}: {r.text}")
                time.sleep(2)
        except Exception as e:
            print(f"[EXCEPTION] {e}, retrying in 3s...")
            time.sleep(3)
            
    return False

def main():
    print(f"Starting PixelLab Batch Generation for {len(ASSETS)} assets...")
    start_time = time.time()
    success_count = 0
    
    for item in ASSETS:
        if generate_asset(item):
            success_count += 1
        # Gentle pacing between requests
        time.sleep(1.0)
        
    duration = time.time() - start_time
    print(f"Finished! Successfully generated {success_count}/{len(ASSETS)} assets in {duration:.1f}s.")

if __name__ == "__main__":
    main()
