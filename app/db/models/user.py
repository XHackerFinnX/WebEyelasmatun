from app.db.database import User


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
    

async def select_record_user(id_user: int):
    
    query = """
    SELECT id, date, time, comment_user
    FROM record_user
    WHERE id = $1 AND status = true
    """
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            users = await conn.fetch(query, id_user)
            return users if users else None
    except Exception as error:
        print(f"Ошибка получения записей клиента: {error}")
        return None
    

async def delete_record_user(id_user: int, date, time):
    
    query = """
    DELETE FROM record_user
    WHERE id = $1 AND date = $2 AND time = $3
    """
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            await conn.execute(query, id_user, date, time)
            return True
    except Exception as error:
        print(f"Ошибка удаления записи клиента: {error}")
        return False
    
    
async def update_status_record_user(id_user: int, date, time):
    
    query = """
    UPDATE record_user
    SET status = false
    WHERE id = $1 AND date = $2 AND time = $3
    """
    
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            await conn.execute(query, id_user, date, time)
            return True
    except Exception as error:
        print(f"Ошибка обновления статуса: {error}")
        return False
    

async def profile_record_user(id_user: int):
    
    query = """
    SELECT id, name, telegram
    FROM profile_user
    WHERE id = $1
    """
    
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            users = await conn.fetch(query, id_user)
            return users
    except Exception as error:
        print(f"Ошибка получения профиля клиента: {error}")
        return None
    

async def technical_record_user():
    
    query = """
    SELECT id, date, time
    FROM record_user
    WHERE status = true
    """
    
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            users = await conn.fetch(query)
            return users
    except Exception as error:
        print(f"Ошибка получения записей клиента: {error}")
        return None
    
    
async def last_record_user(id_user: int):
    
    query = """
    SELECT date
    FROM record_user
    WHERE id = $1 AND status = false
    ORDER BY date DESC
    LIMIT 1
    """
    
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            last_r_user = await conn.fetch(query, id_user)
            return last_r_user
    except Exception as error:
        print(f"Ошибка получения последней записи клиента: {error}")
        return None
    
    
async def update_profile_last_record_user(id_user: int, date):
    
    query = """
    UPDATE profile_user
    SET last_entry = $1
    WHERE id = $2
    """
    
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            await conn.execute(query, date, id_user)
            return True
    except Exception as error:
        print(f"Ошибка обновления последней записи: {error}")
        return False
    
    
async def check_record_user_before_notification(id_user: int, date, time):
    
    query = """
    SELECT status 
    FROM record_user
    WHERE id = $1 AND date = $2 AND time = $3
    """
    
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            record_user = await conn.fetch(query, id_user, date, time)
            return record_user
    except Exception as error:
        print(f"Ошибка обновления статуса: {error}")
        return False
    
    
async def count_add_visits(id_user: int):
    
    query = """
    SELECT quantity_visits
    FROM profile_user
    WHERE id = $1
    """
    
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            count_visits = await conn.fetch(query, id_user)
    except Exception as error:
        print(f"Ошибка получения количества посещений: {error}")
        count_visits = 0
    
    cv = count_visits[0]['quantity_visits'] + 1
    
    query = """
    UPDATE profile_user
    SET quantity_visits = $1
    WHERE id = $2
    """
    
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            await conn.execute(query, cv, id_user)
            return True
    except Exception as error:
        print(f"Ошибка обновления количества посещений: {error}")
        return False
    

async def count_del_visits(id_user: int):
    
    query = """
    SELECT quantity_cancel
    FROM profile_user
    WHERE id = $1
    """
    
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            count_del = await conn.fetch(query, id_user)
    except Exception as error:
        print(f"Ошибка получения количества отмен: {error}")
        count_del = 0
    
    cd = count_del[0]['quantity_cancel'] + 1
    
    query = """
    UPDATE profile_user
    SET quantity_cancel = $1
    WHERE id = $2
    """
    
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            await conn.execute(query, cd, id_user)
            return True
    except Exception as error:
        print(f"Ошибка обновления количества отмен: {error}")
        return False
    
    
async def get_photo_from_db(user_id: int):

    query = """
    SELECT name, data 
    FROM photo_user
    WHERE id = $1
    """
    
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            result = await conn.fetchrow(query, user_id)
            if result:
                return result["name"], result["data"]
            return None, None
    except Exception as error:
        print(f"Ошибка получения фотографии: {error}")
        
        
async def add_feedback_user(id_user: int, text_feedback: str, stars: int, date_feedback):
    
    query = """
    SELECT count_feedback
    FROM feedback_user
    WHERE id = $1
    ORDER BY count_feedback DESC
    LIMIT 1
    """
    
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            result = await conn.fetchrow(query, id_user)
    except Exception as error:
        print(f"Ошибка получения количества отзывов: {error}")
        
    count_feedback = 1
    if result:
        count_feedback = result["count_feedback"] + 1

    query = """
    SELECT quantity_visits, name
    FROM profile_user
    WHERE id = $1
    """
    
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            result = await conn.fetchrow(query, id_user)
    except Exception as error:
        print(f"Ошибка получения количества записей завершенных: {error}")
        
    count_visits = result["quantity_visits"]
    name_user = result["name"]
 
    if count_visits < count_feedback:
        return {'status': 'No feedback'}
    
    else:
        query = """
        INSERT INTO feedback_user (id, name, text_feedback, stars, count_feedback, date_feedback)
        VALUES ($1, $2, $3, $4, $5, $6)
        """
        
        try:
            pool = await User.connect()
            async with pool.acquire() as conn:
                await conn.execute(query, id_user, name_user, text_feedback, stars, count_feedback, date_feedback)
                return {'status': 'feedback'}
        except Exception as error:
            print(f"Ошибка добавления отзыва: {error}")
            
            
async def all_feedback_user():
    
    query = """
    SELECT id, name, text_feedback, stars, date_feedback
    FROM feedback_user
    """
    
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            all_feedback = await conn.fetch(query)
            return all_feedback
    except Exception as error:
        print(f"Ошибка получения отзывов клиентов: {error}")
        return []
    
    
async def select_user_photo():

    query = """
    SELECT id
    FROM photo_user
    """
    
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            check_id = await conn.fetch(query)
            if check_id:
                return check_id
            else:
                return []
    except Exception as error:
        print(f"Ошибка получения id фотографий клиентов: {error}")
        return []
    
    
async def notification_feedback_user(id_user: int):
    
    query = """
    SELECT notification_feedback
    FROM profile_user
    WHERE id = $1
    """
    
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            check_notif = await conn.fetchrow(query, id_user)
            return check_notif
    except Exception as error:
        print(f"Ошибка получения статуса уведомления: {error}")
        return False
    
    
async def notification_user_false(id_user: int):
    
    query = """
    UPDATE profile_user
    SET notification_feedback = false
    WHERE id = $1
    """
    
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            await conn.execute(query, id_user)
    except Exception as error:
        print(f"Ошибка обновление статуса уведомлений на false: {error}")
        
    return True


async def notification_user_true(id_user: int):
    
    query = """
    UPDATE profile_user
    SET notification_feedback = true
    WHERE id = $1
    """
    
    try:
        pool = await User.connect()
        async with pool.acquire() as conn:
            await conn.execute(query, id_user)
    except Exception as error:
        print(f"Ошибка обновление статуса уведомлений на true: {error}")
        
    return True