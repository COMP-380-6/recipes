import mimetypes
import os
import warnings

import secure
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
mimetypes.add_type("application/javascript", ".js")  # Ensure JS modules use the right mimetype.

csp = (
    secure.ContentSecurityPolicy()
    .default_src("'none'")
    .base_uri("'self'")
    .connect_src("'self'")
    .form_action("'self'")
    .frame_ancestors("'self'")
    .style_src("'self'")
    .script_src("'self'")
    .img_src("'self'", "spoonacular.com")
)
secure_headers = secure.Secure(csp=csp, permissions=secure.PermissionsPolicy())


def create_app():
    app = Flask(__name__)
    app.config.from_pyfile("config.py")

    try:
        app.config["SPOONACULAR_KEY"] = os.environ["SPOONACULAR_KEY"]
    except KeyError:
        app.config["SPOONACULAR_KEY"] = None
        warnings.warn("A Spoonacular API key was not provided!")

    if app.config.get("DEBUG"):
        app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0

    # Serving through CDN is auto-disabled when in debug mode.
    app.wsgi_app = WhiteNoise(app.wsgi_app, root="web/static/", prefix="static/")
    cdn.init_app(app)

    # Important to import views after the app is created.
    from web import api, recipes

    api.limiter.init_app(app)
    api.session.params = {"apiKey": app.config["SPOONACULAR_KEY"]}

    app.register_blueprint(api.bp, url_prefix="/api")
    app.register_blueprint(recipes.bp)
    app.add_url_rule("/", endpoint="index")

    # Call set_secure_headers for all requests from all blueprints.
    app.after_request_funcs.setdefault(None, []).append(set_secure_headers)

    return app


def set_secure_headers(response):
    secure_headers.framework.flask(response)
    return response
