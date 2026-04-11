#!/bin/sh
echo "Waiting for database..."
while ! nc -z db 5432; do sleep 1; done
echo "Database ready"

python manage.py migrate --settings=config.settings.production
python manage.py collectstatic --noinput --settings=config.settings.production

exec "$@"
