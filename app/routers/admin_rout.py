from fastapi import APIRouter, Request, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from pydantic import BaseModel
from typing import List
from app.routers.auth_rout import get_current_user
from datetime import datetime, timedelta
from app.db.models.admin import (admin_add_windows_day, check_windows_day,
                             update_windows_day, admin_delete_windows_day,
                             schedule_record_user, admin_list, select_user_all,
                             black_list_user, select_user_all_blacklist_true,
                             select_user_all_blacklist_false, select_user_all_delete,
                             select_user, select_history_user, update_history_user_comment_admin,
                             update_history_user_money, select_date_money)
from app.db.models.user import select_record_user, delete_record_user, technical_record_user
from app.db.models.main_windows import update_time_in_day, windows_day_time
from collections import namedtuple
from app.services.bot_notice import send_message_mail, send_message_private, send_message_delete_admin
from app.services.push_service import push_sms_technic

import calendar, locale
import asyncio

router = APIRouter(
    prefix="",
    tags=["Admin"]
)

class AddDay(BaseModel):
    date: str
    time_list: List[str]
    
class DelDay(BaseModel):
    date: str
    
class ScheduleDate(BaseModel):
    date: str
    
class SmsUser(BaseModel):
    clientId: int
    message: str
    
class MailBot(BaseModel):
    message: str
    
class BlackList(BaseModel):
    clientId: int
    
class DeleteUserRecord(BaseModel):
    appointmentId: str
    
class UpdateUserRecordAdmin(BaseModel):
    clientId: int
    date: str
    time: str
    update: List[str]
    
class DateRange(BaseModel):
    startDate: str
    endDate: str


templates_admin = Jinja2Templates(directory=r"./app/templates/admin")
templates_main = Jinja2Templates(directory=r"./app/templates/main")
templates_auth = Jinja2Templates(directory=r"./app/templates/auth")

locale.setlocale(locale.LC_ALL, 'ru_RU.UTF-8')

@router.get('/profile')
async def profile_error_get(request: Request, user: dict = Depends(get_current_user)):
    
    if user:
        return templates_main.TemplateResponse("error.html", {"request": request})
    
    else:
        return templates_auth.TemplateResponse("auth.html", {"request": request})
    

@router.get('/profile/admin/{admin}')
async def profile_admin_get(request: Request, admin: int | None = None, user: dict = Depends(get_current_user)):
    
    if user:
        admin_list_super = [i[0] for i in await admin_list('superadmin')]
        admin_list_normal = [i[0] for i in await admin_list('admin')]
        admin_list_full = admin_list_super + admin_list_normal

        if user in admin_list_full:
            if user == admin:
                userP = "admin/" + str(admin)
                
                if user in admin_list_super:
                    stat = 'superadmin'
    
                elif user in admin_list_normal:
                    stat = 'admin'
                
                return templates_admin.TemplateResponse("admin.html", {"request": request, "user": userP, "status" : stat})
            else:
                return templates_main.TemplateResponse("error.html", {"request": request})
            
        else:
            return templates_main.TemplateResponse("error.html", {"request": request})
    
    else:
        return templates_auth.TemplateResponse("auth.html", {"request": request})


@router.post('/profile/admin/update/{name}/{admin}')
async def update_admin_post(name: str, admin: int, user: dict = Depends(get_current_user)):
    
    if user:
        
        admin_list_super = [i[0] for i in await admin_list('superadmin')]
        admin_list_normal = [i[0] for i in await admin_list('admin')]
        admin_list_full = admin_list_super + admin_list_normal
        
        if user in admin_list_full:
            if user == admin:
                
                return JSONResponse(content={
                    'data': f'/profile/admin/update/{name}/{admin}'
                })
            
    return JSONResponse(content={'data': '/profile'})
   
    
