import requests, math, os
from PIL import Image, ImageDraw, ImageFont

# ========================
# CONFIG
# ========================

COLOR_BG = (20, 20, 20)
COLOR_1 = (235, 235, 235)
COLOR_2 = (80, 80, 80)
COLOR_TEXT = (235, 235, 235)
BOTTOM_MARGIN = 600  # extra space for IATA + name
FONT_1 = "Skyfont-NonCommercial.otf"  # IATA font
FONT_2 = "sans-serif.ttf"  # Airport name font
TEXT_MARGIN = 50  # spacing between IATA and name


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FONT_PATH = os.path.join(BASE_DIR, FONT_1)
NAME_FONT_PATH = os.path.join(BASE_DIR, FONT_2)  # Airport name font
# Get input and split by commas
icaos = input("Which airport(s)? (ICAO, comma-separated): ").upper().split(",")

# Remove extra whitespace around each ICAO
icaos = [code.strip() for code in icaos]

# Loop through all ICAO codes
for icao in icaos:
    API_URL = f"https://openairportmap.org/api/airport/{icao}"

    # ========================
    # DOWNLOAD DATA
    # ========================

    print("Downloading airport data...")
    r = requests.get(API_URL, timeout=120)
    r.raise_for_status()
    data = r.json()
    elements = data["elements"]



    # ========================
    # GET IATA CODE AND AIRPORT NAME
    # ========================

    iata_code = ""
    airport_name = ""
    city = ""
    for el in elements:
        if "tags" in el:
            if "name:en" in el["tags"]:
                iata_code = el["tags"].get("iata") or icao
                airport_name = el["tags"].get("name:en") or iata_code or icao
                city = el["tags"].get("closest_town") or el["tags"].get("addr:city") or ""

    if iata_code=="" or city=="": print(f"Current ICAO: {icao}")
    if iata_code=="": iata_code = input("IATA")
    if city=="": city = input("City: ")


    print(f"Using IATA: {iata_code}, Airport name: {airport_name}")


    # ========================
    # BUILD NODE DICTIONARY
    # ========================

    nodes = {el["id"]: (el["lon"], el["lat"]) for el in elements if el["type"] == "node"}

    # ========================
    # COMPUTE BOUNDING BOX WITHOUT TOP PADDING
    # ========================

    minlon = min(lon for lon, lat in nodes.values())
    maxlon = max(lon for lon, lat in nodes.values())
    minlat = min(lat for lon, lat in nodes.values())
    maxlat = max(lat for lon, lat in nodes.values())

    TOP_PAD = 0.00
    minlat -= 0
    maxlat += TOP_PAD

    central_lat = (minlat + maxlat) / 2
    cos_lat = math.cos(math.radians(central_lat))
    scaled_minlon = minlon * cos_lat
    scaled_maxlon = maxlon * cos_lat
    lon_range = scaled_maxlon - scaled_minlon
    lat_range = maxlat - minlat

    MAX_DIM = 1800
    scale = MAX_DIM / max(lon_range, lat_range)
    WIDTH = int(lon_range * scale)
    HEIGHT = int(lat_range * scale) + BOTTOM_MARGIN

    def transform(lon, lat):
        x = int((lon * cos_lat - scaled_minlon) * scale)
        y = int((maxlat - lat) * scale)
        return x, y

    # ========================
    # IMAGE SETUP
    # ========================

    img = Image.new("RGB", (WIDTH, HEIGHT), COLOR_BG)
    draw = ImageDraw.Draw(img)

    # ========================
    # DRAW WAYS
    # ========================

    for el in elements:
        if el["type"] != "way":
            continue

        tags = el.get("tags", {})
        nodes_list = el["nodes"]

        aeroway = tags.get("aeroway", "")
        building = "building" in tags

        if aeroway == "apron":
            color, width = COLOR_2, 20
        elif aeroway == "taxiway":
            color, width = COLOR_1, 4
        elif aeroway == "runway":
            color, width = COLOR_1, 20
        elif building:
            color, width = COLOR_1, 1
        else:
            continue

        points = [transform(*nodes[nid]) for nid in nodes_list if nid in nodes]
        if len(points) < 2:
            continue

        if points[0] == points[-1]:
            draw.polygon(points, fill=color)
        else:
            draw.line(points, fill=color, width=width)

    # ========================
    # ADD IATA TEXT (CENTERED UNDER IMAGE)
    # ========================

    initial_font_size = 300
    iata_font = ImageFont.truetype(FONT_PATH, initial_font_size)
    target_width = WIDTH * 0.5
    bbox = iata_font.getbbox(iata_code)
    text_width = bbox[2] - bbox[0]

    while text_width > target_width:
        initial_font_size -= 2
        iata_font = ImageFont.truetype(FONT_PATH, initial_font_size)
        bbox = iata_font.getbbox(iata_code)
        text_width = bbox[2] - bbox[0]

    text_height = bbox[3] - bbox[1]
    x_iata = (WIDTH - text_width) // 2
    y_iata = HEIGHT - BOTTOM_MARGIN + TEXT_MARGIN
    draw.text((x_iata, y_iata), iata_code, font=iata_font, fill=COLOR_TEXT)

    # ========================
    # ADD AIRPORT NAME (CENTERED UNDER IATA)
    # ========================

    name_font_size = 65
    name_font = ImageFont.truetype(NAME_FONT_PATH, name_font_size)
    bbox_name = name_font.getbbox(airport_name)
    name_width = bbox_name[2] - bbox_name[0]
    name_height = bbox_name[3] - bbox_name[1]

    x_name = (WIDTH - name_width) // 2
    y_name = y_iata + text_height + TEXT_MARGIN

    # Draw text multiple times for fake bold
    offsets = [(0,0), (1,0), (0,1), (1,1)]
    for ox, oy in offsets:
        draw.text((x_name + ox, y_name + oy), airport_name, font=name_font, fill=COLOR_TEXT)


    # Function to convert decimal to DMS
    def decimal_to_dms(decimal, is_lat=True):
        degrees = int(decimal)
        minutes_full = abs((decimal - degrees) * 60)
        minutes = int(minutes_full)
        seconds = (minutes_full - minutes) * 60
        hemi = ''
        if is_lat:
            hemi = "N" if decimal >= 0 else "S"
        else:
            hemi = "E" if decimal >= 0 else "W"
        return f"{abs(degrees)}°{minutes}'{seconds:.2f}\"{hemi}"

    # Compute center coordinates (average of all nodes)
    center_lon = sum(lon for lon, lat in nodes.values()) / len(nodes)
    center_lat = sum(lat for lon, lat in nodes.values()) / len(nodes)

    # Convert to DMS
    lat_dms = decimal_to_dms(center_lat, is_lat=True)
    lon_dms = decimal_to_dms(center_lon, is_lat=False)
    coord_text = f"{lat_dms}, {lon_dms}"

    # ========================
    # ADD CENTER COORDINATES (CENTERED UNDER AIRPORT NAME) WITH LINES
    # ========================

    coord_font_size = 30
    coord_font = ImageFont.truetype(NAME_FONT_PATH, coord_font_size)
    bbox_coord = coord_font.getbbox(coord_text)
    coord_width = bbox_coord[2] - bbox_coord[0]
    coord_height = bbox_coord[3] - bbox_coord[1]

    x_coord = (WIDTH - coord_width) // 2
    y_coord = y_name + name_height + TEXT_MARGIN  # spacing under airport name

    # Draw the coordinate text
    draw.text((x_coord, y_coord), coord_text, font=coord_font, fill=COLOR_TEXT)

    # Draw horizontal lines on both sides
    LINE_LENGTH = 50  # pixels for each side
    LINE_THICKNESS = 3

    # Left line
    x1_start = x_coord - LINE_LENGTH - 20  # 20 px gap
    y1 = y_coord + coord_height // 2
    x1_end = x_coord - 20
    draw.line([(x1_start, y1), (x1_end, y1)], fill=COLOR_TEXT, width=LINE_THICKNESS)

    # Right line
    x2_start = x_coord + coord_width + 20
    x2_end = x2_start + LINE_LENGTH
    y2 = y1
    draw.line([(x2_start, y2), (x2_end, y2)], fill=COLOR_TEXT, width=LINE_THICKNESS)

    # ========================
    # ADD CITY, COUNTRY (CENTERED UNDER COORDINATES)
    # ========================

    # Font for city/country
    city_font_size = 60
    city_font = ImageFont.truetype(NAME_FONT_PATH, city_font_size)
    bbox_city = city_font.getbbox(city)
    city_width = bbox_city[2] - bbox_city[0]
    city_height = bbox_city[3] - bbox_city[1]

    x_city = (WIDTH - city_width) // 2
    y_city = y_coord + coord_height + TEXT_MARGIN-20  # spacing below coordinates

    draw.text((x_city, y_city), city, font=city_font, fill=COLOR_TEXT)


    # ========================
    # SAVE OUTPUT
    # ========================

    
    if not os.path.exists(BASE_DIR+"\\generated\\"):
        os.makedirs(BASE_DIR+"\\generated\\")
    img.save(f"{BASE_DIR}\\generated\\{icao}_map.png")
    print(f"Saved generated\\{icao}_map.png")
