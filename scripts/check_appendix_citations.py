"""Check that every bibliography entry in appendix/ is cited, and every citation is in the bibliography.

Citations are inline links of the form [Author, Year](url) in the tab files; the bibliography is
appendix/31-bibliography.md. Entries are matched by URL.
"""
import glob
import re
import sys

BIB = "appendix/31-bibliography.md"
CITE = re.compile(r"\[([^\]]+?, (?:n\.d\.|\d{4}[a-z]?))\]\((https?://[^)\s]+)\)")

cited = {}
for path in sorted(glob.glob("appendix/[0-9][0-9]-*.md")):
    if path == BIB:
        continue
    for label, url in CITE.findall(open(path, encoding="utf-8").read()):
        cited.setdefault(url, set()).add(label)

listed = set(re.findall(r"\]\((https?://[^)\s]+)\)", open(BIB, encoding="utf-8").read()))
# DOI links sit beside an entry's cited URL, so they are not entries of their own.
listed = {u for u in listed if not u.startswith("https://doi.org/")}

uncited = sorted(listed - set(cited))
missing = sorted(set(cited) - listed)
clashes = {u: l for u, l in cited.items() if len(l) > 1}
for u in uncited:
    print("in bibliography but never cited:", u)
for u in missing:
    print("cited but not in bibliography:", u, sorted(cited[u]))
for u, l in clashes.items():
    print("one URL, several labels:", u, sorted(l))
print(f"{len(cited)} cited sources, {len(listed)} bibliography entries")
sys.exit(1 if uncited or missing or clashes else 0)
