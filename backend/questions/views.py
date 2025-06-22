from rest_framework import viewsets
from .models import Question
from .serializers import QuestionSerializer


class QuestionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/questions/?license=<slug>&category=<slug>
    """
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        lic = self.request.query_params.get("license")
        cat = self.request.query_params.get("category")
        if lic:
            qs = qs.filter(license=lic)
        if cat:
            qs = qs.filter(category=cat)
        return qs
