import json
from pathlib import Path

import flask
import requests
from flask import current_app as app
from flask import request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.exceptions import HTTPException

SPOONACULAR_BASE = "https://api.spoonacular.com/"
DEBUG_DATA_PATH = Path("recipe_data.json")

bp = flask.Blueprint("api", __name__)
limiter = Limiter(key_func=get_remote_address)

session = requests.Session()
session.hooks = {"response": lambda response, *args, **kwargs: response.raise_for_status()}


@bp.errorhandler(HTTPException)
def handle_exception(error: HTTPException):
    """Return a JSON response instead of HTML for HTTP errors."""
    response = error.get_response()

    # Only display the name if there's no description.
    description = f": {error.description}" if error.description else ""

    # Mimic Spoonacular's response format.
    response.data = json.dumps(
        dict(
            status="failure",
            code=error.code,
            message=error.name + description,
        )
    )
    response.content_type = "application/json"

    return response


@bp.errorhandler(requests.HTTPError)
def handle_requests_exception(error: requests.HTTPError):
    """Forward the response from Spoonacular."""
    return flask.Response(
        response=error.response.content,
        status=error.response.status_code,
        content_type=error.response.headers["content-type"],
    )


@bp.route("/search")
@limiter.limit("1/minute", deduct_when=lambda r: r.status_code == 200)
def search_api():
    # Disallow these to conserve the request quota.
    for arg in ("addRecipeNutrition",):
        if request.args.get(arg) == "true":
            flask.abort(403, description=f"{arg} is disabled.")

    if app.config.get("DEBUG") and DEBUG_DATA_PATH.exists():
        return DEBUG_DATA_PATH.read_text(encoding="utf8"), 201, {"content-type": "application/json"}

    response = session.get(f"{SPOONACULAR_BASE}recipes/complexSearch", params=request.args)
    return response.text, 200, {"content-type": "application/json"}


@bp.route("/ingredients")
@limiter.limit("150/minute", deduct_when=lambda r: r.status_code == 200)
def ingredient_api():
    # Disallow this to conserve the request quota.
    if request.args.get("metaInformation") == "true":
        flask.abort(403, description="metaInformation is disabled.")

    response = session.get(f"{SPOONACULAR_BASE}food/ingredients/autocomplete", params=request.args)
    return response.text, 200, {"content-type": "application/json"}
