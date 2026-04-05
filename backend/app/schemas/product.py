from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class Category(str, Enum):
    selle = "selle"
    etrier = "etrier"
    accessoire = "accessoire"


class ProductBase(BaseModel):
    name: str
    category: Category
    sku: str
    description: str | None = None
    price: float = Field(..., ge=0)
    stock: int = Field(..., ge=0)
    image_url: str | None = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    category: Category | None = None
    sku: str | None = None
    description: str | None = None
    price: float | None = Field(None, ge=0)
    stock: int | None = Field(None, ge=0)
    image_url: str | None = None


class ProductOut(ProductBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
