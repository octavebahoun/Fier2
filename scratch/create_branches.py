import urllib.request
import json

base_url = 'https://backend-fieri.vercel.app'
branches_to_create = [
    "Robotique et Automatisation",
    "Informatique Industrielle & IoT",
    "Éco-Énergie & Climatisation",
    "Construction 4.0",
    "Intelligence Artificielle",
    "Innovation Tech & Entrepreneuriat"
]

universities = [1, 2, 3, 4, 5, 6]

print("Starting to synchronize academic branches with the six R&D clubs...")

for uni_id in universities:
    print(f"Processing university ID {uni_id}...")
    
    # 1. Fetch existing branches to avoid duplicates
    get_url = f"{base_url}/universities/{uni_id}/branches"
    try:
        with urllib.request.urlopen(get_url) as res:
            existing = json.loads(res.read().decode('utf-8'))
            existing_names = [b['name'] for b in existing.get('data', [])]
    except Exception as e:
        print(f"  Error fetching branches for university {uni_id}: {e}")
        existing_names = []

    # 2. Post new branches
    for branch_name in branches_to_create:
        if branch_name in existing_names:
            print(f"  Branch '{branch_name}' already exists, skipping.")
            continue
            
        data = {
            "name": branch_name,
            "universityId": uni_id
        }
        json_data = json.dumps(data).encode('utf-8')
        
        req_post = urllib.request.Request(
            f"{base_url}/branches",
            data=json_data,
            headers={'Content-Type': 'application/json'}
        )
        
        try:
            with urllib.request.urlopen(req_post) as res_post:
                res_body = json.loads(res_post.read().decode('utf-8'))
                if res_body.get('success'):
                    print(f"  Successfully created branch '{branch_name}'.")
                else:
                    print(f"  Failed to create branch '{branch_name}': {res_body}")
        except Exception as e:
            print(f"  Error creating branch '{branch_name}': {e}")

print("Synchronization complete!")
