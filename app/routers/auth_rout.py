from fastapi import APIRouter, Request, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel


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
    
    dict_user = {
        'login': data.username,
        'password': data.password
    }
    
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

    if user:
        request.session.clear()  # Очистка сессии
        return JSONResponse(content={'status': True})
    else:
        return templates.TemplateResponse("auth.html", {"request": request})
    

def get_current_user(request: Request):
    """Проверка наличия активной сессии."""
    user = request.session.get("login")

    if not user:
        return None
    return user