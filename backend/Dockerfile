FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

ENTRYPOINT ["sh","-c", "\
    python manage.py migrate --noinput && \
    python manage.py makemigrations questions && \
    python manage.py import_questions data/questions.json && \
    python manage.py migrate --noinput && \
    python manage.py collectstatic --noinput && \
    exec gunicorn config.wsgi:application \
      --bind 0.0.0.0:8000 \
      --workers 3 \
"]
