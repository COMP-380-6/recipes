from flask import Flask
from flask_cdn import CDN
from whitenoise import WhiteNoise

# dotenv is not present (nor does it need to be) in production.
try:
    import dotenv

    dotenv.load_dotenv()
except ImportError:
    pass

cdn = CDN()


def create_app():
    app = Flask(__name__)
    app.config.from_pyfile("config.py", silent=True)
    app.wsgi_app = WhiteNoise(app.wsgi_app, root="web/static/", prefix="static/")

    # Serving through CDN is auto-disabled when in debug mode.
    cdn.init_app(app)

    # Important to import views after the app is created.
    from web import recipes

    app.register_blueprint(recipes.bp)
    app.add_url_rule("/", endpoint="index")

    return app