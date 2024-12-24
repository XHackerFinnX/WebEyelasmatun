from fastapi import APIRouter, Request, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from pydantic import BaseModel
from routers.auth_rout import get_current_user
from datetime import datetime, timedelta
from db.models.main_windows import windows_day, windows_day_time
from db.models.user import update_last_visit_user
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
    
    dates = [(d[0] - timedelta(days=1)).strftime("%Y-%m-%d") for d in await windows_day()]
    date_today = datetime.now()
    
    asyncio.create_task(update_last_visit_user(date_today, user))
    
    return JSONResponse(content={"dates": dates})


@router.post('/time_record')
async def time_record(timeday: TimeDay):
    
    times = await windows_day_time(datetime.strptime(timeday.time, "%Y-%m-%d") + timedelta(days=1))
    
    return JSONResponse(content={"times_r": times})

    
@router.post('/record')
async def record_post(request: Request, data_record: RecordUser, user: dict = Depends(get_current_user)):
    
    if user:
        
        date_r = datetime.strptime(data_record.date, '%Y-%m-%d')
        time_r = data_record.time
        comment_r = data_record.comment
        print(f"{user}\n{date_r}\n{time_r}\n{comment_r}")
        
        await asyncio.sleep(3)
        
        tf = random.choice([True, False])
        
        return JSONResponse(content={"success": tf})
        
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