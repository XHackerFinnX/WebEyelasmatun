from datetime import datetime, timedelta
from app.services.bot_notice import send_message_record, send_message_record_admin
from app.db.models.user import (update_status_record_user, profile_record_user,
                                last_record_user, update_profile_last_record_user,
                                check_record_user_before_notification, count_add_visits)
from app.utils.log import setup_logger
from zoneinfo import ZoneInfo
import asyncio

logger = setup_logger("Push")

async def push_sms(id_user, date):
    
    text = f"Напоминаю {date.strftime('%d.%m.%Y %H:%M')}\nЗапись к Eyelasmatun"
    await send_message_record(id_user, text)
    
    user_info = await profile_record_user(id_user)
    admin_group = -1002034439978
    text_admin = f"ID: {user_info[0]['id']}\nКлиент: {user_info[0]['name']}\nТелеграмм: {user_info[0]['telegram']}\nВремя: {date.strftime('%d.%m.%Y %H:%M')}"
    await send_message_record_admin(admin_group, text_admin)
    
    date_r = date.date()
    time_r = date.isoformat()
    piter_tz = ZoneInfo("Europe/Moscow")
    date_today = datetime.now(piter_tz)
    
    logger.info(f'Логин: {id_user} Дата записи: {date} Дата сегодня: {date_today}')
    
    if date_today.date() == date.date():
        counting_down = date - date_today - timedelta(hours=1)
        await asyncio.sleep(counting_down.seconds)
        
        # Проверка. Есть ли запись у клиента
        status = await check_record_user_before_notification(id_user, date_r, time_r)
        if not status:
            return

        # Отправка уведомления
        await send_message_record(id_user, text)
        
        #Обновление статуса - запись завершена
        await update_status_record_user(id_user, date_r, time_r)
        
        # Последняя записи дата
        last_r_user = await last_record_user(id_user)
        await update_profile_last_record_user(id_user, last_r_user[0]['date'])
        
        # Добавляется +1 к посещению
        await count_add_visits(id_user)
        
        logger.info(f'Уведомления 1 о записи прошло. Логин: {id_user} Дата записи: {date}')
        
    elif date_today.date() == date.date() - timedelta(days=1):
        counting_down = date - date_today - timedelta(hours=1)
        await asyncio.sleep(counting_down.seconds)
        
        # Проверка. Есть ли запись у клиента
        status = await check_record_user_before_notification(id_user, date_r, time_r)
        if not status:
            return

        # Отправка уведомления
        await send_message_record(id_user, text)
        
        #Обновление статуса - запись завершена
        await update_status_record_user(id_user, date_r, time_r)
        
        # Последняя записи дата
        last_r_user = await last_record_user(id_user)
        await update_profile_last_record_user(id_user, last_r_user[0]['date'])
        
        # Добавляется +1 к посещению
        await count_add_visits(id_user)
        
        logger.info(f'Уведомления 2 о записи прошло. Логин: {id_user} Дата записи: {date}')
        
    elif date_today.date() < date.date():
        counting_down = date - date_today - timedelta(days=1)
        await asyncio.sleep(counting_down.seconds)
        await send_message_record(id_user, text)
        
        logger.info(f'Уведомления 3.1 о записи прошло. Логин: {id_user} Дата записи: {date}')

        
        date_today = datetime.now(piter_tz)
        counting_down = date - date_today - timedelta(hours=1)
        await asyncio.sleep(counting_down.seconds)
        
        # Проверка. Есть ли запись у клиента
        status = await check_record_user_before_notification(id_user, date_r, time_r)
        if not status:
            return

        # Отправка уведомления
        await send_message_record(id_user, text)
        
        #Обновление статуса - запись завершена
        await update_status_record_user(id_user, date_r, time_r)
        
        # Последняя записи дата
        last_r_user = await last_record_user(id_user)
        await update_profile_last_record_user(id_user, last_r_user[0]['date'])
        
        # Добавляется +1 к посещению
        await count_add_visits(id_user)
        
        logger.info(f'Уведомления 3.2 о записи прошло. Логин: {id_user} Дата записи: {date}')
        
    return


