from django.db import models

class Pre_Questionnaire(models.Model):
    id = models.IntegerField(primary_key=True) 
    age = models.CharField(max_length=20) # 18-25/26-35/36-45/46+
    gender = models.CharField(max_length=20) # 男/女/非二元/不愿透露
    education = models.CharField(max_length=20) # 高中及以下/本科/硕士/博士
    income = models.CharField(max_length=20) # ＜3000元/3000-6000元/6000-10000元/＞10000元
    shopping_preferences = models.JSONField() # 小红书/抖音/快手/淘宝/京东/哔哩哔哩/其他
    live_shopping_frequency = models.CharField(max_length=20) # 从不/每月少于1次/ 每月1-3次/每周1-2次/每周多次
    ibs_answers = models.JSONField() # 20

    def __str__(self):
        return f'Pre_Questionnaire #{self.id}'

class Post_Questionnaire(models.Model):
    id = models.IntegerField(primary_key=True)
    ibs_answers = models.JSONField() # 20
    sus_answers = models.JSONField() # 10
    ueq_answers = models.JSONField() # 26

    def __str__(self):
        return f'PostQuestionnaire #{self.id}'