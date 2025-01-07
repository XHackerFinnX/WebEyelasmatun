from fastapi import APIRouter, Request, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from app.routers.auth_rout import get_current_user
from datetime import datetime, timedelta
from app.db.models.main_windows import (windows_day, windows_day_time, 
                                    price_list_load, price_list_add, 
                                    price_list_check, price_list_update, price_list_delete,
                                    price_list_select_user, price_list_price)
from app.db.models.user import update_last_visit_user, add_record_user, check_record_time
from app.db.models.admin import (select_day_time, update_windows_day,
                                 admin_delete_windows_day, admin_list,
                                 select_user_all)
from app.utils.ip_address import get_ip
from app.services.push_service import push_sms
from app.services.bot_notice import send_message_mail_notification_price
from app.utils.log import setup_logger

import asyncio

router = APIRouter(
    prefix="",
    tags=["Main"]
)

logger = setup_logger("Main")

class RecordUser(BaseModel):
    date: str
    time: str
    comment: str
    
class ToDay(BaseModel):
    today: str
    
class TimeDay(BaseModel):
    time: str
    
class PriceItem(BaseModel):
    id: int
    name: str
    price: int

templates_main = Jinja2Templates(directory=r"./app/templates/main")
templates_auth = Jinja2Templates(directory=r"./app/templates/auth")

@router.get("/favicon.ico")
async def favicon():

    return FileResponse("app/static/images/favicon.ico")

@router.get('/')
async def main_get(request: Request, user: dict = Depends(get_current_user)):
    
    if user:
        
        admin_list_super = [i[0] for i in await admin_list('superadmin')]
        admin_list_normal = [i[0] for i in await admin_list('admin')]
        admin_list_full = admin_list_super + admin_list_normal
        
        if user in admin_list_full:
            userP = "admin/" + str(user)
            admin_or_user = 'admin'
            
        else:
            userP = "users/" + str(user)
            admin_or_user = 'user'
        
        logger.info(f"Пользователь зашел на главную страницу. логин: {user}")
        return templates_main.TemplateResponse(
            "main.html",
            {
                "request": request,
                "user": userP,
                "admin_or_user": admin_or_user
            }
        )
    
    else:
        return templates_auth.TemplateResponse("auth.html", {"request": request})
    

@router.post('/date_record')
async def date_record(tod: ToDay, user: dict = Depends(get_current_user)):
    
    dates = [(d['date'] - timedelta(days=1)).strftime("%Y-%m-%d") for d in await windows_day()]
    date_today = datetime.now()
    
    asyncio.create_task(update_last_visit_user(date_today, user))
    
    return JSONResponse(content={"dates": dates})


@router.post('/time_record')
async def time_record(timeday: TimeDay):
    
    times = await windows_day_time(datetime.strptime(timeday.time, "%Y-%m-%d") + timedelta(days=1))

    return JSONResponse(content={"times_r": times['time']})

    
@router.post('/record')
async def record_post(request: Request, data_record: RecordUser, user: dict = Depends(get_current_user)):
    
    if user:
        logger.info(f"Пользователь отправил запрос на запись {data_record}. логин: {user}")
        date_r = datetime.strptime(data_record.date, '%Y-%m-%d') + timedelta(days=1)
        time_r = datetime.strptime(data_record.time, '%H:%M')
        date_full = datetime.combine(date_r, time_r.time())
        comment_r = data_record.comment or '-'
        
        await asyncio.sleep(3)
        
        date_today = datetime.now()
        date_minus_hours_3 = date_full - timedelta(hours=3)

        logger.info(f'Дата записи {date_full}, дата сегодня {date_today}, дата -3 часа {date_minus_hours_3}. логин: {user}')
        if date_today > date_full:
            logger.warning(f"Ошибка записи. Пользователь пытался записаться date_today > date_full {date_today} > {date_full}. логин: {user}")
            return JSONResponse(content={"success": False})
        
        if date_today > date_minus_hours_3:
            return JSONResponse(content={"success": False})
        
        try:
            logger.info(f'Проверка окошки для записи. логин: {user}')
            if await check_record_time(user, date_r, date_full) is None:
                logger.info(f'Добавление записи пользователя. логин: {user}')
                await add_record_user(user, date_r, date_full, comment_r, True)
                
                time_list: list = await select_day_time(date_r)
                
                for t in time_list:
                    if t == data_record.time:
                        time_list.remove(t)
                        await update_windows_day(date_r, time_list)
                        
                if not time_list:
                    await admin_delete_windows_day(date_r)
                    
                asyncio.create_task(push_sms(user, date_full))
                
                logger.info(f'Отправка уведомления и успешная запись. логин: {user}')
                return JSONResponse(content={"success": True})
            else:
                logger.warning(f'Окошка для записи нет. логин: {user}')
                return JSONResponse(content={"success": False})
        except:
            logger.error(f'Ошибка записи на время {data_record}. логин: {user}')
            return JSONResponse(content={"success": False})
        
    else:
        return templates_auth.TemplateResponse("auth.html", {"request": request})
    
    
