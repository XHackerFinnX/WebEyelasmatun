from app.db.database import Authentication

Auth = Authentication()

async def user_check_authentication(username: int, password: str):
    
    query = """
    SELECT login
    FROM authentication 
    WHERE login = $1
    AND password = $2
    """
    
    try:
        pool = await Auth.connect()
        async with pool.acquire() as conn:
            login = await conn.fetchrow(query, username, password)
            return login
    except Exception as error:
        print(f"Ошибка проверки пользователя аутентификация: {error}")
        return []
        
        
async def update_authentication(username: int, status: bool, last_date):
    
    query = """
    UPDATE authentication
    SET (status, last_date) = ($1, $2)
    WHERE login = $3
    """
            
    try:
        pool = await Auth.connect()
        async with pool.acquire() as conn:
            await conn.execute(query, status, last_date, username)
    except Exception as error:
        print(f"Ошибка обновления пользователя аутентификация: {error}")
            

async def status_authentication(username: int, password: str):
    
    query = """
    SELECT blacklist FROM (SELECT a.login, p.blacklist
    FROM authentication AS a
    JOIN profile_user AS p
    ON a.login = p.id
    WHERE a.login = $1 AND a.password = $2)
    """
    
    try:
        pool = await Auth.connect()
        async with pool.acquire() as conn:
            status = await conn.fetchrow(query, username, password)
            return status
    except Exception as error:
        print(f"Ошибка проверки статуса пользователя аутентификация: {error}")
        return [True]
    
    
async def synchronic_status_authentication(username: int, password: str):
    
    query = """
    SELECT blacklist FROM (SELECT a.login, p.blacklist
    FROM authentication AS a
    JOIN profile_user AS p
    ON a.login = p.id
    WHERE a.login = $1 AND a.password = $2)
    """
    
    try:
        pool = await Auth.connect()
        async with pool.acquire() as conn:
            status = await conn.fetchrow(query, username, password)
            return status
    except Exception as error:
        print(f"Ошибка проверки статуса пользователя аутентификация: {error}")
        return None