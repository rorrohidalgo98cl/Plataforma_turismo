
import asyncio
import asyncpg
from datetime import date

async def test():
    DB_URL = "postgresql://postgres@localhost/turismo_mvp"
    conn = await asyncpg.connect(DB_URL)
    
    d = date.fromisoformat('2026-05-04')
    print(f"Type of d: {type(d)}")
    print(f"Value of d: {d}")
    
    try:
        # Test a simple insert or select with date
        res = await conn.fetchval("SELECT $1::DATE", d)
        print(f"Success: {res}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(test())
