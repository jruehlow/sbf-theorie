import random
from rest_framework import serializers
from .models import Question


class QuestionSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = (
            "id",
            "question",
            "options",
            "image_url",
            "category",
            "license",
        )

    def get_options(self, obj: Question):
        opts = [
            {"id": "1", "text": obj.option1, "isCorrect": True},
            {"id": "2", "text": obj.option2, "isCorrect": False},
            {"id": "3", "text": obj.option3, "isCorrect": False},
            {"id": "4", "text": obj.option4, "isCorrect": False},
        ]
        random.shuffle(opts)
        return opts

    def get_image_url(self, obj: Question):
        req = self.context.get("request")
        if obj.image and req:
            return req.build_absolute_uri(obj.image.url)
        return None
