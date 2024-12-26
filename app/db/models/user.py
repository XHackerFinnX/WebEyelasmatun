from db.database import User


User = User()

async def select_profile_user(id_user: int):
    
    query = """
    SELECT
        id,
        name,
        telegram,
        telephone
    FROM profile_user
    WHERE id = $1
    """
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            users = await conn.fetch(query, id_user)
            return users[0]
    except Exception as error:
        print(f"Ошибка получения профиля клиента: {error}")
        return None
        

async def update_ip_user(data_ip: list, id_user: int):
    
    query = """
    UPDATE profile_user
    SET ip_address = $1
    WHERE id = $2
    """
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            await conn.execute(query, data_ip, id_user)
    except Exception as error:
        print(f"Ошибка обновления IP-адреса: {error}")
        
async def update_last_visit_user(date, id_user: int):
    
    query = """
    UPDATE profile_user
    SET last_site_visit = $1
    WHERE id = $2
    """
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            await conn.execute(query, date, id_user)
    except Exception as error:
        print(f"Ошибка обновления последнего визита: {error}")
        
async def update_name_user(name: str, id_user: int):
    
    query = """
    UPDATE profile_user
    SET name = $1
    WHERE id = $2
    """
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            await conn.execute(query, name, id_user)
    except Exception as error:
        print(f"Ошибка обновления имени: {error}")
    
async def update_telegram_user(telegram: str, id_user: int):
    
    query = """
    UPDATE profile_user
    SET telegram = $1
    WHERE id = $2
    """
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            await conn.execute(query, telegram, id_user)
    except Exception as error:
        print(f"Ошибка обновления телеграмма: {error}")
    
async def update_telephone_user(telephone: str, id_user: int):
    
    query = """
    UPDATE profile_user
    SET telephone = $1
    WHERE id = $2
    """
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            await conn.execute(query, telephone, id_user)
    except Exception as error:
        print(f"Ошибка обновления номера телефона: {error}")
        
        
async def add_record_user(id_user: int, date, time, comment_user, status: bool):
    
    query = """
    INSERT INTO record_user (id, date, time, comment_user, status)
    VALUES ($1, $2, $3, $4, $5)
    """
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            await conn.execute(query, id_user, date, time.isoformat(), comment_user, status)
            return True
    except Exception as error:
        print(f"Ошибка добавление записи клиента: {error}")
        return None
    

async def check_record_time(id_user: int, date, time):
    
    query = """
    SELECT id
    FROM record_user
    WHERE id = $1 AND date = $2 AND time = $3
    """
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            check_time = await conn.fetch(query, id_user, date, time.isoformat())

            return check_time if check_time else None
    except Exception as error:
        print(f"Ошибка проверки записи на это время: {error}")
        return None