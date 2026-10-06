#!/usr/bin/env python3
"""Run the portfolio locally so the gallery can discover every image automatically."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PORT = 8000

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

if __name__ == '__main__':
    print(f'Portfolio: http://localhost:{PORT}')
    print('Press Ctrl+C to stop the server.')
    ThreadingHTTPServer(('127.0.0.1', PORT), Handler).serve_forever()
