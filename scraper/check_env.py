import sys
print(f"Python: {sys.version}")

try:
    import playwright
    print(f"Playwright: instalado OK")
except ImportError as e:
    print(f"Playwright: ERROR - {e}")

try:
    import bs4
    print(f"BeautifulSoup4: {bs4.__version__}")
except ImportError as e:
    print(f"BeautifulSoup4: ERROR - {e}")

try:
    import asyncpg
    print(f"asyncpg: {asyncpg.__version__}")
except ImportError as e:
    print(f"asyncpg: ERROR - {e}")

try:
    import psycopg2
    print(f"psycopg2: {psycopg2.__version__}")
except ImportError as e:
    print(f"psycopg2: ERROR - {e}")

try:
    import sqlalchemy
    print(f"SQLAlchemy: {sqlalchemy.__version__}")
except ImportError as e:
    print(f"SQLAlchemy: ERROR - {e}")

try:
    import httpx
    print(f"httpx: {httpx.__version__}")
except ImportError as e:
    print(f"httpx: ERROR - {e}")

print("\n--- Verificando browser Chromium ---")
try:
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("https://example.com")
        title = page.title()
        browser.close()
    print(f"Chromium: OK (titulo: {title})")
except Exception as e:
    print(f"Chromium: ERROR - {e}")
