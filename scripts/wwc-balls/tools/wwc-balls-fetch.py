#!/usr/bin/env python3
"""Throttled, cached Wikimedia fetcher for the Women's World Cup ball references (Oct 6 2026).

Shares the lock-file throttle with the other Wikimedia fetchers (THROTTLE in scripts/fetch-coach-photos.py): at most one
request every 3 s to any Wikimedia host across all runners (house rule after the Oct 6 429s); an HTTP 429 stops the run
(no retry: Wikimedia is then off for the day), responses cached by
sha1(url). Generic User-Agent only.
usage: python3 scripts/wwc-balls/tools/wwc-balls-fetch.py <cache-dir> api '<query-string>'   -> prints JSON
       python3 scripts/wwc-balls/tools/wwc-balls-fetch.py <cache-dir> get <url> <out-file>   -> downloads a file
"""
import fcntl, hashlib, os, sys, tempfile, time, urllib.error, urllib.parse, urllib.request, re

THROTTLE_FILE = os.path.join(tempfile.gettempdir(), 'futbol-wikimedia-throttle.lock')
UA = 'FutbolIsland/1.0'
GAP = 3.0


def slot():
    with open(THROTTLE_FILE, 'a+') as fh:
        fcntl.flock(fh, fcntl.LOCK_EX)
        fh.seek(0)
        try:
            last = float(fh.read().strip() or 0)
        except ValueError:
            last = 0.0
        wait = last + GAP - time.time()
        if wait > 0:
            time.sleep(wait)
        fh.seek(0)
        fh.truncate()
        fh.write(repr(time.time()))
        fh.flush()
        fcntl.flock(fh, fcntl.LOCK_UN)


PAUSE_UNTIL = 1791306360  # 2026-10-06 10:06 PDT: coordinator's Wikimedia pause


def get(cache, url):
    os.makedirs(cache, exist_ok=True)
    path = os.path.join(cache, hashlib.sha1(url.encode()).hexdigest())
    if os.path.exists(path):
        return open(path, 'rb').read()
    if time.time() < PAUSE_UNTIL:
        raise RuntimeError('Wikimedia paused until 10:06 PDT (not cached: %s)' % url)
    host = urllib.parse.urlparse(url).netloc
    assert re.search(r'(^|\.)(wikipedia|wikimedia)\.org$', host), host
    for _ in range(4):
        slot()
        try:
            data = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60).read()
            open(path, 'wb').write(data)
            return data
        except urllib.error.HTTPError as e:
            if e.code == 429:
                sys.stderr.write('429: stopping, no more Wikimedia requests today\n'); sys.exit(42)
            if e.code >= 500:
                time.sleep(30); continue
            raise
    raise RuntimeError('gave up: ' + url)


if __name__ == '__main__':
    cache, mode = sys.argv[1], sys.argv[2]
    if mode == 'api':
        sys.stdout.write(get(cache, 'https://commons.wikimedia.org/w/api.php?format=json&' + sys.argv[3]).decode())
    else:
        open(sys.argv[4], 'wb').write(get(cache, sys.argv[3]))
