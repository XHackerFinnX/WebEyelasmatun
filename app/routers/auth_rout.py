from fastapi import APIRouter, Request, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from db.models.auth import user_check_authentication, update_authentication

from datetime import datetime


router = APIRouter(
    prefix="",
    tags=["Auth"]
)

templates = Jinja2Templates(directory=r"./templates/auth")


class LoginData(BaseModel):
    username: int
    password: str


@router.post('/login')
async def post_login(request: Request, data: LoginData):
    
    # Проверка аутентификации
    user = await user_check_authentication(data.username, data.password)

    if user is None:
        dict_user = {}
        
        # Обновление статуса, что пользователь не смог войти на сайт.
        # Также время когда он не смог зайти
        await update_authentication(data.username, False, datetime.now())
        
    else:
        dict_user = {
            'login': data.username,
            'password': data.password
        }
        
        # Обновление статуса, что пользователь вошел и находится на сайте.
        # Также время когда он зашел
        await update_authentication(data.username, True, datetime.now())
        
    if dict_user:
        request.session.update(dict_user) # Создание сессии
        
        return JSONResponse(content={"message": "Успешная аутентификация"})
    else:
        
        raise HTTPException(status_code=401, detail="Неверное имя пользователя или пароль")


@router.get("/auth", response_class=HTMLResponse)
async def get_auth(request: Request):
    
    return templates.TemplateResponse("auth.html", {"request": request})


@router.post("/logout", response_class=HTMLResponse)
async def logout(request: Request):
    
    user = request.session.get('login')
    request.session.clear()  # Очистка сессии
    
    # Обновление статуса, что пользователь вышел из сайта.
    # Также время когда он вышел
    await update_authentication(user, False, datetime.now())
    
    return JSONResponse(content={'status': True})
    

def get_current_user(request: Request):
    """Проверка наличия активной сессии."""
    user = request.session.get("login")

    if not user:
        return None
    return user