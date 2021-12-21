import json

import pandas

df = pandas.read_csv("imdb.csv")

actors = []

for row in df.iterrows():
    r = row[1]
    actor = {}
    actor["name"] = r["actor"]
    actor["link"] = r["link-href"]

    parts = r["image-src"].split("._V1_")
    if len(parts) == 1:
        raise Exception("broken actor url", r["image-src"], parts)
    start = parts[0]
    actor["image"] = f"{start}.jpg"

    actors.append(actor)

print(actors)


with open("actors.json", "w") as f:
    f.write(json.dumps(actors))
