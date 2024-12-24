from psycopg2 import Error, InterfaceError
from datetime import datetime
from db.database import User


User = User()

# async def add_user(
    
# ):

async def update_ip_user(data_ip: list, id_user: int):
    
    query = """
    UPDATE profile_user
    SET ip_address = %s
    WHERE id = %s
    """
    
    try:
        with User._connect() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (data_ip, id_user))
            conn.commit()
    except (InterfaceError, Error) as error:
        print(f"Ошибка обновления ip адреса {error}")
    finally:
        if User._connection:
            User._connection.close()
                
        return