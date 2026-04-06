from sqlalchemy.orm import Session

from app.models.product import Category, Product
from app.schemas.product import ProductCreate, ProductUpdate


def get_products(
    db: Session,
    category: Category | None = None,
    in_stock: bool | None = None,
) -> list[Product]:
    query = db.query(Product)
    if category:
        query = query.filter(Product.category == category)
    if in_stock:
        query = query.filter(Product.stock > 0)
    return query.all()


def get_product(db: Session, product_id: str) -> Product | None:
    return db.query(Product).filter(Product.id == product_id).first()


def create_product(db: Session, data: ProductCreate) -> Product:
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product: Product, data: ProductUpdate) -> Product:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product: Product) -> None:
    db.delete(product)
    db.commit()
