from psycopg2 import Error, InterfaceError
from db.database import Admin


Admin = Admin()


async def admin_list(status: str):
    
    query = """
    SELECT id
    FROM admin_list
    WHERE status = %s
    """
    
    try:
        with Admin._connect() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (status,))
                admin_l = cursor.fetchall()
            conn.commit()
    except (InterfaceError, Error) as error:
        print(f"Ошибка получения список админов {error}")
    finally:
        if Admin._connection:
            Admin._connection.close()
                
        return admin_l
    

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
    
    
async def select_day_time(date):
    
    query = """
    SELECT time
    FROM windows
    WHERE date = %s
    """
    
    try:
        with Admin._connect() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (date,))
                time_list = cursor.fetchone()
            conn.commit()
    except (InterfaceError, Error) as error:
        print(f"Ошибка проверки даты {error}")
    finally:
        if Admin._connection:
            Admin._connection.close()
                
        return time_list[0]
    
    
async def schedule_record_user(date):
    
    query = """
    SELECT ru.id, ru.time, ru.comment_user, pu.name, pu.telegram
    FROM record_user AS ru
    JOIN profile_user AS pu
    ON ru.id = pu.id
    WHERE ru.date = %s
    """
    
    try:
        with Admin._connect() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (date,))
                user_list = cursor.fetchall()
            conn.commit()
    except (InterfaceError, Error) as error:
        print(f"Ошибка получения клиентов {error}")
    finally:
        if Admin._connection:
            Admin._connection.close()
                
        return user_list
    

async def select_user_all():
    
    query = """
    SELECT id, name, telegram, telephone
    FROM profile_user
    """
    
    try:
        with Admin._connect() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query)
                user_list = cursor.fetchall()
            conn.commit()
    except (InterfaceError, Error) as error:
        print(f"Ошибка получения клиентов {error}")
    finally:
        if Admin._connection:
            Admin._connection.close()
                
        return user_list
    
    
async def select_user_all_blacklist_false():
    
    query = """
    SELECT id, name, telegram, telephone
    FROM profile_user
    WHERE blacklist = false
    """
    
    try:
        with Admin._connect() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query)
                user_list = cursor.fetchall()
            conn.commit()
    except (InterfaceError, Error) as error:
        print(f"Ошибка получения клиентов не в ЧС {error}")
    finally:
        if Admin._connection:
            Admin._connection.close()
                
        return user_list
    
    
async def select_user_all_blacklist_true():
    
    query = """
    SELECT id, name, telegram, telephone
    FROM profile_user
    WHERE blacklist = true
    """
    
    try:
        with Admin._connect() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query)
                user_list = cursor.fetchall()
            conn.commit()
    except (InterfaceError, Error) as error:
        print(f"Ошибка получения клиентов в ЧС {error}")
    finally:
        if Admin._connection:
            Admin._connection.close()
                
        return user_list
    

async def black_list_user(id_user: int, status: bool):
    
    query = """
    UPDATE profile_user
    SET blacklist = %s
    WHERE id = %s
    """
    
    try:
        with Admin._connect() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (status, id_user))
            conn.commit()
    except (InterfaceError, Error) as error:
        print(f"Ошибка обновления ЧС клиента {error}")
    finally:
        if Admin._connection:
            Admin._connection.close()
                
        return
    

async def select_user_all_delete():
    
    query = """
    SELECT p.id, p.name, p.telegram, p.telephone
    FROM profile_user AS p
    JOIN record_user AS r
    ON p.id = r.id
    WHERE r.status = true
    AND p.blacklist = false
    GROUP BY p.id
    """
    
    try:
        with Admin._connect() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query)
                user_list = cursor.fetchall()
            conn.commit()
    except (InterfaceError, Error) as error:
        print(f"Ошибка получения клиентов для удаления записи {error}")
    finally:
        if Admin._connection:
            Admin._connection.close()
                
        return user_list