from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import json
from utils import get_gold_price, calculate_price

app = FastAPI()

# CORS ayarları (frontend erişimi için)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Geliştirme için açık
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ürünleri oku
with open("products.json", "r") as f:
    products_data = json.load(f)

@app.get("/products")
def get_products(min_price: float = Query(0), max_price: float = Query(float("inf")), min_score: float = Query(0)):
    goldPrice = get_gold_price()
    if not goldPrice:
        return {"error": "Altın fiyatı alınamadı."}

    result = []
    for product in products_data:
        price = calculate_price(product["popularityScore"], product["weight"], goldPrice)
        popularity_score_5 = round(product["popularityScore"] * 5, 2)

        if not (min_price <= price <= max_price and popularity_score_5 >= min_score):
            continue

        result.append({
            "name": product["name"],
            "price": price,
            "popularityScore": popularity_score_5,
            "weight": product["weight"],  # 🔹 Eklendi
            "images": product["images"]
        })

    return {"goldPrice": goldPrice, "products": result}
