from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import logout, login, authenticate
from django.views.decorators.csrf import csrf_exempt
from .populate import initiate
from .models import CarModel
from .restapis import get_request, analyze_review_sentiments, post_review

import logging
import json

# If you have a restapis.py, uncomment and adjust:
# from .restapis import get_dealers_from_cf, get_dealer_reviews_from_cf
# from .restapis import post_request

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
        "lastName": "...",
        "email": "..."
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
    email = data.get("email", "").strip()

    if not username or not password:
        return JsonResponse(
            {"error": "Username and password are required"},
            status=400,
        )

    # Optional but nice: require email too
    if not email:
        return JsonResponse(
            {"error": "Email is required"},
            status=400,
        )

    # Check if username already exists
    if User.objects.filter(username=username).exists():
        logger.warning(
            "Registration failed, user already exists: %s", username
        )
        return JsonResponse(
            {"userName": username, "status": "User already exists"},
            status=400,
        )

    # Optionally also check if email is already in use
    if User.objects.filter(email=email).exists():
        logger.warning("Registration failed, email already used: %s", email)
        return JsonResponse(
            {"email": email, "status": "Email already in use"},
            status=400,
        )

    # Create user
    user = User.objects.create_user(
        username=username,
        password=password,
        first_name=first_name,
        last_name=last_name,
        email=email,
    )
    user.save()
    logger.info("New user registered: %s", username)

    # Log them in immediately and return JSON like the login endpoint
    login(request, user)
    return JsonResponse(
        {"userName": username, "status": "Authenticated"},
        status=201,
    )


# Get Cars Request
def get_cars(request):
    """
    count = CarMake.objects.filter().count()
    print(count)
    if(count == 0):
        initiate()
    """
    count_models = CarModel.objects.count()
    print("CarModel count:", count_models)

    if count_models == 0:
        initiate()

    car_models = CarModel.objects.select_related('car_make')
    cars = []
    for car_model in car_models:
        cars.append(
            {"CarModel": car_model.name, "CarMake": car_model.car_make.name}
        )
    return JsonResponse({"CarModels": cars})


# Render the index page with a list of dealerships
def get_dealerships(request, state="All"):
    if (state == "All"):
        endpoint = "/fetchDealers"
    else:
        endpoint = "/fetchDealers/"+state
    dealerships = get_request(endpoint)
    return JsonResponse({"status": 200, "dealers": dealerships})


# Render the reviews of a dealer
def get_dealer_reviews(request, dealer_id):
    if request.method != "GET":
        return JsonResponse(
            {"status": 405, "message": "Method not allowed"}, status=405
        )

    # Cloudant-Reviews holen
    endpoint = f"/fetchReviews/dealer/{dealer_id}"
    reviews = get_request(endpoint)  # Liste von dicts

    review_list = []

    for r in reviews:
        review_detail = {
            "name": r.get("name"),
            "review": r.get("review"),
            "purchase": r.get("purchase"),
            "purchase_date": r.get("purchase_date"),
            "car_make": r.get("car_make"),
            "car_model": r.get("car_model"),
            "car_year": r.get("car_year"),
        }

        # Sentiment analysieren – aber defensiv
        try:
            sentiment_response = analyze_review_sentiments(
                r.get("review", "")
            )
        except Exception:
            sentiment_response = None

        if (sentiment_response and isinstance(sentiment_response, dict) and
                "sentiment" in sentiment_response):
            review_detail["sentiment"] = sentiment_response["sentiment"]
        else:
            # Fallback, wenn Service down / Fehler / None
            review_detail["sentiment"] = "neutral"

        review_list.append(review_detail)

    return JsonResponse({"status": 200, "reviews": review_list})


# Render dealer details (and optionally its reviews)
def get_dealer_details(request, dealer_id):
    if (dealer_id):
        endpoint = "/fetchDealer/"+str(dealer_id)
        dealership = get_request(endpoint)
        return JsonResponse({"status": 200, "dealer": dealership})
    else:
        return JsonResponse({"status": 400, "message": "Bad Request"})


# Submit a review (GET to show form, POST to send data)
@csrf_exempt
def add_review(request):
    if not request.user.is_anonymous:
        data = json.loads(request.body)
        try:
            post_review(data)
            return JsonResponse({"status": 200})
        except Exception:
            return JsonResponse(
                {"status": 401, "message": "Error in posting review"}
            )
    else:
        return JsonResponse({"status": 403, "message": "Unauthorized"})
