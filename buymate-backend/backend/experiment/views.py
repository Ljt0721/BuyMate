from django.http import JsonResponse, FileResponse, HttpResponseNotFound
from .models import ProductInfo, ExperimentInfo
import json
from django.views.decorators.csrf import csrf_exempt
from collections import defaultdict
from ai_utils import get_tag, get_translation
from utils import save_to_mp3
import time
import os

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
            required_fields = ['subject_id', 'experiment_id', 'subject_type', 'choice', 'choice_time']
            if not all(field in data for field in required_fields):
                return JsonResponse({'success': False, 'error': 'Missing required fields'}, status=400)
            if not isinstance(data['subject_id'], int):
                return JsonResponse({'success': False, 'error': 'Invalid subject_id'}, status=400)
            if data['subject_id'] <= 0:
                return JsonResponse({'success': False, 'error': 'subject_id must be greater than 0'}, status=400)
            if not isinstance(data['experiment_id'], int):
                return JsonResponse({'success': False, 'error': 'Invalid experiment_id'}, status=400)
            if data['experiment_id'] <= 0:
                return JsonResponse({'success': False, 'error': 'experiment_id must be greater than 0'}, status=400)
            if not isinstance(data['subject_type'], str):
                return JsonResponse({'success': False, 'error': 'Invalid subject_type'}, status=400)
            if data['subject_type'] not in ['A', 'B', 'C', 'D']:
                return JsonResponse({'success': False, 'error': 'subject_type must be A, B, C, or D'}, status=400)
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

@csrf_exempt
def get_experiment_result(request):
    if request.method != 'GET':
        return JsonResponse({'success': False, 'error': 'Only GET allowed'}, status=405)

    subject_id = request.GET.get('subject_id')
    if not subject_id:
        return JsonResponse({'success': False, 'error': 'Missing subject ID'}, status=400)

    try:
        subject_id = int(subject_id)
    except ValueError:
        return JsonResponse({'success': False, 'error': 'Invalid subject ID'}, status=400)

    records = ExperimentInfo.objects.filter(subject_id=subject_id, choice=True)

    grouped = defaultdict(list)
    for record in records:
        grouped[record.subject_type].append(record.experiment_id)

    result = [
        {'type': subject_type, 'items': exp_ids}
        for subject_type, exp_ids in grouped.items()
    ]

    return JsonResponse(result, safe=False)

@csrf_exempt
def get_ai_translation(request):
    if request.method != 'GET':
        return JsonResponse({'success': False, 'error': 'Only GET allowed'}, status=405)

    text = request.GET.get('text')
    if not text:
        return JsonResponse({'success': False, 'error': 'Missing text parameter'}, status=400)
    
    tags_list, keywords_list = get_tag(text)
    if tags_list is None or keywords_list is None:
        return JsonResponse({'success': True, 'tags_list': None, 'keywords_list': None, 'translation': None}, status=200)
    else:
        translation = get_translation(tags_list, keywords_list, text)
        if translation is None:
            return JsonResponse({'success': False, 'error': 'Failed to get translation'}, status=500)
        else:
            return JsonResponse({'success': True, 'tags_list': tags_list, 'keywords_list': keywords_list, 'translation': translation}, status=200)
    
@csrf_exempt
def get_audio(request):
    if request.method != 'GET':
        return JsonResponse({'success': False, 'error': 'Only GET allowed'}, status=405)

    text = request.GET.get('text')
    if not text:
        return JsonResponse({'success': False, 'error': 'Missing text parameter'}, status=400)

    timestamp = time.time()
    filename = f'audio_output_{timestamp}.mp3'
    filepath = os.path.join('../media/audios', filename)

    save_to_mp3(text, filepath)

    if os.path.exists(filepath):
        response = FileResponse(open(filepath, 'rb'), content_type='audio/mpeg')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        try:
            os.remove(filepath)
        except Exception as e:
            print(f"Error deleting file: {e}")

        return response
    else:
        return HttpResponseNotFound(JsonResponse({
            'success': False,
            'error': 'Audio file not found'
        }))
