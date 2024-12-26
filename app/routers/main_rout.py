from fastapi import APIRouter, Request, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from pydantic import BaseModel
from routers.auth_rout import get_current_user
from datetime import datetime, timedelta
from db.models.main_windows import windows_day, windows_day_time
from db.models.user import update_last_visit_user, add_record_user, check_record_time
from db.models.admin import select_day_time, update_windows_day, admin_delete_windows_day
from utils.ip_address import get_ip

import asyncio
import random

router = APIRouter(
    prefix="",
    tags=["Main"]
)

class RecordUser(BaseModel):
    date: str
    time: str
    comment: str
    
class ToDay(BaseModel):
    today: str
    
class TimeDay(BaseModel):
    time: str

templates_main = Jinja2Templates(directory=r"./templates/main")
templates_auth = Jinja2Templates(directory=r"./templates/auth")

@router.get("/favicon.ico")
async def favicon():

    return FileResponse("/static/images/favicon.ico")

@router.get('/')
async def main_get(request: Request, user: dict = Depends(get_current_user)):
    
    if user:
        if user in [1387002896, 1563475165]:
            userP = "admin/" + str(user)
            admin_or_user = 'admin'
            
        else:
            userP = "users/" + str(user)
            admin_or_user = 'user'
        
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
        
        date_r = datetime.strptime(data_record.date, '%Y-%m-%d') + timedelta(days=1)
        time_r = datetime.strptime(data_record.time, '%H:%M')
        date_full = datetime.combine(date_r, time_r.time())
        comment_r = data_record.comment or '-'
        
        await asyncio.sleep(3)
        
        try:
            if await check_record_time(user, date_r, date_full) is None:
                await add_record_user(user, date_r, date_full, comment_r, True)
                
                time_list: list = await select_day_time(date_r)
                
                for t in time_list:
                    if t == data_record.time:
                        time_list.remove(t)
                        await update_windows_day(date_r, time_list)
                        
                if not time_list:
                    await admin_delete_windows_day(date_r)
                
                return JSONResponse(content={"success": True})
            else:
                return JSONResponse(content={"success": False})
        except:
            return JSONResponse(content={"success": False})
        
    else:
        return templates_auth.TemplateResponse("auth.html", {"request": request})
    
    
@router.get('/pricelist/admin/{username}')
async def pricelist_get(request: Request, username: int, user: dict = Depends(get_current_user)):
    
    if user:

        if user in [1387002896, 1563475165]:
            userP = "admin/" + str(username)
            admin_or_user = 'admin'
            price_html = 'pricel.html'
            
        else:
            userP = "users/" + str(username)
            admin_or_user = 'user'
            price_html = 'pricelistuser.html'
    
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

        if user in [1387002896, 1563475165]:
            userP = "admin/" + str(username)
            admin_or_user = 'admin'
            price_html = 'pricel.html'
            
        else:
            userP = "users/" + str(username)
            admin_or_user = 'user'
            price_html = 'pricelistuser.html'
    
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
    
    
@router.post("/save-ip")
async def save_ip(request: Request, user: dict = Depends(get_current_user)):
    data = await request.json()
    asyncio.create_task(get_ip(data, user))
    
    return {"status": "success"}