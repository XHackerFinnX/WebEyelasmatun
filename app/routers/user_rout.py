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
    tags=["User"]
)


class UpdateUser(BaseModel):
    name: str
    update_name: str


templates_user = Jinja2Templates(directory=r"./templates/user")
templates_main = Jinja2Templates(directory=r"./templates/main")
templates_auth = Jinja2Templates(directory=r"./templates/auth")


@router.get('/profile/users/{users}')
async def users_get(request: Request, users: int | None = None, user: dict = Depends(get_current_user)):
    
    if user:
        if user == users:
            userP = "users/" + str(users)
            id_user = users
            name_user = 'Алексей'
            tg_user = '@AlexGood_man'
            number_user = '-'
            
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
            print(data_user, users)
            return JSONResponse(content={'status': True})
    
    else:
        return templates_auth.TemplateResponse("auth.html", {"request": request})