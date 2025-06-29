import json
import os

from django.core.management.base import BaseCommand, CommandError

from questions.models import Question


class Command(BaseCommand):
    help = (
        "Wipes all existing questions and re-imports from a JSON file. "
        "Handles duplicate/sluggified IDs by appending a counter suffix."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "json_file",
            type=str,
            help="Path to the JSON file containing an array of questions",
        )

    def handle(self, *args, **options):
        json_path = options["json_file"]
        if not os.path.exists(json_path):
            raise CommandError(f"File not found: {json_path}")

        # 1) Delete everything
        deleted_count, _ = Question.objects.all().delete()
        self.stdout.write(
            self.style.WARNING(f"Deleted {deleted_count} existing questions")
        )

        # 2) Load JSON
        try:
            with open(json_path, encoding="utf-8") as fp:
                data = json.load(fp)
        except Exception as e:
            raise CommandError(f"Error parsing JSON: {e}")

        created = 0

        id = 1
        # 3) Iterate and import
        for entry in data:
            # prepare fields
            q = Question(
                id=id,
                license=entry["license"],
                category=entry["category"],
                question=entry["question"],
                option1=entry["option1"],
                option2=entry["option2"],
                option3=entry["option3"],
                option4=entry["option4"],
            )

            # image may be null or a relative path under MEDIA_ROOT
            img = entry.get("image")
            if img:
                q.image = img
            else:
                # ensures any old image is cleared
                q.image = None

            # save
            q.save()
            created += 1
            self.stdout.write(self.style.SUCCESS(f"Created {id}"))
            id += 1

        self.stdout.write(
            self.style.SUCCESS(f"Import complete: {created} questions added.")
        )
