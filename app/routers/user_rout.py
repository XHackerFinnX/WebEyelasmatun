from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse, Response
from pydantic import BaseModel
from app.routers.auth_rout import get_current_user
from collections import namedtuple
from datetime import datetime, timedelta
from app.db.models.user import (update_name_user, update_telegram_user,
                            update_telephone_user, select_profile_user,
                            select_record_user, delete_record_user, count_del_visits,
                            get_photo_from_db, notification_feedback_user)
from app.db.models.main_windows import windows_day_time, update_time_in_day
from app.db.models.admin import admin_add_windows_day, admin_list
from app.services.bot_notice import send_message_delete_user

import asyncio

router = APIRouter(
    prefix="",
    tags=["User"]
)


class UpdateUser(BaseModel):
    name: str
    update_name: str
    
class RecordUser(BaseModel):
    userId: int
    
class DeleteRecordUser(BaseModel):
    appointmentId: str


templates_user = Jinja2Templates(directory=r"./app/templates/user")
templates_main = Jinja2Templates(directory=r"./app/templates/main")
templates_auth = Jinja2Templates(directory=r"./app/templates/auth")


@router.get('/profile/users/{users}')
async def users_get(request: Request, users: int | None = None, user: dict = Depends(get_current_user)):
    
    if user:
        if user == users:
            profile_user = await select_profile_user(users)
            userP = "users/" + str(users)
            id_user = users
            name_user = profile_user['name']
            tg_user = profile_user['telegram']
            number_user = profile_user['telephone']

            return templates_user.TemplateResponse(
                "user.html",
                {
                    "request": request,
                    "user": userP,
                    "id_user": id_user,
                    'name_user': name_user,
                    'tg_user': tg_user,
                    'number_user': number_user
                }
            )
        else:
            return templates_main.TemplateResponse("error.html", {"request": request})
    
    else:
        return templates_auth.TemplateResponse("auth.html", {"request": request})
    
    
@router.post('/profile/update/{users}')
async def update_users_post(request: Request, data_user: UpdateUser, users: int | None = None, user: dict = Depends(get_current_user)):
    
    if user:
        if user == users:
            
            if data_user.name == 'userName':
                asyncio.create_task(update_name_user(data_user.update_name, users))
            
            elif data_user.name == 'userTg':
                asyncio.create_task(update_telegram_user(data_user.update_name, users))
                
            elif data_user.name == 'userPhone':
                asyncio.create_task(update_telephone_user(data_user.update_name, users))
            
            return JSONResponse(content={'status': True})
    
    else:
        return templates_auth.TemplateResponse("auth.html", {"request": request})
    
    
@router.post('/record_user')
async def record_user_post(request: Request, data: RecordUser, user: dict = Depends(get_current_user)):
    
    try:
        if user:
            pass
        else:
            return templates_auth.TemplateResponse("auth.html", {"request": request})
        
        if user != data.userId:
            return JSONResponse(content={'status': False}, status_code=403)

        data_user_record = await select_record_user(data.userId)
        if not data_user_record:
            return JSONResponse(content={'status': False})
        
        data_list = [
            {
                'id': dur['id'],
                'date': dur['date'].strftime("%d.%m.%Y"),
                'time': dur['time'].split('T')[1][:-3],
                'comment': dur['comment_user'],
            }
            for dur in data_user_record
        ]
        
        return JSONResponse(content={'status': True, 'data': data_list})
    except Exception as e:
        print(f"Ошибка в обработке записи пользователя: {e}")
        return JSONResponse(content={'status': False, 'error': str(e)}, status_code=500)
    
    
@router.post('/delete_record')
async def delete_record_post(request: Request, data_delete: DeleteRecordUser, user: dict = Depends(get_current_user)):
    
    try:
        if user:
            pass
        else:
            return templates_auth.TemplateResponse("auth.html", {"request": request})
        
        await asyncio.sleep(2)
        Data = namedtuple('Data', ['id', 'date', 'time'])
        data = Data(*data_delete.appointmentId.split('-'))
        
        admin_list_super = [i[0] for i in await admin_list('superadmin')]
        admin_list_normal = [i[0] for i in await admin_list('admin')]
        admin_list_full = admin_list_super + admin_list_normal

        if user != int(data.id):
            return JSONResponse(content={'status': False}, status_code=403)
        
        date_today = datetime.now() + timedelta(days=3)
        date_r = datetime.strptime(data.date, "%d.%m.%Y")
        time_r = datetime.strptime(data.time, '%H:%M')
        date_full = datetime.combine(date_r, time_r.time()).isoformat()
        
        if date_r > date_today:
        
            if await delete_record_user(int(data.id), date_r, date_full):
                
                times = await windows_day_time(date_r)
                
                if times is None:
                    await admin_add_windows_day(date_r, [data.time])
                    
                else:
                    times_list = times['time']
                    times_list.append(data.time)
                    
                    await update_time_in_day(date_r, sorted(times_list))
                
                text = f"Клиентка отменила запись на {data.date} {data.time}\nКлиент id: {data.id}"
                admin_group = -1002034439978
                await send_message_delete_user(admin_group, text)
                
                await count_del_visits(int(data.id))
                
                return JSONResponse(content={'status': True})
        
        else:
            return JSONResponse(content={'status': False}, status_code=403)
    except Exception as e:
        print(f"Ошибка в обработке записи пользователя: {e}")
        return JSONResponse(content={'status': False, 'error': str(e)}, status_code=500)
    
    
@router.get("/api/photos/{user_id}")
async def get_photo(user_id: int):
    file_name, file_data = await get_photo_from_db(user_id)
    if not file_data:
        raise HTTPException(status_code=404, detail="Photo not found")

    # Определение типа содержимого по имени файла
    content_type = "image/jpeg" if file_name.lower().endswith(".jpg") else "image/png"
    return Response(content=file_data, media_type=content_type)


@router.post('/api/check-pulse-dot')
async def post_check_pulse(user: dict = Depends(get_current_user)):
    
    user_check = await notification_feedback_user(user)

    status = False
    if user_check['notification_feedback'] is None:
        pass
    elif user_check['notification_feedback']:
        status = True
    
    return JSONResponse(content={'show': status})