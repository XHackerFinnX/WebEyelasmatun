from psycopg2 import Error, InterfaceError
from db.database import Admin


Admin = Admin()

async def admin_add_windows_day(date, time):
    
    query = """
    INSERT INTO windows (
        date,
        time
    ) VALUES (%s, %s)
    """
    
    try:
        with Admin._connect() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (date, time))
            conn.commit()
    except (InterfaceError, Error) as error:
        print(f"Ошибка добавления окошек {error}")
    finally:
        if Admin._connection:
            Admin._connection.close()
                
        return
    

async def check_windows_day(date):
    
    query = """
    SELECT date
    FROM windows
    WHERE date = %s
    """
    
    try:
        with Admin._connect() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (date,))
                day = cursor.fetchone()
            conn.commit()
    except (InterfaceError, Error) as error:
        print(f"Ошибка проверки даты {error}")
    finally:
        if Admin._connection:
            Admin._connection.close()
                
        return day
    
    
async def update_windows_day(date, time):
    
    query = """
    UPDATE windows
    SET (date, time) = (%s, %s)
    WHERE date = %s
    """
    
    try:
        with Admin._connect() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (date, time, date))
            conn.commit()
    except (InterfaceError, Error) as error:
        print(f"Ошибка обновления окошек {error}")
    finally:
        if Admin._connection:
            Admin._connection.close()
                
        return
    

async def admin_delete_windows_day(date):
    
    query = """
    DELETE FROM windows
    WHERE date = %s
    """
    
    try:
        with Admin._connect() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (date,))
            conn.commit()
    except (InterfaceError, Error) as error:
        print(f"Ошибка удаления окошка {error}")
    finally:
        if Admin._connection:
            Admin._connection.close()
                
        return