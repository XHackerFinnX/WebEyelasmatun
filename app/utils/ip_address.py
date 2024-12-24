from db.models.user import update_ip_user
import httpx
import asyncio

async def get_ip(data, login):
    await asyncio.sleep(2)
    try:
        ip_address = data['ip']
        url = f"http://ip-api.com/json/{ip_address}"

        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            if response.status_code == 200:
                ip_data = response.json()
                
                data_ip = [
                    ip_data['query'],
                    ip_data['city'],
                    ip_data['regionName'],
                    ip_data['country'],
                    (ip_data['lat'], ip_data['lon'])
                ]

                await update_ip_user(data_ip, login)
            else:
                print("Ошибка получения данных:", response.status_code)
    except KeyError:
        print("Ошибка: В данных отсутствует ключ 'ip'")
    except Exception as e:
        print(f"Ошибка в get_ip: {e}")