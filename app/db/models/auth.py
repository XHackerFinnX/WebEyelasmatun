import psycopg2
from psycopg2 import Error, InterfaceError
from config.config import config
from collections import namedtuple
from datetime import datetime
from db.database import Authentication

Auth = Authentication()

async def user_check_authentication(username: int, password: str):
    
    query = """
    SELECT login
    FROM authentication 
    WHERE login = %s
    AND password = %s
    """
    
    try:
        with Auth._connect() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (username, password))
                login = cursor.fetchone()
            conn.commit()
    except (InterfaceError, Error) as error:
        print(f"Ошибка проверки пользователя аутентификация {error}")
    finally:
        if Auth._connection:
            Auth._connection.close()
                
        return login
        
        
async def update_authentication(username: int, status: bool, last_date):
    
    query = """
    UPDATE authentication
    SET (status, last_date) = (%s, %s)
    WHERE login = %s
    """
    
    try:
        with Auth._connect() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (status, last_date, username))
            conn.commit()
    except (InterfaceError, Error) as error:
        print(f"Ошибка обновления пользователя аутентификация {error}")
    finally:
        if Auth._connection:
            Auth._connection.close()