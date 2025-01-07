from fastapi import APIRouter, Request, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from app.db.models.auth import (user_check_authentication, update_authentication,
                            status_authentication, synchronic_status_authentication)
from datetime import datetime
from app.utils.log import setup_logger

router = APIRouter(
    prefix="",
    tags=["Auth"]
)

logger = setup_logger("Auth")

templates = Jinja2Templates(directory=r"./app/templates/auth")


class LoginData(BaseModel):
    username: int
    password: str


@router.post('/login')
async def post_login(request: Request, data: LoginData):
    
    # Проверка аутентификации
    logger.info(f"Пользователь ввел данные для входа. логин: {data.username} пароль: {data.password}")
    user = await user_check_authentication(data.username, data.password)
    logger.info(f"Получение пользователя {data.username} из user_check_authentication {user}")
    
    logger.info(f"Проверка стутуса ЧС пользователя. логин: {data.username} пароль: {data.password}")
    black_list_status = await status_authentication(data.username, data.password)
    logger.info(f"Получение статуса ЧС пользователя {data.username} из status_authentication {black_list_status}")

    if black_list_status is None:
        await update_authentication(data.username, False, datetime.now())
        logger.warning(f"Пользователь неверно ввел имя или пароль. логин: {data.username} пароль: {data.password}")
        raise HTTPException(status_code=401, detail="Неверное имя пользователя или пароль")
        
    if black_list_status['blacklist']:
        await update_authentication(data.username, False, datetime.now())
        logger.warning(f"Пользователь заблокирован. логин: {data.username}")
        raise HTTPException(status_code=401, detail="Вы заблокированы")
    
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
        logger.info(f"Пользователь успешно авторизовался. логин: {data.username}")
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
    logger.info(f"Пользователь вышел из сайта. логин: {user}")
    await update_authentication(user, False, datetime.now())
    
    return JSONResponse(content={'status': True})
    

async def get_current_user(request: Request):
    """Проверка наличия активной сессии."""
    user = request.session.get("login")
    password = request.session.get("password")
    black_list_status = await synchronic_status_authentication(user, password)
    try:
        if black_list_status['blacklist'] is None:
            request.session.clear()
            return None
        
        if black_list_status['blacklist']:
            request.session.clear()
            return None
    except TypeError:
        return None
        
        
    if not user:
        request.session.clear()
        return None
    return user