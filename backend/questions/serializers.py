import random
from rest_framework import serializers
from .models import Question


class QuestionSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = (
            "id",
            "question",
            "options",
            "image",
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
