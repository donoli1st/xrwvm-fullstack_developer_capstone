import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Dealers.css";
import "../assets/style.css";
import positive_icon from "../assets/positive.png";
import neutral_icon from "../assets/neutral.png";
import negative_icon from "../assets/negative.png";
import review_icon from "../assets/reviewbutton.png";
import Header from "../Header/Header";

const Dealer = () => {
    const [dealer, setDealer] = useState({});
    const [reviews, setReviews] = useState([]);
    const [unreviewed, setUnreviewed] = useState(false);
    const { id } = useParams();

    // Base URLs
    const baseUrl = window.location.origin + "/";
    const dealer_url = baseUrl + `djangoapp/dealer/${id}`;
    const reviews_url = baseUrl + `djangoapp/reviews/dealer/${id}`;
    const post_review_url = baseUrl + `postreview/${id}`;

    const isLoggedIn = !!sessionStorage.getItem("username");

    const get_dealer = async () => {
        const res = await fetch(dealer_url, { method: "GET" });
        const retobj = await res.json();

        if (retobj.status === 200) {
            const dealerobjs = Array.from(retobj.dealer);
            setDealer(dealerobjs[0] || {});
        }
    };

    const get_reviews = async () => {
        const res = await fetch(reviews_url, { method: "GET" });
        const retobj = await res.json();

        if (retobj.status === 200) {
            if (retobj.reviews.length > 0) {
                setReviews(retobj.reviews);
            } else {
                setUnreviewed(true);
            }
        }
    };

    const senti_icon = (sentiment)=>{ 
        let icon = sentiment === "positive"?positive_icon:sentiment==="negative"?negative_icon:neutral_icon; return icon; 
    }


    useEffect(() => {
        get_dealer();
        get_reviews();
    }, [id]); // re-run if id changes

    return (
        <div className="dealer-page">
            <Header />
            <main className="container py-4">
                {/* Dealer header card */}
                <section className="card shadow-sm dealer-header-card mb-4">
                    <div className="card-body">
                        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                            <div>
                                <h1 className="h3 mb-2 text-secondary">
                                    {dealer.full_name || "Loading dealer..."}
                                </h1>
                                {dealer.city && (
                                    <h4 className="h6 text-muted mb-0">
                                        {dealer.city}, {dealer.address}, ZIP {dealer.zip},{" "}
                                        {dealer.state}
                                    </h4>
                                )}
                            </div>

                            {isLoggedIn && (
                                <a
                                    href={post_review_url}
                                    className="btn btn-primary d-flex align-items-center gap-2 post-review-btn"
                                >
                                    <img
                                        src={review_icon}
                                        alt="Post review"
                                        className="post-review-icon"
                                    />
                                    <span>Write a review</span>
                                </a>
                            )}
                        </div>
                    </div>
                </section>

                {/* Reviews section */}
                <section>
                    <div className="d-flex justify-content-center mb-3">
                        <h2 className="h5 text-muted mb-0 text-center">
                            Customer reviews
                        </h2>
                    </div>

                    <div className="reviews_panel">
                        {reviews.length === 0 && !unreviewed && (
                            <p className="text-muted text-center">Loading reviews...</p>
                        )}

                        {unreviewed && (
                            <div className="alert alert-info text-center">
                                No reviews yet. Be the first to write one!
                            </div>
                        )}

                        {!unreviewed && reviews.length > 0 && (
                            <div className="row g-3">
                                {reviews.map((review, index) => (
                                    <div className="col-md-6" key={index}>
                                        <div className="card review_card h-100">
                                            <div className="card-body d-flex align-items-start">
                                                {/* Text links */}
                                                <div className="flex-grow-1">
                                                    <p className="card-text mb-2">
                                                        {review.review}
                                                    </p>
                                                    <div className="small text-muted">
                                                        {review.name} ·{" "}
                                                        {review.car_make}{" "}
                                                        {review.car_model}{" "}
                                                        {review.car_year}
                                                    </div>
                                                </div>
                                                {/* Smiley rechts */}
                                                <img
                                                    src={senti_icon(review.sentiment)}
                                                    className="emotion_icon position-absolute top-50 start-100 translate-middle"
                                                    alt="Sentiment"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dealer;
