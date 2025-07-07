import httpx
import os
from dotenv import load_dotenv

load_dotenv()

def get_gold_price():
    return 3320.00 

def calculate_price(popularity_score: float, weight: float, gold_price: float):
    return round((popularity_score + 1) * weight * gold_price, 2)
