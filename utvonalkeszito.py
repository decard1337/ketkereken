import json, sys, urllib.request

OSRM = "https://router.project-osrm.org"

def osrm_segment(a_lat, a_lng, b_lat, b_lng):
    url = (
        f"{OSRM}/route/v1/bicycle/"
        f"{a_lng},{a_lat};{b_lng},{b_lat}"
        f"?overview=full&geometries=geojson"
    )
    with urllib.request.urlopen(url, timeout=30) as r:
        data = json.loads(r.read().decode("utf-8"))
    coords = data["routes"][0]["geometry"]["coordinates"]
    return [[lat, lng] for (lng, lat) in coords]

def stitch(segments):
    out = []
    for seg in segments:
        if not seg:
            continue
        if out and seg[0] == out[-1]:
            out.extend(seg[1:])
        else:
            out.extend(seg)
    return out

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Használat: python build_route_osrm.py '[[lat,lng],[lat,lng],...]'")
        sys.exit(1)

    waypoints = json.loads(sys.argv[1])
    if len(waypoints) < 2:
        print("Legalább 2 waypoint kell.")
        sys.exit(1)

    segments = []
    for i in range(len(waypoints) - 1):
        a_lat, a_lng = waypoints[i]
        b_lat, b_lng = waypoints[i + 1]
        segments.append(osrm_segment(a_lat, a_lng, b_lat, b_lng))

    full = stitch(segments)
    print(json.dumps(full, ensure_ascii=False))