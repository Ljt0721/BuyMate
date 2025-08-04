from django.http import JsonResponse
from .models import ProductInfo, ExperimentInfo
import json
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def get_products_by_experiment_id(request):
    experiment_id = request.GET.get('experiment_id')
    if not experiment_id:
        return JsonResponse({'error': 'experiment_id is required'}, status=400)

    products = ProductInfo.objects.filter(experiment_id=experiment_id)
    data = [
        {
            'id': p.id,
            'experiment_id': p.experiment_id,
            'image_id': p.image_id,
            'name': p.name,
            'brand': p.brand,
            'current_price': p.current_price,
            'original_price': p.original_price,
            'live_price': p.live_price,
            'price_comparison': p.price_comparison,
            'discount_info': p.discount_info,
            'sizes': p.sizes,
            'material': p.material,
            'style': p.style,
            'colors': p.colors,
            'features': p.features,
            'sales_rating': p.sales_rating,
            'shipping_time': p.shipping_time,
            'sales_volume': p.sales_volume,
            'reviews_count': p.reviews_count,
            'shipping_info': p.shipping_info,
            'return_policy': p.return_policy,
        }
        for p in products
    ]
    return JsonResponse({'products': data})

@csrf_exempt
def submit_experiment_info(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            experiment = ExperimentInfo(
                subject_id=data['subject_id'],
                experiment_id=data['experiment_id'],
                subject_type=data['subject_type'],
                choice=data['choice'],
                choice_time=data['choice_time'],
            )
            experiment.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    else:
        return JsonResponse({'success': False, 'error': 'Only POST allowed'})
