from fastapi import APIRouter, Request, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.routers.auth_rout import get_current_user
from datetime import datetime
from app.db.models.admin import admin_list
from app.db.models.user import add_feedback_user, all_feedback_user, select_user_photo
from app.services.bot_notice import send_message_record_admin
from app.utils.log import setup_logger
from zoneinfo import ZoneInfo

router = APIRouter(
    prefix="",
    tags=["Feedback"]
)

logger = setup_logger("Feedback")
piter_tz = ZoneInfo("Europe/Moscow")

class FeedbackUser(BaseModel):
    text: str
    rating: int
    
class FeedbackFilter(BaseModel):
    filteruser: str

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
        
        logger.info(f"Пользователь админ зашел на страницу отзывов. логин: {user}")
        
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
        
        logger.info(f"Пользователь user зашел на страницу отзывов. логин: {user}")
        
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
    
    
@router.post('/api/feedback/download')
async def feedback_download(data: FeedbackUser, user: dict = Depends(get_current_user)):
    
    admin_group = -1002034439978
    text_feedback = 'Клиент оставил отзыв!'
    
    if user:
        logger.info(f"Пользователь загружает отзыв. логин: {user}. текст: {data.text}. рейтинг: {data.rating}")
        status = await add_feedback_user(user, data.text, data.rating, datetime.now(piter_tz).date())
        if status['status'] == 'No feedback':
            logger.warning(f"Пользователь не может загрузить отзыв. логин: {user}. текст: {data.text}. рейтинг: {data.rating}")
            return JSONResponse(content={'status': False}, status_code=401)
        
        await send_message_record_admin(admin_group, text_feedback)
        logger.info(f"Пользователь успешно загрузил отзыв. логин: {user}. текст: {data.text}. рейтинг: {data.rating}")
        return JSONResponse(content={'status': True})
        
    else:
        return JSONResponse(content={'status': False}, status_code=401)
    
    
@router.post('/api/feedback/load')
async def feedback_download(data: FeedbackFilter, user: dict = Depends(get_current_user)):
    
    if user:
        logger.info(f"Пользователь сделал запрос на получение всех отзывов. логин: {user}")
        all_feedback = await all_feedback_user()
        photo_user = await select_user_photo()
        
        list_feedback = []
        for lf in all_feedback:
            
            for pu in photo_user:
                if pu['id'] == lf['id']:
                    id_user_avatar = pu['id']
                    # Ссылка на запрос аватара
                    avatar = f'https://eyelasmatun.ru/api/photos/{id_user_avatar}'
                    break
            else:
                avatar = '/app/static/images/feedback.png'
                
            user_d = {
                'id': lf['id'],
                'name': lf['name'],
                'date': lf['date_feedback'].strftime("%d.%m.%Y"),
                'avatar': avatar,
                'rating': lf['stars'],
                'text': lf['text_feedback']
            }
            list_feedback.append(user_d)
        
        logger.info(f"Запрос на получение всех отзывов выполнен. логин: {user}") 
        return JSONResponse(content={
            'feedback': list_feedback,
            'userId': user
        })
        
    else:
        return JSONResponse(content=[], status_code=401)