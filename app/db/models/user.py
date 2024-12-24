from db.database import User


User = User()

async def update_ip_user(data_ip, id_user: int):
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