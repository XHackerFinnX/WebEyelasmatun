from fastapi import APIRouter, Request, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from pydantic import BaseModel
from typing import List
from routers.auth_rout import get_current_user
from datetime import datetime, timedelta
from db.models.admin import (admin_add_windows_day, check_windows_day,
                             update_windows_day, admin_delete_windows_day)

import asyncio
import random

router = APIRouter(
    prefix="",
    tags=["Admin"]
)

class AddDay(BaseModel):
    date: str
    time_list: List[str]
    
class DelDay(BaseModel):
    date: str


templates_admin = Jinja2Templates(directory=r"./templates/admin")
templates_main = Jinja2Templates(directory=r"./templates/main")
templates_auth = Jinja2Templates(directory=r"./templates/auth")


@router.get('/profile')
async def profile_error_get(request: Request, user: dict = Depends(get_current_user)):
    
    if user:
        return templates_main.TemplateResponse("error.html", {"request": request})
    
    else:
        return templates_auth.TemplateResponse("auth.html", {"request": request})
    

@router.get('/profile/admin/{admin}')
async def profile_admin_get(request: Request, admin: int | None = None, user: dict = Depends(get_current_user)):
    
    if user:
        if user in [1387002896, 1563475165]:
            if user == admin:
                userP = "admin/" + str(admin)
                
                return templates_admin.TemplateResponse("admin.html", {"request": request, "user": userP})
            else:
                return templates_main.TemplateResponse("error.html", {"request": request})
            
        else:
            return templates_main.TemplateResponse("error.html", {"request": request})
    
    else:
        return templates_auth.TemplateResponse("auth.html", {"request": request})


@router.post('/profile/admin/update/{name}/{admin}')
async def update_admin_post(name: str, admin: int, user: dict = Depends(get_current_user)):
    
    if user:
        if user in [1387002896, 1563475165]:
            if user == admin:
                
                return JSONResponse(content={
                    'data': f'/profile/admin/update/{name}/{admin}'
                })
            
    return JSONResponse(content={'data': '/profile'})
   
    
@router.get('/profile/admin/update/{name}/{admin}')
async def admin_get(request: Request, name: str, admin: int, user: dict = Depends(get_current_user)):
    
    if user:
        if user in [1387002896, 1563475165]:
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