@router.get('/profile/admin/update/{name}/{admin}')
async def admin_get(request: Request, name: str, admin: int, user: dict = Depends(get_current_user)):
    
    if user:
        
        admin_list_super = [i[0] for i in await admin_list('superadmin')]
        admin_list_normal = [i[0] for i in await admin_list('admin')]
        admin_list_full = admin_list_super + admin_list_normal
        
        if user in admin_list_full:
            if user == admin:
                userP = "admin/" + str(admin)

                if name == 'assign-day':
                    name_html = 'calendar-plus.html'
                    
                elif name == 'remove-day':
                    name_html = 'calendar-minus.html'
                
                elif name == 'view-schedule':
                    name_html = 'chart-line.html'
                
                elif name == 'send-message':
                    name_html = 'comment-alt.html'
                
                elif name == 'send-broadcast':
                    name_html = 'mail-bulk.html'
                
                elif name == 'add-to-blacklist':
                    name_html = 'user-slash.html'
                
                elif name == 'remove-from-blacklist':
                    name_html = 'user-check.html'
                
                elif name == 'view-blacklist':
                    name_html = 'user-times.html'
                
                elif name == 'delete-appointment':
                    name_html = 'calendar-times.html'
                
                elif name == 'view-clients':
                    name_html = 'clients.html'
                    
                elif name == 'earnings-chart':
                    name_html = 'earnings-chart.html'
                    
                elif name == 'technical':
                    name_html = 'technical.html'
                
                return templates_admin.TemplateResponse(name_html, {"request": request, "user": userP})
            else:
                return templates_main.TemplateResponse("error.html", {"request": request})
            
        else:
            return templates_main.TemplateResponse("error.html", {"request": request})
    
    else:
        return templates_auth.TemplateResponse("auth.html", {"request": request})
    
    
@router.post('/api/add_day')
async def add_day_post(data: AddDay):
    
    date = datetime.strptime(data.date, '%d.%m.%Y')

    if await check_windows_day(date) is None:
        await admin_add_windows_day(date, data.time_list)
    else:
        await update_windows_day(date, data.time_list)
        
    
    return {"message": "Данные успешно добавлены"}


@router.post('/api/delete_day')
async def delete_day_post(data: DelDay):
    
    date = datetime.strptime(data.date, '%d.%m.%Y')
    
    await admin_delete_windows_day(date)
    
    return {"message": "Данные успешно удалены"}


@router.post('/api/appointments-schedule')
async def schedule_user(request: Request, data: ScheduleDate, user: dict = Depends(get_current_user)):
    
    admin_list_super = [i[0] for i in await admin_list('superadmin')]
    admin_list_normal = [i[0] for i in await admin_list('admin')]
    admin_list_full = admin_list_super + admin_list_normal
    
    if user in admin_list_full:
    
        date = datetime.strptime(data.date, '%d.%m.%Y')
        user_list = await schedule_record_user(date)
        if not user_list:
            return JSONResponse(content=[])

        else:
            user_schedule_list = []
            for ul in user_list:
                user_dict = {
                    'id': ul[0],
                    'time': ul[1].split('T')[1][:-3],
                    'comment': ul[2],
                    'clientName': ul[3],
                    'telegramUsername': ul[4]
                }
                user_schedule_list.append(user_dict)
                
            return JSONResponse(content=user_schedule_list)
    else:
        if user:
            pass
        else:
            return templates_auth.TemplateResponse("auth.html", {"request": request})
        
        return JSONResponse(content={'status': False}, status_code=401)
    