@router.get('/pricelist/admin/{username}')
async def pricelist_get(request: Request, username: int, user: dict = Depends(get_current_user)):
    
    if user:

        admin_list_super = [i[0] for i in await admin_list('superadmin')]
        admin_list_normal = [i[0] for i in await admin_list('admin')]
        admin_list_full = admin_list_super + admin_list_normal
        
        if user in admin_list_full:
            userP = "admin/" + str(username)
            admin_or_user = 'admin'
            price_html = 'pricel.html'
            
        else:
            userP = "users/" + str(username)
            admin_or_user = 'user'
            price_html = 'pricelistuser.html'

        logger.info(f'Пользователь admin зашел на страницу Прайс-лист. логин: {user}')
        return templates_main.TemplateResponse(
            price_html,
            {
                "request": request,
                "user": userP,
                "admin_or_user": admin_or_user
            }
        )
    else:
        return templates_auth.TemplateResponse("auth.html", {"request": request})
    
    
@router.get('/pricelist/users/{username}')
async def pricelist_get(request: Request, username: int, user: dict = Depends(get_current_user)):
    
    if user:

        admin_list_super = [i[0] for i in await admin_list('superadmin')]
        admin_list_normal = [i[0] for i in await admin_list('admin')]
        admin_list_full = admin_list_super + admin_list_normal
        
        if user in admin_list_full:
            userP = "admin/" + str(username)
            admin_or_user = 'admin'
            price_html = 'pricel.html'
            
        else:
            userP = "users/" + str(username)
            admin_or_user = 'user'
            price_html = 'pricelistuser.html'
            pl_user = await price_list_select_user()

        logger.info(f'Пользователь user зашел на страницу Прайс-лист. логин: {user}')
        return templates_main.TemplateResponse(
            price_html,
            {
                "request": request,
                "user": userP,
                "admin_or_user": admin_or_user,
                "price_list_user": pl_user
            }
        )
    else:
        return templates_auth.TemplateResponse("auth.html", {"request": request})
    
    
@router.post("/save-ip")
async def save_ip(request: Request, user: dict = Depends(get_current_user)):
    data = await request.json()
    asyncio.create_task(get_ip(data, user))
    
    return {"status": "success"}


@router.post('/api/price-load-items')
async def price_load_post():
    
    logger.info("Отправлен запрос на загрузку прайс-листа для админа")
    price_list = await price_list_load()
    pl_list = []
    for pl in price_list:
        pl_dict = {
            'id': pl['id_name'],
            'name': pl['name'],
            'price': pl['price']
        }
        pl_list.append(pl_dict)
    
    logger.info("Запрос на загрузку прайс-листа выполнен")
    return JSONResponse(content=pl_list)
    

@router.post('/api/price-items')
async def price_save_post(data: PriceItem):
    
    logger.info(f"Отправлен запрос на сохранение прайса")
    if await price_list_check(data.id):
        
        price_update = await price_list_price(data.id, data.price)
        await price_list_update(data.id, data.name, data.price)

        if not price_update:
            print('Изменения в прайс-листе')
            logger.info('Отправка уведомления пользователем о изменении цены')
            id_user_all = await select_user_all()
            asyncio.create_task(send_message_mail_notification_price(id_user_all))
            logger.info('Отправка совершена')
            
    else:
        logger.info(f"Добавлен новый прайс")
        await price_list_add(data.id, data.name, data.price)
    
    return JSONResponse(content={'status': True})


@router.delete('/api/price-items/{itemId}')
async def price_delete(request: Request, itemId: int, user: dict = Depends(get_current_user)):
    
    admin_list_super = [i[0] for i in await admin_list('superadmin')]
    admin_list_normal = [i[0] for i in await admin_list('admin')]
    admin_list_full = admin_list_super + admin_list_normal
    
    if user:
        pass
    else:
        return templates_auth.TemplateResponse("auth.html", {"request": request})
    
    if user in admin_list_full:
        logger.info(f"Удаление одного пункта из прайс-листа. логин: {user}")
        await price_list_delete(itemId)
        return JSONResponse(content={'status': True})
    else:
        return JSONResponse(content={'status': False}, status_code=403)
    

@router.get('/contacts')
async def main_get(request: Request, user: dict = Depends(get_current_user)):
    
    if user:
        
        admin_list_super = [i[0] for i in await admin_list('superadmin')]
        admin_list_normal = [i[0] for i in await admin_list('admin')]
        admin_list_full = admin_list_super + admin_list_normal
        
        if user in admin_list_full:
            userP = "admin/" + str(user)
            admin_or_user = 'admin'
            
        else:
            userP = "users/" + str(user)
            admin_or_user = 'user'
        
        logger.info(f"Пользователь зашел на страницу Контакты. логин: {user}")
        return templates_main.TemplateResponse(
            "contacts.html",
            {
                "request": request,
                "user": userP,
                "admin_or_user": admin_or_user
            }
        )
    
    else:
        return templates_auth.TemplateResponse("auth.html", {"request": request})