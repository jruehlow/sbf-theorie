# 1) base image
FROM python:3.10-slim

# disable .pyc, buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# copy & install Python deps
COPY requirements.txt .
RUN pip install --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# copy Django code
COPY . .

# expose Django port
EXPOSE 8000

ENTRYPOINT ["sh","-c", "\
    python manage.py migrate --noinput && \
    python manage.py collectstatic --noinput && \
    exec gunicorn backend.wsgi:application \
      --bind 0.0.0.0:8000 \
      --workers 3 \
"]
