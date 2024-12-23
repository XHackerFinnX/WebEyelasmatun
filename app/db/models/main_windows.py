from psycopg2 import Error, InterfaceError
from datetime import datetime
from db.database import Windows


Win = Windows()

async def windows_day():
    
    query = """
    SELECT date
    FROM eye_windows
    WHERE date >= %s
    """
    
    try:
        with Win._connect() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (datetime.today(),))
                day = cursor.fetchall()
            conn.commit()
    except (InterfaceError, Error) as error:
        print(f"Ошибка получения дат для отображения свободных окошек {error}")
    finally:
        if Win._connection:
            Win._connection.close()
                
        return day
    

async def windows_day_time(date):
    
    query = """
    SELECT time
    FROM eye_windows
    WHERE date = %s
    """
    
    try:
        with Win._connect() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (date,))
                time = cursor.fetchone()
            conn.commit()
    except (InterfaceError, Error) as error:
        print(f"Ошибка получения времени для окошек {error}")
    finally:
        if Win._connection:
            Win._connection.close()
                
        return time[0]