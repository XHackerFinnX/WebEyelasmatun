from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from config.config import config

from routers.auth_rout import router as router_auth
from routers.main_rout import router as router_main
from routers.admin_rout import router as router_admin
from routers.user_rout import router as router_user


app = FastAPI(
    title='Eyelasmatun'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    r"/static",
    StaticFiles(directory='static'),
    name="static"
)

app.add_middleware(
    SessionMiddleware,
    secret_key=config.SECRET_AUTH.get_secret_value(),
    session_cookie="session",
    max_age=2000000
)

app.include_router(router_auth)
app.include_router(router_main)
app.include_router(router_admin)
app.include_router(router_user)