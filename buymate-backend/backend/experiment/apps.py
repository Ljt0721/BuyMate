from django.apps import AppConfig
import os
import json
from django.db.utils import OperationalError
from django.core.exceptions import AppRegistryNotReady

class ExperimentConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'experiment'

    def ready(self):
        try:
            from .models import ProductInfo
            from django.db import connection

            if not connection.introspection.table_names():
                return
        except (OperationalError, AppRegistryNotReady, ImportError):
            return
        
        if hasattr(self, 'data_loaded'):
            return
        self.data_loaded = True


        json_path = os.path.join(os.path.dirname(__file__), 'products.json')
        if not os.path.exists(json_path):
            return

        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        for item in data:
            try:
                if ProductInfo.objects.filter(image_id=item['id']).exists():
                    continue

                ProductInfo.objects.create(
                    experiment_id=int(item.get('id', '0-0').split('-')[0]),
                    image_id=item.get('id', ''),
                    name=item.get('name', ''),
                    brand=item.get('brand', ''),
                    current_price=item.get('price', {}).get('current', 0),
                    original_price=item.get('price', {}).get('original', 0),
                    live_price=item.get('price', {}).get('live_price', 0),
                    price_comparison=item.get('price', {}).get('price_comparison', ''),
                    sales_volume=item.get('sales_volume', ''),
                    sizes=item.get('sizes', []),
                    colors=item.get('colors', []),
                    features=item.get('features', []),
                    positive_keywords=item.get('positive_keywords', []),
                    negative_keywords=item.get('negative_keywords', []),
                    real_review=item.get('real_review', ''),
                    sales_rating=item.get('rating', 0),
                    shipping_time=item.get('shipping_time', ''),
                    reviews_count=item.get('reviews_count', ''),
                    shipping_info=item.get('shipping_info', []),
                    return_policy=item.get('return_policy', [])
                )

            except Exception as e:
                print(f"导入失败：{e}")