@router.post('/api/clients-all/{name}')
async def clients_all_post(request: Request, name: str, user: dict = Depends(get_current_user)):
    
    admin_list_super = [i[0] for i in await admin_list('superadmin')]
    admin_list_normal = [i[0] for i in await admin_list('admin')]
    admin_list_full = admin_list_super + admin_list_normal
    
    if user in admin_list_full:
        
        if name in ['sms', 'all']:
            ul = await select_user_all()
            
        elif name == 'blf':
            ul = await select_user_all_blacklist_true()
            
        elif name == 'blt':
            ul = await select_user_all_blacklist_false()
            
        elif name == 'del':
            ul = await select_user_all_delete()
        
        user_list = []
        for i in ul:
            user_dict = {
                'id': i[0],
                'name': i[1],
                'telegram': i[2],
                'phone': i[3]
            }
            user_list.append(user_dict)
        
        return JSONResponse(content=user_list)
        
    else:
        if user:
            pass
        else:
            return templates_auth.TemplateResponse("auth.html", {"request": request})
        
        return JSONResponse(content={'status': False}, status_code=401)
    
    
#Нужно сделать отправку через bot api
@router.post('/api/send-message')
async def send_message_user_post(request: Request, data: SmsUser, user: dict = Depends(get_current_user)):
    
    admin_list_super = [i[0] for i in await admin_list('superadmin')]
    admin_list_normal = [i[0] for i in await admin_list('admin')]
    admin_list_full = admin_list_super + admin_list_normal
    
    if user in admin_list_full:
        
        await send_message_private(data.clientId, user, data.message)
        
        return JSONResponse(content={'status': True})
        
    else:
        if user:
            pass
        else:
            return templates_auth.TemplateResponse("auth.html", {"request": request})
        
        return JSONResponse(content={'status': False}, status_code=401)
    

@router.post('/api/mailing-bot')
async def mailing_bot_post(request: Request, data: MailBot, user: dict = Depends(get_current_user)):
    
    admin_list_super = [i[0] for i in await admin_list('superadmin')]
    admin_list_normal = [i[0] for i in await admin_list('admin')]
    admin_list_full = admin_list_super + admin_list_normal
    
    if user in admin_list_full:
        
        id_user_all = await select_user_all()
        
        asyncio.create_task(send_message_mail(id_user_all, admin_list_full, data.message))
        
        return JSONResponse(content={'status': True})
        
    else:
        if user:
            pass
        else:
            return templates_auth.TemplateResponse("auth.html", {"request": request})
        
        return JSONResponse(content={'status': False}, status_code=401)
    

@router.post('/api/blacklist-true')
async def blacklist_true_user(request: Request, data: BlackList, user: dict = Depends(get_current_user)):
    
    admin_list_super = [i[0] for i in await admin_list('superadmin')]
    admin_list_normal = [i[0] for i in await admin_list('admin')]
    admin_list_full = admin_list_super + admin_list_normal
    
    if user in admin_list_full:
        await black_list_user(data.clientId, True)
        
        return JSONResponse(content={'status': True})
        
    else:
        if user:
            pass
        else:
            return templates_auth.TemplateResponse("auth.html", {"request": request})
        
        return JSONResponse(content={'status': False}, status_code=401)
    
    
@router.post('/api/blacklist-false')
async def blacklist_true_user(request: Request, data: BlackList, user: dict = Depends(get_current_user)):
    
    admin_list_super = [i[0] for i in await admin_list('superadmin')]
    admin_list_normal = [i[0] for i in await admin_list('admin')]
    admin_list_full = admin_list_super + admin_list_normal
    
    if user in admin_list_full:
        await black_list_user(data.clientId, False)
        
        return JSONResponse(content={'status': True})
        
    else:
        if user:
            pass
        else:
            return templates_auth.TemplateResponse("auth.html", {"request": request})
        
        return JSONResponse(content={'status': False}, status_code=401)
    

@router.post('/record_user/admin/{id_user}')
async def record_user_id_post(request: Request, id_user: int, user: dict = Depends(get_current_user)):
    
    admin_list_super = [i[0] for i in await admin_list('superadmin')]
    admin_list_normal = [i[0] for i in await admin_list('admin')]
    admin_list_full = admin_list_super + admin_list_normal
    
    if user in admin_list_full:
        
        data_list = []
        record_list = await select_record_user(id_user)
        
        for rl in record_list:
            rec_dict = {
                'id': rl[0],
                'date': rl[1].strftime("%d.%m.%Y"),
                'time': rl[2].split('T')[1][:-3],
                'comment': rl[3]
            }
            data_list.append(rec_dict)

        return JSONResponse(content=data_list)
        
    else:
        if user:
            pass
        else:
            return templates_auth.TemplateResponse("auth.html", {"request": request})
        
        return JSONResponse(content={'status': False}, status_code=401)
    
    
