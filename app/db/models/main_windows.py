from psycopg2 import Error, InterfaceError
from datetime import datetime
from app.db.database import Windows

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
    SET time = $1
    WHERE date = $2
    """
    
    try:
        pool = await Win.connect()
        async with pool.acquire() as conn:
            await conn.execute(query, time, date)
    except Exception as error:
        print(f"Ошибка обновления времени для окошка: {error}")
        
        
async def price_list_load():
    
    query = """
    SELECT id_name, name, price
    FROM price_list
    """
    
    try:
        pool = await Win.connect()
        async with pool.acquire() as conn:
            pricel = await conn.fetch(query)
            return pricel
    except Exception as error:
        print(f"Ошибка получения прайс листа: {error}")
        return None
    
    
async def price_list_add(id_name: int, name: str, price: int):
    
    query = """
    INSERT INTO price_list (
        id_name, name, price
    ) VALUES ($1, $2, $3)
    """
    
    try:
        pool = await Win.connect()
        async with pool.acquire() as conn:
            await conn.execute(query, id_name, name, price)
    except Exception as error:
        print(f"Ошибка добавление прайс листа: {error}")
        

async def price_list_check(id_name: int):
    
    query = """
    SELECT id_name, name, price
    FROM price_list
    WHERE id_name = $1
    """
    
    try:
        pool = await Win.connect()
        async with pool.acquire() as conn:
            price_check = await conn.fetch(query, id_name)
            return True if price_check else False
    except Exception as error:
        print(f"Ошибка проверки прайс листа: {error}")
        return None
    
    
async def price_list_update(id_name: int, name: str, price: int):
    
    query = """
    UPDATE price_list
    SET (name, price) = ($1, $2)
    WHERE id_name = $3
    """
    
    try:
        pool = await Win.connect()
        async with pool.acquire() as conn:
            await conn.execute(query, name, price, id_name)
    except Exception as error:
        print(f"Ошибка обновления прайс листа: {error}")
        
        
async def price_list_delete(id_name: int):
    
    query = """
    DELETE FROM price_list
    WHERE id_name = $1
    """
    
    try:
        pool = await Win.connect()
        async with pool.acquire() as conn:
            await conn.execute(query, id_name)
    except Exception as error:
        print(f"Ошибка удаления прайс листа: {error}")
        
        
async def price_list_select_user():
    
    query = """
    SELECT id_name, name, price
    FROM price_list
    """
    
    try:
        pool = await Win.connect()
        async with pool.acquire() as conn:
            pricel = await conn.fetch(query)
            return pricel
    except Exception as error:
        print(f"Ошибка получения прайс листа для клиентов: {error}")
        return None