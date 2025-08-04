from django.db import models

class ProductInfo(models.Model):
    id = models.AutoField(primary_key=True)
    experiment_id = models.IntegerField()
    image_id = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    brand = models.CharField(max_length=255)
    current_price = models.FloatField()
    original_price = models.FloatField()
    live_price = models.FloatField()
    price_comparison = models.CharField(max_length=255)
    sales_volume = models.CharField(max_length=255)
    sizes = models.JSONField()
    colors = models.JSONField()
    features = models.JSONField()
    positive_keywords = models.JSONField()
    negative_keywords = models.JSONField()
    real_review = models.CharField(max_length=255)
    sales_rating = models.FloatField()
    shipping_time = models.CharField(max_length=255)
    reviews_count = models.CharField(max_length=255)
    shipping_info = models.JSONField()
    return_policy = models.JSONField()

    def __str__(self):
        return f"{self.name} ({self.brand})"


class ExperimentInfo(models.Model):
    id = models.AutoField(primary_key=True)
    subject_id = models.IntegerField()
    experiment_id = models.IntegerField()
    subject_type = models.CharField(max_length=1)
    choice = models.BooleanField()
    choice_time = models.TimeField()

    def __str__(self):
        return f"Subject {self.subject_id} - Choice: {self.choice}"
