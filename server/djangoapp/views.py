from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import logout, login, authenticate
from django.contrib import messages
from datetime import datetime
from django.views.decorators.csrf import csrf_exempt

import logging
import json

# If you have a restapis.py, uncomment and adjust:
# from .restapis import get_dealers_from_cf, get_dealer_reviews_from_cf, post_request

logger = logging.getLogger(__name__)


# Login view to handle sign-in request (JSON-based)
@csrf_exempt
def login_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    username = data.get("userName", "")
    password = data.get("password", "")

    user = authenticate(username=username, password=password)
    result = {"userName": username}

    if user is not None:
        login(request, user)
        result["status"] = "Authenticated"
    else:
        result["status"] = "Invalid credentials"

    return JsonResponse(result)


# Logout view to handle sign-out request
@csrf_exempt
def logout_request(request):
    if request.user.is_authenticated:
        username = request.user.username
    else:
        username = ""

    logout(request)
    logger.info("User %s logged out.", username)

    return JsonResponse(
        {
            "userName": "",
            "status": "Logged out",
        }
    )


# Registration view to handle sign-up request (JSON-based)
@csrf_exempt
def registration(request):
    """
    Expected JSON body:
    {
        "userName": "...",
        "password": "...",
        "firstName": "...",
        "lastName": "..."
    }
    """
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    username = data.get("userName", "").strip()
    password = data.get("password", "")
    first_name = data.get("firstName", "").strip()
    last_name = data.get("lastName", "").strip()

    if not username or not password:
        return JsonResponse({"error": "Username and password are required"}, status=400)

    if User.objects.filter(username=username).exists():
        logger.warning("Registration failed, user already exists: %s", username)
        return JsonResponse(
            {"userName": username, "status": "User already exists"},
            status=400,
        )

    user = User.objects.create_user(
        username=username,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )
    user.save()
    logger.info("New user registered: %s", username)

    login(request, user)
    return JsonResponse(
        {"userName": username, "status": "Registered"},
        status=201,
    )


# Render the index page with a list of dealerships
def get_dealerships(request):
    """
    Renders the home page with a list of dealerships.
    Replace the dummy list with a call to your external API if needed.
    """
    # Example with external API:
    # url = "https://<your-cloud-function-url>/api/dealership"
    # dealerships = get_dealers_from_cf(url)

    dealerships = []  # placeholder
    context = {"dealership_list": dealerships}

    return render(request, "djangoapp/index.html", context)


# Render the reviews of a dealer
def get_dealer_reviews(request, dealer_id):
    """
    Renders a template showing reviews for a specific dealer.
    """
    # Example with external API:
    # url = "https://<your-cloud-function-url>/api/review"
    # reviews = get_dealer_reviews_from_cf(url, dealer_id=dealer_id)

    reviews = []  # placeholder
    context = {
        "dealer_id": dealer_id,
        "reviews": reviews,
    }
    return render(request, "djangoapp/dealer_reviews.html", context)


# Render dealer details (and optionally its reviews)
def get_dealer_details(request, dealer_id):
    """
    Renders dealer details (and optionally related reviews).
    """
    # Example:
    # dealer_url = "https://<your-cloud-function-url>/api/dealership"
    # review_url = "https://<your-cloud-function-url>/api/review"
    #
    # dealer = None
    # for d in get_dealers_from_cf(dealer_url):
    #     if d.id == dealer_id:
    #         dealer = d
    #         break
    #
    # reviews = get_dealer_reviews_from_cf(review_url, dealer_id=dealer_id)

    dealer = None
    reviews = []
    context = {
        "dealer": dealer,
        "dealer_id": dealer_id,
        "reviews": reviews,
    }
    return render(request, "djangoapp/dealer_details.html", context)


# Submit a review (GET to show form, POST to send data)
@csrf_exempt
def add_review(request, dealer_id):
    """
    GET: render a review form.
    POST: submit review data, usually to an external API.
    """
    if request.method == "GET":
        context = {
            "dealer_id": dealer_id,
        }
        return render(request, "djangoapp/add_review.html", context)

    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Authentication required"}, status=401)

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        review_text = data.get("review", "")
        purchase = data.get("purchase", False)
        purchase_date = data.get("purchase_date", None)
        car_make = data.get("car_make", "")
        car_model = data.get("car_model", "")
        car_year = data.get("car_year", "")

        payload = {
            "time": datetime.utcnow().isoformat(),
            "name": request.user.username,
            "dealership": dealer_id,
            "review": review_text,
            "purchase": purchase,
            "purchase_date": purchase_date,
            "car_make": car_make,
            "car_model": car_model,
            "car_year": car_year,
        }

        # Example call to external API:
        # url = "https://<your-cloud-function-url>/api/review"
        # post_request(url, payload=payload)

        logger.info("Review payload for dealer %s: %s", dealer_id, payload)

        return JsonResponse({"status": "Review submitted", "dealer_id": dealer_id})

    return JsonResponse({"error": "Method not allowed"}, status=405)
