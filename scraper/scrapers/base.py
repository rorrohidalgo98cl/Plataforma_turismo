"""
Estrategia de Scraping Sin Proxies — Plataforma Turismo MVP
============================================================
Dado que no contamos con presupuesto para proxies, implementamos una
estrategia "stealth" que minimiza la probabilidad de bloqueo:

1. FINGERPRINT REAL: Playwright con browser real (Chromium) + headers reales
2. DELAYS HUMANOS: Esperas aleatorias entre 1.5 - 4 segundos (patrón humano)
3. XHR INTERCEPTION: Capturamos respuestas JSON directamente (evita scraping HTML)
4. NETWORKIDLE: Esperamos a que la red esté estable antes de leer datos
5. ROTATE USER-AGENT: Rotación de agentes de usuario realistas
6. SESSION REUSE: Reutilizamos contextos de browser (menos huella de bot)
7. VIEWPORT REALISTA: Resoluciones reales de escritorio/móvil
8. TIMING HUMANO: Simulamos lectura, scroll y mouse movement
"""

import asyncio
import random
import logging
from playwright.async_api import async_playwright, Page, BrowserContext
from typing import Optional

logger = logging.getLogger(__name__)

# User Agents reales (Chrome en Windows/Mac/Linux)
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
]

# Viewports realistas
VIEWPORTS = [
    {"width": 1920, "height": 1080},
    {"width": 1440, "height": 900},
    {"width": 1366, "height": 768},
    {"width": 1280, "height": 800},
]


async def human_delay(min_ms: float = 1500, max_ms: float = 4000):
    """Simula el tiempo de lectura/reacción humana."""
    delay = random.uniform(min_ms, max_ms) / 1000
    await asyncio.sleep(delay)


async def human_scroll(page: Page):
    """Scroll suave y aleatorio para simular comportamiento humano."""
    scroll_amount = random.randint(300, 800)
    await page.evaluate(f"window.scrollBy(0, {scroll_amount})")
    await asyncio.sleep(random.uniform(0.5, 1.5))


async def create_stealth_context(playwright) -> tuple:
    """
    Crea un contexto de browser con configuración stealth.
    Sin plugins de pago, usando solo capacidades nativas de Playwright.
    """
    ua = random.choice(USER_AGENTS)
    viewport = random.choice(VIEWPORTS)

    browser = await playwright.chromium.launch(
        headless=True,
        args=[
            '--no-sandbox',
            '--disable-blink-features=AutomationControlled',  # Oculta flag de automatización
            '--disable-infobars',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-plugins-discovery',
            '--no-first-run',
            '--no-default-browser-check',
        ]
    )

    context = await browser.new_context(
        user_agent=ua,
        viewport=viewport,
        locale='es-CL',
        timezone_id='America/Santiago',
        # Headers que un navegador real enviaría
        extra_http_headers={
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'es-CL,es;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'upgrade-insecure-requests': '1',
        },
        # Permisos necesarios para sitios de viaje
        permissions=['geolocation'],
        geolocation={'latitude': -33.4489, 'longitude': -70.6693},  # Santiago, CL
    )

    # Inyectar script para ocultar señales de webdriver
    await context.add_init_script("""
        // Ocultar webdriver flag
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        
        // Simular plugins reales
        Object.defineProperty(navigator, 'plugins', {
            get: () => [
                { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
                { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
                { name: 'Native Client', filename: 'internal-nacl-plugin' },
            ]
        });
        
        // Ocultar automatización en languages
        Object.defineProperty(navigator, 'languages', {
            get: () => ['es-CL', 'es', 'en-US', 'en']
        });
        
        // Simular hardware concurrency real
        Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
        Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
        
        // Simular pantalla real
        Object.defineProperty(screen, 'colorDepth', { get: () => 24 });
    """)

    return browser, context


async def intercept_xhr_responses(page: Page, patterns: list[str]) -> list[dict]:
    """
    Intercepta respuestas XHR/Fetch que coincidan con los patrones.
    Es más eficiente y menos detectable que scraping HTML directo.
    """
    captured_responses = []

    async def handle_response(response):
        url = response.url
        if any(pattern in url for pattern in patterns):
            try:
                if 'application/json' in response.headers.get('content-type', ''):
                    data = await response.json()
                    captured_responses.append({
                        'url': url,
                        'data': data,
                    })
                    logger.info(f"✅ XHR capturado: {url[:80]}...")
            except Exception as e:
                logger.warning(f"⚠️ No se pudo parsear XHR {url}: {e}")

    page.on('response', handle_response)
    return captured_responses
