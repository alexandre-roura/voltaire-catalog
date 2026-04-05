from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.crud.product import (
    create_product,
    delete_product,
    get_product,
    get_products,
    update_product,
)
from app.db.session import get_db
from app.models.product import Category
from app.models.user import User
from app.routers.deps import get_current_user
from app.schemas.product import ProductCreate, ProductOut, ProductUpdate

router = APIRouter()


@router.get("", response_model=list[ProductOut])
def list_products(
    category: Category | None = Query(None),
    in_stock: bool | None = Query(None),
    db: Session = Depends(get_db),
):
    return get_products(db, category=category, in_stock=in_stock)


@router.get("/{product_id}", response_model=ProductOut)
def get_product_by_id(product_id: str, db: Session = Depends(get_db)):
    product = get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    return product


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create(
    data: ProductCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return create_product(db, data)


@router.put("/{product_id}", response_model=ProductOut)
def update(
    product_id: str,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    product = get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    return update_product(db, product, data)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    product_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    product = get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    delete_product(db, product)
