from django.core.management.base import BaseCommand
from experiment.models import ProductInfo
import json
import os

class Command(BaseCommand):

    def handle(self, *args, **options):
        json_path = os.path.join(os.path.dirname(__file__), '../../products.json')
        json_path = os.path.abspath(json_path)

        if not os.path.exists(json_path):
            self.stdout.write(self.style.ERROR(f"未找到 JSON 文件: {json_path}"))
            return

        with open(json_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError as e:
                self.stdout.write(self.style.ERROR(f"JSON 解析失败: {e}"))
                return

        imported = 0
        for item in data:
            try:
                if ProductInfo.objects.filter(image_id=item.get('id')).exists():
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
                imported += 1
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"导入失败：{e}"))

        self.stdout.write(self.style.SUCCESS(f"成功导入 {imported} 条商品记录"))
