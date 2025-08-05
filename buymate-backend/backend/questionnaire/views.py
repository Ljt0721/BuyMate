from django.http import JsonResponse
import json
from .models import Pre_Questionnaire, Post_Questionnaire
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def submit_pre_questionnaire(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            required_fields = ['id', 'age', 'gender', 'education', 'income',
                               'shopping_preferences', 'live_shopping_frequency', 'ibs_answers']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({'success': False, 'error': f'Missing field: {field}'}, status=400)

            valid_ages = ['18-25', '26-35', '36-45', '46+']
            valid_genders = ['男', '女', '非二元', '不愿透露']
            valid_educations = ['高中及以下', '本科', '硕士', '博士']
            valid_incomes = ['＜3000元', '3000-6000元', '6000-10000元', '＞10000元']
            valid_shopping_channels = ['小红书', '抖音', '快手', '淘宝', '京东', '哔哩哔哩', '其他']
            valid_live_freq = ['从不', '每月少于1次', '每月1-3次', '每周1-2次', '每周多次']

            if data['age'] not in valid_ages:
                return JsonResponse({'success': False, 'error': 'Invalid age value'}, status=400)
            if data['gender'] not in valid_genders:
                return JsonResponse({'success': False, 'error': 'Invalid gender value'}, status=400)
            if data['education'] not in valid_educations:
                return JsonResponse({'success': False, 'error': 'Invalid education value'}, status=400)
            if data['income'] not in valid_incomes:
                return JsonResponse({'success': False, 'error': 'Invalid income value'}, status=400)
            if data['live_shopping_frequency'] not in valid_live_freq:
                return JsonResponse({'success': False, 'error': 'Invalid live_shopping_frequency value'}, status=400)

            if not isinstance(data['shopping_preferences'], list):
                return JsonResponse({'success': False, 'error': 'shopping_preferences must be a list'}, status=400)

            for item in data['shopping_preferences']:
                if item not in valid_shopping_channels:
                    return JsonResponse({'success': False, 'error': f'Invalid shopping preference: {item}'}, status=400)

            if not isinstance(data['ibs_answers'], list) or len(data['ibs_answers']) != 20:
                return JsonResponse({'success': False, 'error': 'ibs_answers must be a list of 20 items'}, status=400)

            for val in data['ibs_answers']:
                if not isinstance(val, int) or not (1 <= val <= 7):
                    return JsonResponse({'success': False, 'error': f'Invalid ibs answer: {val}. Must be int between 1 and 7'}, status=400)

            if Pre_Questionnaire.objects.filter(id=data['id']).exists():
                Pre_Questionnaire.objects.filter(id=data['id']).update(
                    age=data['age'],
                    gender=data['gender'],
                    education=data['education'],
                    income=data['income'],
                    shopping_preferences=data['shopping_preferences'],
                    live_shopping_frequency=data['live_shopping_frequency'],
                    ibs_answers=data['ibs_answers'],
                )
                return JsonResponse({'success': True})
            else:
                Pre_Questionnaire.objects.create(
                    id=data['id'],
                    age=data['age'],
                    gender=data['gender'],
                    education=data['education'],
                    income=data['income'],
                    shopping_preferences=data['shopping_preferences'],
                    live_shopping_frequency=data['live_shopping_frequency'],
                    ibs_answers=data['ibs_answers'],
                )
                return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    else:
        return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)

@csrf_exempt
def submit_post_questionnaire(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            required_fields = ['id', 'ibs_answers', 'sus_answers', 'ueq_answers']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({'success': False, 'error': f'Missing field: {field}'}, status=400)

            if not isinstance(data['ibs_answers'], list) or len(data['ibs_answers']) != 20:
                return JsonResponse({'success': False, 'error': 'ibs_answers must be a list of 20 items'}, status=400)

            for val in data['ibs_answers']:
                if not isinstance(val, int) or not (1 <= val <= 7):
                    return JsonResponse({'success': False, 'error': f'Invalid ibs answer: {val}. Must be int between 1 and 7'}, status=400)

            if not isinstance(data['sus_answers'], list) or len(data['sus_answers']) != 10:
                return JsonResponse({'success': False, 'error': 'sus_answers must be a list of 10 items'}, status=400)

            for val in data['sus_answers']:
                if not isinstance(val, int) or not (1 <= val <= 5):
                    return JsonResponse({'success': False, 'error': f'Invalid sus answer: {val}. Must be int between 1 and 5'}, status=400)

            if not isinstance(data['ueq_answers'], list) or len(data['ueq_answers']) != 26:
                return JsonResponse({'success': False, 'error': 'ueq_answers must be a list of 26 items'}, status=400)

            for val in data['ueq_answers']:
                if not isinstance(val, int) or not (1 <= val <= 7):
                    return JsonResponse({'success': False, 'error': f'Invalid ueq answer: {val}. Must be int between 1 and 7'}, status=400)

            if Post_Questionnaire.objects.filter(id=data['id']).exists():
                Post_Questionnaire.objects.filter(id=data['id']).update(
                    ibs_answers=data['ibs_answers'],
                    sus_answers=data['sus_answers'],
                    ueq_answers=data['ueq_answers'],
                )
                return JsonResponse({'success': True})
            else:
                Post_Questionnaire.objects.create(
                    id=data['id'],
                    ibs_answers=data['ibs_answers'],
                    sus_answers=data['sus_answers'],
                    ueq_answers=data['ueq_answers'],
                )
                return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

