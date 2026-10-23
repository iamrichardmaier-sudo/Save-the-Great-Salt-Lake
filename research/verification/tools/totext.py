import sys
from bs4 import BeautifulSoup
html = open(sys.argv[1], 'rb').read().decode('utf-8', 'replace')
soup = BeautifulSoup(html, 'html.parser')
for t in soup(['script', 'style', 'noscript', 'svg']): t.decompose()
text = soup.get_text('\n')
lines = [l.strip() for l in text.splitlines()]
out = '\n'.join(l for l in lines if l)
open(sys.argv[2], 'w').write(out)