@router.post('/delete_appointment_record_user')
async def delete_appointment(request: Request, data: DeleteUserRecord, user: dict = Depends(get_current_user)):
    
    try:
        if user:
            pass
        else:
            return templates_auth.TemplateResponse("auth.html", {"request": request})
        
        await asyncio.sleep(2)
        Data = namedtuple('Data', ['id', 'date', 'time'])
        data = Data(*data.appointmentId.split('-'))

        admin_list_super = [i[0] for i in await admin_list('superadmin')]
        admin_list_normal = [i[0] for i in await admin_list('admin')]
        admin_list_full = admin_list_super + admin_list_normal
        
        if user not in admin_list_full:
            return JSONResponse(content={'status': False}, status_code=403)
        
        date_r = datetime.strptime(data.date, "%d.%m.%Y")
        time_r = datetime.strptime(data.time, '%H:%M')
        date_full = datetime.combine(date_r, time_r.time()).isoformat()
        
        if await delete_record_user(int(data.id), date_r, date_full):
            
            times = await windows_day_time(date_r)
            
            if times is None:
                await admin_add_windows_day(date_r, [data.time])
                
            else:
                times_list = times['time']
                times_list.append(data.time)
                
                await update_time_in_day(date_r, sorted(times_list))
            
            text_sms = 'Администратор удалил вашу запись к Eyelasmatun! Если у вас вопросы обратитесь к менеджеру @matun_manager'
            await send_message_delete_admin(int(data.id), text_sms)
            
            return JSONResponse(content={'status': True})

    except Exception as e:
        print(f"Ошибка в обработке записи пользователя: {e}")
        return JSONResponse(content={'status': False, 'error': str(e)}, status_code=500)
    

@router.post('/api/client-info/{id_user}')
async def client_info_post(id_user: int, user: dict = Depends(get_current_user)):
    
    admin_list_super = [i[0] for i in await admin_list('superadmin')]
    admin_list_normal = [i[0] for i in await admin_list('admin')]
    admin_list_full = admin_list_super + admin_list_normal
    
    if user not in admin_list_full:
        return JSONResponse(content={'status': False}, status_code=403)
    
    data_user_list = await select_user(id_user)
    
    Data = namedtuple('Data', ['last_site_visit', 'last_entry', 'quantity_visits', 'quantity_cancel', 'blacklist', 'ip_address'])
    data = Data(*data_user_list[0])
    
    if data.last_entry is None:
        dle = 'нет'
    else:
        dle = data.last_entry.strftime('%d.%m.%Y %H:%M')
        
    if data.quantity_visits is None:
        dqv = '0'
    else:
        dqv = data.quantity_visits
        
    if data.quantity_cancel is None:
        dqc = '0'
    else:
        dqc = data.quantity_cancel
    
    data_dict = {
        "lastVisit": data.last_site_visit.strftime('%d.%m.%Y %H:%M'),
        "lastAppointment": dle,
        "visitCount": dqv,
        "cancelCount": dqc,
        "isBlacklisted": data.blacklist,
        "ipAddress": data.ip_address[0],
        "country": data.ip_address[3],
        "city": data.ip_address[1] + " " + data.ip_address[2]
    }
    
    return JSONResponse(content=data_dict)


