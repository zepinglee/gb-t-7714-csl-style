from collections import OrderedDict
import json

json_path = 'gbt7714-numeric-data.json'

with open(json_path) as f:
    data = json.load(f)

def get_sort_key(item):
    if item[0] == 'id':
        return '00'
    elif item[0] == 'type':
        return '01'
    else:
        return str.casefold(item[0])

data = [OrderedDict(sorted(item.items(), key=get_sort_key)) for item in data]

with open(json_path, 'w') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)
