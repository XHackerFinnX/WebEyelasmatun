from fastapi import APIRouter, Request, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.routers.auth_rout import get_current_user
from datetime import datetime
from app.db.models.admin import admin_list
from app.db.models.user import add_feedback_user, all_feedback_user, select_user_photo

router = APIRouter(
    prefix="",
    tags=["Admin"]
)

class FeedbackUser(BaseModel):
    text: str
    rating: int
    
class FeedbackFilter(BaseModel):
    filteruser: str
    page: int

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
    
    
@router.post('/api/feedback/download')
async def feedback_download(data: FeedbackUser, user: dict = Depends(get_current_user)):
    
    if user:
        status = await add_feedback_user(user, data.text, data.rating, datetime.now().date())
        if status['status'] == 'No feedback':
            return JSONResponse(content={'status': False}, status_code=401)
        
        return JSONResponse(content={'status': True})
        
    else:
        return JSONResponse(content={'status': False}, status_code=401)
    
    
@router.post('/api/feedback/load')
async def feedback_download(data: FeedbackFilter, user: dict = Depends(get_current_user)):
    
    if user:
        
        all_feedback = await all_feedback_user()
        photo_user = await select_user_photo()
        
        list_feedback = []
        for lf in all_feedback:
            
            for pu in photo_user:
                if pu['id'] == lf['id']:
                    avatar = avatar = f'http://127.0.0.1:8000/api/photos/{pu['id']}'
                    break
            else:
                avatar = '/app/static/images/feedback.png'
                
            user_d = {
                'id': lf['id'],
                'name': lf['name'],
                'date': lf['date_feedback'].strftime("%Y-%m-%d"),
                'avatar': avatar,
                'rating': lf['stars'],
                'text': lf['text_feedback']
            }
            list_feedback.append(user_d)
            
        return JSONResponse(content={
            'feedback': list_feedback,
            'hasMore': True,
            'userId': user
        })
        
    else:
        return JSONResponse(content=[], status_code=401)