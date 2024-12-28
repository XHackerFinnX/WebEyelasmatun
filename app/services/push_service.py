from datetime import datetime, timedelta
from app.services.bot_notice import send_message_record, send_message_record_admin
from app.db.models.user import update_status_record_user, profile_record_user
import asyncio

async def push_sms(id_user, date):
    
    text = f"Напоминаю {date.strftime('%d.%m.%Y %H:%M')}\nЗапись к Eyelasmatun"
    await send_message_record(id_user, text)
    
    user_info = await profile_record_user(id_user)
    admin_group = -1002034439978
    text_admin = f"ID: {user_info[0]['id']}\nКлиент: {user_info[0]['name']}\nТелеграмм: {user_info[0]['telegram']}\nВремя: {date.strftime('%d.%m.%Y %H:%M')}"
    await send_message_record_admin(admin_group, text_admin)
    
    date_r = date.date()
    time_r = date.isoformat()
    date_today = datetime.now()
    if date_today.date() == date.date():
        counting_down = date - date_today - timedelta(hours=1)
        await asyncio.sleep(counting_down.seconds)
        await send_message_record(id_user, text)
        await update_status_record_user(id_user, date_r, time_r)
        
    elif date_today.date() == date.date() - timedelta(days=1):
        counting_down = date - date_today - timedelta(hours=1)
        await asyncio.sleep(counting_down.seconds)
        await send_message_record(id_user, text)
        await update_status_record_user(id_user, date_r, time_r)
        
    elif date_today.date() < date.date():
        counting_down = date - date_today - timedelta(days=1)
        await asyncio.sleep(counting_down.seconds)
        await send_message_record(id_user, text)
        
        date_today = datetime.now()
        counting_down = date - date_today - timedelta(hours=1)
        await asyncio.sleep(counting_down.seconds)
        await send_message_record(id_user, text)
        await update_status_record_user(id_user, date_r, time_r)
        
    return
        