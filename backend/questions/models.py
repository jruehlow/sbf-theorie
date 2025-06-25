from django.db import models


class Question(models.Model):
    id = models.SlugField(primary_key=True)
    category = models.CharField(max_length=100)
    license = models.CharField(max_length=100)
    question = models.TextField()
    option1 = models.CharField("correct answer", max_length=255)
    option2 = models.CharField("wrong answer", max_length=255)
    option3 = models.CharField("wrong answer", max_length=255)
    option4 = models.CharField("wrong answer", max_length=255)
    image = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.id} ({self.license}/{self.category})"
