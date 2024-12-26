from psycopg2 import Error, InterfaceError
from datetime import datetime
from db.database import Windows

Win = Windows()

async def windows_day():
    
    query = """
    SELECT date
    FROM windows
    WHERE date >= $1
    """
    
    try:
        pool = await Win.connect()
        async with pool.acquire() as conn:
            day = await conn.fetch(query, datetime.today().date())
            return day
    except Exception as error:
        print(f"Ошибка получения дат для отображения свободных окошек: {error}")
        return None
    

async def windows_day_time(date):
    
    query = """
    SELECT time
    FROM windows
    WHERE date = $1
    """
    
    try:
        pool = await Win.connect()
        async with pool.acquire() as conn:
            time = await conn.fetch(query, date)
            return time[0]
    except Exception as error:
        print(f"Ошибка получения времени для окошек: {error}")
        return None
    

async def update_time_in_day(date, time):
    
    query = """
    UPDATE windows
    SET time = %s
    """