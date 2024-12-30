from app.config.config import config
from app.db.models.user import notification_user_true

import requests
import asyncio

API_URL = 'https://api.telegram.org/bot'

async def send_message_mail(chat_id_list: list, chat_id_admin: list, text: str):
    
    mail_yes = 0
    mail_no = 0
    list_chat_id = []
    
    for chat_id in chat_id_list:
        print(chat_id[0])
        try:
            message = f'{API_URL}{config.BOT_TOKEN.get_secret_value()}/sendMessage?chat_id={chat_id[0]}&text={text}'
            requests.get(message)
            mail_yes += 1
        except:
            mail_no += 1
            list_chat_id.append(chat_id)
        await asyncio.sleep(0.5)
    
    text = f"Рассылку получили:\nВсего пользователей: {mail_yes+mail_no}\nПолучили: {mail_yes}\nНе получили: {mail_no}"
    
    for admin_id in chat_id_admin:
        
        try:
            message = f'{API_URL}{config.BOT_TOKEN.get_secret_value()}/sendMessage?chat_id={admin_id}&text={text}'
            requests.get(message)
        except:
            print('Админа нет')
        await asyncio.sleep(0.5)
    
    return


async def send_message_private(chat_id: int, admin_id: int, text: str):
    
    try:
        message = f'{API_URL}{config.BOT_TOKEN.get_secret_value()}/sendMessage?chat_id={chat_id}&text={text}'
        requests.get(message)
        text = "Сообщение клиент получил!"
    except:
        text = "Сообщение клиент не получил! Возможно клиент заблокировал бота."
    

    message = f'{API_URL}{config.BOT_TOKEN.get_secret_value()}/sendMessage?chat_id={admin_id}&text={text}'
    requests.get(message)
    
    return


async def send_message_delete_admin(chat_id: int, text: str):

    try:
        message = f'{API_URL}{config.BOT_TOKEN.get_secret_value()}/sendMessage?chat_id={chat_id}&text={text}'
        requests.get(message)
    except:
        pass
    
    return


async def send_message_delete_user(admin_id: int, text: str):
    
    message = f'{API_URL}{config.BOT_TOKEN.get_secret_value()}/sendMessage?chat_id={admin_id}&text={text}'
    requests.get(message)

    return


async def send_message_record(chat_id: int, text: str):
    
    try:
        message = f'{API_URL}{config.BOT_TOKEN.get_secret_value()}/sendMessage?chat_id={chat_id}&text={text}'
        requests.get(message)
    except:
        pass
    
    return
    
    
async def send_message_record_admin(admin_id: int, text: str):
    

    message = f'{API_URL}{config.BOT_TOKEN.get_secret_value()}/sendMessage?chat_id={admin_id}&text={text}'
    requests.get(message)

    return


async def send_message_mail_notification_price(chat_id_list: list):
    
    text = "Изменение цены в прайс-листе"
    
    for chat_id in chat_id_list:
        try:
            message = f'{API_URL}{config.BOT_TOKEN.get_secret_value()}/sendMessage?chat_id={chat_id[0]}&text={text}'
            requests.get(message)
        except:
            pass
        await notification_user_true(chat_id[0])
        await asyncio.sleep(0.5)
        
    return