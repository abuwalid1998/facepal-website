from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.store_service import get_all_products, get_product_by_id

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("")
def list_products(category: Optional[str] = Query(None)):
    return {"products": get_all_products(category)}

@router.get("/{product_id}")
def get_product(product_id: str):
    product = get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
