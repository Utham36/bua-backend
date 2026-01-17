import os
from pathlib import Path
import dj_database_url  # 👈 Added this for Render

"""
Django settings for core project.
"""

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
SECRET_KEY = 'django-insecure-5r!wox&+4tg1v7sk$2@&04v+-u_5hfnd3st0-1bny0s4g2%yzv'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']  # Allows Render to host the site


# Application definition

INSTALLED_APPS = [
    'catalog', 
    'users',
    'orders', 
    'chat',
    'rest_framework',
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # 👈 Recommended for serving static files on Render
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'


# Database
# This "Hybrid" setup works on BOTH Render and your Laptop automatically.

DATABASES = {
    'default': dj_database_url.config(
        # On Render, it reads the DATABASE_URL environment variable.
        # On your laptop, it uses this default string:
        default='postgres://postgres:Uthaimin3636@localhost:5432/halaal_db',
        conn_max_age=600
    )
}


# Password validation

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Enable WhiteNoise to serve static files on Render
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# --- UPDATED CORS SETTINGS START ---
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://bua-backend.onrender.com",
    "https://halaal-frontend.vercel.app",  # 👈 Added your Frontend URL
]

# This allows Django to pick up the list you typed into the Render Dashboard
extra_origin = os.getenv("CORS_ALLOWED_ORIGINS")
if extra_origin:
    CORS_ALLOWED_ORIGINS.append(extra_origin)

# Also allow credentials (important for login cookies)
CORS_ALLOW_CREDENTIALS = True
# --- UPDATED CORS SETTINGS END ---

# SETTINGS FOR UPLOADED FILES (IMAGES)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ]
}

# LOGGING CONFIGURATION
# Create a 'logs' folder if it doesn't exist
LOGGING_DIR = os.path.join(BASE_DIR, 'logs')
if not os.path.exists(LOGGING_DIR):
    os.makedirs(LOGGING_DIR)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'ERROR',  # Only record Errors (Crashes)
            'class': 'logging.FileHandler',
            'filename': os.path.join(LOGGING_DIR, 'server_errors.log'),
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'ERROR',
            'propagate': True,
        },
    },
}