async def push_sms_technic(id_user, date):
    
    text = f"Напоминаю {date.strftime('%d.%m.%Y %H:%M')}\nЗапись к Eyelasmatun"
    
    date_r = date.date()
    time_r = date.isoformat()
    piter_tz = ZoneInfo("Europe/Moscow")
    date_today = datetime.now(piter_tz)
    
    logger.info(f'Логин: {id_user} Дата записи: {date} Дата сегодня: {date_today}')
    
    if date_today.date() == date.date():
        counting_down = date - date_today - timedelta(hours=1)
        if counting_down.seconds < 0:
            
            # Отправка уведомления
            await send_message_record(id_user, text)
            
            #Обновление статуса - запись завершена
            await update_status_record_user(id_user, date_r, time_r)
            
            # Последняя записи дата
            last_r_user = await last_record_user(id_user)
            await update_profile_last_record_user(id_user, last_r_user[0]['date'])
            
            # Добавляется +1 к посещению
            await count_add_visits(id_user)
            logger.info(f'Уведомления -1 Запись прошла. Логин: {id_user} Дата записи: {date}')
        else:
            
            # Проверка. Есть ли запись у клиента
            status = await check_record_user_before_notification(id_user, date_r, time_r)
            if not status:
                return
            
            await asyncio.sleep(counting_down.seconds)
            # Отправка уведомления
            await send_message_record(id_user, text)
            
            #Обновление статуса - запись завершена
            await update_status_record_user(id_user, date_r, time_r)
            
            # Последняя записи дата
            last_r_user = await last_record_user(id_user)
            await update_profile_last_record_user(id_user, last_r_user[0]['date'])
            
            # Добавляется +1 к посещению
            await count_add_visits(id_user)
            
            logger.info(f'Уведомления 1 о записи прошло. Логин: {id_user} Дата записи: {date}')
        
    elif date_today.date() == date.date() - timedelta(days=1):
        counting_down = date - date_today - timedelta(hours=1)
        await asyncio.sleep(counting_down.seconds)
        
        # Проверка. Есть ли запись у клиента
        status = await check_record_user_before_notification(id_user, date_r, time_r)
        if not status:
            return

        # Отправка уведомления
        await send_message_record(id_user, text)
        
        #Обновление статуса - запись завершена
        await update_status_record_user(id_user, date_r, time_r)
        
        # Последняя записи дата
        last_r_user = await last_record_user(id_user)
        await update_profile_last_record_user(id_user, last_r_user[0]['date'])
        
        # Добавляется +1 к посещению
        await count_add_visits(id_user)
        
        logger.info(f'Уведомления 2 о записи прошло. Логин: {id_user} Дата записи: {date}')
        
    elif date_today.date() < date.date():
        counting_down = date - date_today - timedelta(days=1)
        await asyncio.sleep(counting_down.seconds)
        await send_message_record(id_user, text)
        
        logger.info(f'Уведомления 3.1 о записи прошло. Логин: {id_user} Дата записи: {date}')
        
        date_today = datetime.now(piter_tz)
        counting_down = date - date_today - timedelta(hours=1)
        await asyncio.sleep(counting_down.seconds)
        
        # Проверка. Есть ли запись у клиента
        status = await check_record_user_before_notification(id_user, date_r, time_r)
        if not status:
            return

        # Отправка уведомления
        await send_message_record(id_user, text)
        
        #Обновление статуса - запись завершена
        await update_status_record_user(id_user, date_r, time_r)
        
        # Последняя записи дата
        last_r_user = await last_record_user(id_user)
        await update_profile_last_record_user(id_user, last_r_user[0]['date'])
        
        # Добавляется +1 к посещению
        await count_add_visits(id_user)
        
        logger.info(f'Уведомления 3.2 о записи прошло. Логин: {id_user} Дата записи: {date}')
        
    return
        