@router.post('/api/visit-history/{id_user}')
async def visit_history_user_post(id_user: int, user: dict = Depends(get_current_user)):
    
    admin_list_super = [i[0] for i in await admin_list('superadmin')]
    admin_list_normal = [i[0] for i in await admin_list('admin')]
    admin_list_full = admin_list_super + admin_list_normal
    
    if user not in admin_list_full:
        return JSONResponse(content={'status': False}, status_code=403)
    
    history_user = await select_history_user(id_user)
    hist_user_list = []

    for hu in history_user:
        
        if hu[2] is None:
            comment_a = '-'
        else:
            comment_a = hu[2]
            
        if hu[3] is None:
            money = 0
        else:
            money = hu[3]
            
        weekd = hu[0].weekday()
        
        for i, name_w in enumerate(calendar.day_name):
            if i == weekd:
                name_week = name_w.capitalize()
                break
        
        history_dict = {
            "date": hu[0].strftime("%d.%m.%Y"),
            "time": hu[1].split('T')[1][:-3],
            "dayOfWeek": name_week,
            "comment": comment_a,
            "money": money
        }
        hist_user_list.append(history_dict)
    
    return JSONResponse(content=hist_user_list)


@router.post('/api/update-visit')
async def update_visit_user_post(data_update: UpdateUserRecordAdmin, user: dict = Depends(get_current_user)):
    
    admin_list_super = [i[0] for i in await admin_list('superadmin')]
    admin_list_normal = [i[0] for i in await admin_list('admin')]
    admin_list_full = admin_list_super + admin_list_normal
    
    if user not in admin_list_full:
        return JSONResponse(content={'status': False}, status_code=403)
    
    date_r = datetime.strptime(data_update.date, '%d.%m.%Y')
    time_r = datetime.strptime(data_update.time, '%H:%M')
    date_full = datetime.combine(date_r, time_r.time()).isoformat()
    update = data_update.update
    
    if update[0] == 'Комментарий':
        await update_history_user_comment_admin(data_update.clientId, date_r, date_full, update[1])
    
    elif update[0] == 'Деньги':
        await update_history_user_money(data_update.clientId, date_r, date_full, update[1])
    
    return JSONResponse(content={'status': True})


@router.post('/api/usedby_admin')
async def usedby_admin_post(user: dict = Depends(get_current_user)):
    
    admin_list_super = [i[0] for i in await admin_list('superadmin')]
    admin_list_normal = [i[0] for i in await admin_list('admin')]
    
    if user in admin_list_super:
        return JSONResponse(content={'status': 'superadmin'})
    
    elif user in admin_list_normal:
        return JSONResponse(content={'status': 'admin'})
    
    else:
        return JSONResponse(content='False')
    
    
@router.post('/api/earnings')
async def earnings_post(data: DateRange, user: dict = Depends(get_current_user)):
    
    admin_list_super = [i[0] for i in await admin_list('superadmin')]
    
    if user in admin_list_super:
        start_date = datetime.strptime(data.startDate.split('T')[0], '%Y-%m-%d')
        end_date = datetime.strptime(data.endDate.split('T')[0], '%Y-%m-%d')

        data_list = await select_date_money(start_date, end_date)
        days = []
        earnings = []
        
        for d, e in data_list:
            days.append(d.strftime('%d.%m.%Y'))
            earnings.append(e)
        
        return JSONResponse(content={"labels": days, "earnings": earnings})
    
    else:
        return JSONResponse(content={'status': False})
    

@router.post('/api/notifications/start')
async def notifications_start(user: dict = Depends(get_current_user)):
    
    admin_list_super = [i[0] for i in await admin_list('superadmin')]
    
    if user in admin_list_super:
        
        list_user_record = await technical_record_user()
        
        for lur in list_user_record:
            date_r = lur[1]
            time_r = datetime.strptime(lur[2].split('T')[1][:-3], '%H:%M')
            date_full = datetime.combine(date_r, time_r.time())
            print(lur[0], date_full)
            asyncio.create_task(push_sms_technic(lur[0], date_full))

        return JSONResponse(content={'status': True})
    
    else:
        return JSONResponse(content={'status': False}, status_code=401)