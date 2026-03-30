import cloudscraper
import os
import re
import time

# Read the ruby file
with open('db/seed_pixabay_profiles.rb', 'r') as f:
    content = f.read()

urls = re.findall(r'"(https://cdn\.pixabay\.com/photo/[^"]+)"', content)
print(f"Found {len(urls)} URLs")

os.makedirs('/tmp/pixabay_avatars', exist_ok=True)
scraper = cloudscraper.create_scraper()

for i, url in enumerate(urls):
    filename = url.split('/')[-1]
    filepath = f'/tmp/pixabay_avatars/{filename}'
    if not os.path.exists(filepath):
        res = scraper.get(url)
        if res.status_code == 200:
            with open(filepath, 'wb') as f:
                f.write(res.content)
            print(f"[{i+1}/{len(urls)}] Downloaded {filename}")
        else:
            print(f"[{i+1}/{len(urls)}] Failed {filename}: {res.status_code}")
        time.sleep(0.1)
    else:
        print(f"[{i+1}/{len(urls)}] Skipped {filename}")
