from fastapi import APIRouter, Request, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from pydantic import BaseModel

from routers.auth_rout import get_current_user

router = APIRouter(
    prefix="",
    tags=["Main"]
)

templates_main = Jinja2Templates(directory=r"./templates/main")
templates_auth = Jinja2Templates(directory=r"./templates/auth")

@router.get("/favicon.ico")
async def favicon():
    return {
        'favicon.ico': True
    }
    # return FileResponse("/static/images/favicon.ico")

@router.get('/')
async def main_get(request: Request, user: dict = Depends(get_current_user)):
    
    if user:
        return templates_main.TemplateResponse("main.html", {"request": request})
    
    else:
        return templates_auth.TemplateResponse("auth.html", {"request": request})