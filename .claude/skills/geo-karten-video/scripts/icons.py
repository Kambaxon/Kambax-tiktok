#!/usr/bin/env python3
"""OpenMoji-Icons (Flat, dicke dunkle Kontur = Referenz-Look) ins Projekt kopieren.

  python3 icons.py assets/icons bus=1F68C lkw="articulated lorry" geld="money with wings"
  python3 icons.py --suche "oil"          # Treffer auflisten
"""
import json, os, shutil, sys
C = os.path.expanduser("~/.cache/geo-karten/node_modules/openmoji")
D = json.load(open(f"{C}/data/openmoji.json"))
if sys.argv[1] == "--suche":
    q = sys.argv[2].lower()
    for e in D:
        if q in e["annotation"].lower() and "tone" not in e["annotation"]:
            print(e["hexcode"], e["annotation"])
    sys.exit()
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
for arg in sys.argv[2:]:
    name, key = arg.split("=", 1)
    hit = next((e for e in D if e["hexcode"] == key.upper() or e["annotation"] == key), None)
    if not hit: print("nicht gefunden:", key); continue
    shutil.copy(f"{C}/color/svg/{hit['hexcode']}.svg", f"{out}/{name}.svg"); print(f"{name}.svg <- {hit['annotation']}")
