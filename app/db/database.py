import psycopg2
from config.config import config


class Authentication:
    def __init__(self):
        self._connection = None
        
    def _connect(self):
        if not self._connection or self._connection.closed:
            self._connection = psycopg2.connect(
                host=config.POSTGRESQL_HOST.get_secret_value(),
                database=config.POSTGRESQL_DATABASE.get_secret_value(),
                user=config.POSTGRESQL_USER.get_secret_value(),
                password=config.POSTGRESQL_PASSWORD.get_secret_value(),
                port=config.POSTGRESQL_PORT.get_secret_value()
            )
        return self._connection
    
    
class Windows:
    def __init__(self):
        self._connection = None
        
    def _connect(self):
        if not self._connection or self._connection.closed:
            self._connection = psycopg2.connect(
                host=config.POSTGRESQL_HOST.get_secret_value(),
                database=config.POSTGRESQL_DATABASE.get_secret_value(),
                user=config.POSTGRESQL_USER.get_secret_value(),
                password=config.POSTGRESQL_PASSWORD.get_secret_value(),
                port=config.POSTGRESQL_PORT.get_secret_value()
            )
        return self._connection
    
    
class Admin:
    def __init__(self):
        self._connection = None
        
    def _connect(self):
        if not self._connection or self._connection.closed:
            self._connection = psycopg2.connect(
                host=config.POSTGRESQL_HOST.get_secret_value(),
                database=config.POSTGRESQL_DATABASE.get_secret_value(),
                user=config.POSTGRESQL_USER.get_secret_value(),
                password=config.POSTGRESQL_PASSWORD.get_secret_value(),
                port=config.POSTGRESQL_PORT.get_secret_value()
            )
        return self._connection