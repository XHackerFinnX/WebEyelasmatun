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
from app.db.models.user import select_record_user, delete_record_user, technical_record_user, count_del_visits
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

templates_admin = Jinja2Templates(directory=r"./app/templates/admin")
templates_main = Jinja2Templates(directory=r"./app/templates/main")
templates_auth = Jinja2Templates(directory=r"./app/templates/auth")


@router.get('/feedback/admin/{admin}')
async def feedback_get(request: Request, admin: int, user: dict = Depends(get_current_user)):
    
    if user:
        
        admin_list_super = [i[0] for i in await admin_list('superadmin')]
        admin_list_normal = [i[0] for i in await admin_list('admin')]
        admin_list_full = admin_list_super + admin_list_normal
        
        if user in admin_list_full:
            userP = "admin/" + str(admin)
            admin_or_user = 'admin'
            
        else:
            userP = "users/" + str(admin)
            admin_or_user = 'user'
        
        return templates_main.TemplateResponse(
            "feedback.html",
            {
                "request": request,
                "user": userP,
                "admin_or_user": admin_or_user
            }
        )
    
    else:
        return templates_auth.TemplateResponse("auth.html", {"request": request})
    

@router.get('/feedback/users/{id_user}')
async def feedback_get(request: Request, id_user: int, user: dict = Depends(get_current_user)):
    
    if user:
        
        admin_list_super = [i[0] for i in await admin_list('superadmin')]
        admin_list_normal = [i[0] for i in await admin_list('admin')]
        admin_list_full = admin_list_super + admin_list_normal
        
        if user in admin_list_full:
            userP = "admin/" + str(id_user)
            admin_or_user = 'admin'
            
        else:
            userP = "users/" + str(id_user)
            admin_or_user = 'user'
        
        return templates_main.TemplateResponse(
            "feedback.html",
            {
                "request": request,
                "user": userP,
                "admin_or_user": admin_or_user
            }
        )
    
    else:
        return templates_auth.TemplateResponse("auth.html", {"request": request})