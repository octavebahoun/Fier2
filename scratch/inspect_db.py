import urllib.request
import json

base_url = 'https://backend-fieri.vercel.app'

def get_json(url):
    try:
        with urllib.request.urlopen(url) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

countries = get_json(f"{base_url}/countries")
if countries and countries.get('success'):
    for country in countries['data']:
        c_id = country['id']
        c_name = country['name']
        print(f"Country {c_name} (ID: {c_id})")
        
        unis = get_json(f"{base_url}/countries/{c_id}/universities")
        if unis and unis.get('success'):
            for uni in unis['data']:
                u_id = uni['id']
                u_name = uni['name']
                print(f"  University {u_name} (ID: {u_id})")
                
                branches = get_json(f"{base_url}/universities/{u_id}/branches")
                if branches and branches.get('success'):
                    for br in branches['data']:
                        print(f"    Branch {br['name']} (ID: {br['id']})")
