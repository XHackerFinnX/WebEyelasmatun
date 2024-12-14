from fastapi import APIRouter, Request, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from pydantic import BaseModel
from routers.auth_rout import get_current_user
from datetime import datetime, timedelta

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
async def date_record(request: Request, tod: ToDay, user: dict = Depends(get_current_user)):
    
    dates = [(datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]
    
    return JSONResponse(content={"dates": dates})


@router.post('/time_record')
async def time_record(request: Request, timeday: TimeDay, user: dict = Depends(get_current_user)):
    
    if timeday.time == '2024-12-12':
        times = ["10:00", "12:00", "14:00", "16:00"]
    else:
        times = ["10:00"]
    
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
    
    
@router.get('/pricelist')
async def pricelist_get(request: Request, user: dict = Depends(get_current_user)):
    
    if user:
        
        if user:
            if user in [1387002896, 1563475165]:
                userP = "admin/" + str(user)
                admin_or_user = 'admin'
                
            else:
                userP = "users/" + str(user)
                admin_or_user = 'user'
        
        return templates_main.TemplateResponse(
            "pricel.html",
            {
                "request": request,
                "user": userP,
                "admin_or_user": admin_or_user
            }
        )
    else:
        return templates_auth.TemplateResponse("auth.html", {"request": request})