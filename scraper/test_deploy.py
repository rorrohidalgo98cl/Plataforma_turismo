import sys
import traceback

print("--- TESTING IMPORTS ---")
try:
    import scrapling
    print("Scrapling imported successfully.")
except Exception as e:
    print("Failed to import scrapling:")
    traceback.print_exc()

try:
    from scrapling import StealthyFetcher
    print("StealthyFetcher imported successfully.")
except Exception as e:
    print("Failed to import StealthyFetcher:")
    traceback.print_exc()

try:
    import server
    print("server.py imported successfully.")
except Exception as e:
    print("Failed to import server.py:")
    traceback.print_exc()
    sys.exit(1)

print("--- TESTING COMPLETE ---")
