from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_EXPIRE_MINUTES: int = 60
    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str
    ENVIRONMENT: str = "development"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
