import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Dealers.css";
import "../assets/style.css";
import Header from "../Header/Header";

const PostReview = () => {
    const [dealer, setDealer] = useState({});
    const [review, setReview] = useState("");
    const [model, setModel] = useState("");
    const [year, setYear] = useState("");
    const [date, setDate] = useState("");
    const [carmodels, setCarmodels] = useState([]);
    const [error, setError] = useState("");

    const { id } = useParams();

    const baseUrl = window.location.origin + "/";
    const dealer_url = baseUrl + `djangoapp/dealer/${id}`;
    const review_url = baseUrl + `djangoapp/add_review`;
    const carmodels_url = baseUrl + `djangoapp/get_cars`;

    const postreview = async () => {
        setError("");

        let name =
            (sessionStorage.getItem("firstname") || "") +
            " " +
            (sessionStorage.getItem("lastname") || "");
        if (name.trim() === "" || name.includes("null")) {
            name = sessionStorage.getItem("username") || "Anonymous";
        }

        if (!model || !review || !date || !year) {
            setError("All fields are required.");
            return;
        }

        const model_split = model.split(" ");
        const make_chosen = model_split[0];
        const model_chosen = model_split.slice(1).join(" ");

        const jsoninput = JSON.stringify({
            name: name,
            dealership: id,
            review: review,
            purchase: true,
            purchase_date: date,
            car_make: make_chosen,
            car_model: model_chosen,
            car_year: year,
        });

        try {
            const res = await fetch(review_url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: jsoninput,
            });

            const json = await res.json();
            if (json.status === "Review submitted" || json.status === 200) {
                window.location.href = baseUrl + `dealer/${id}`;
            } else {
                setError("Could not submit the review. Please try again.");
            }
        } catch (e) {
            console.error(e);
            setError("Something went wrong while submitting the review.");
        }
    };

    const get_dealer = async () => {
        const res = await fetch(dealer_url, { method: "GET" });
        const retobj = await res.json();

        if (retobj.status === 200) {
            const dealerobjs = Array.from(retobj.dealer);
            if (dealerobjs.length > 0) setDealer(dealerobjs[0]);
        }
    };

    const get_cars = async () => {
        const res = await fetch(carmodels_url, { method: "GET" });
        const retobj = await res.json();
        const carmodelsarr = Array.from(retobj.CarModels || []);
        setCarmodels(carmodelsarr);
    };

    useEffect(() => {
        get_dealer();
        get_cars();
    }, [id]);

    return (
        <div className="postreview-page">
            <Header />
            <main className="container py-4">
                <section className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card shadow-sm postreview-card">
                            <div className="card-body">
                                <h1 className="h4 mb-3 text-secondary">
                                    Write a review for{" "}
                                    {dealer.full_name || "this dealer"}
                                </h1>
                                <p className="text-muted mb-4">
                                    Share your experience to help other
                                    customers make confident decisions.
                                </p>

                                {error && (
                                    <div className="alert alert-danger">
                                        {error}
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label
                                        htmlFor="review"
                                        className="form-label"
                                    >
                                        Your review
                                    </label>
                                    <textarea
                                        id="review"
                                        className="form-control"
                                        rows="5"
                                        value={review}
                                        onChange={(e) =>
                                            setReview(e.target.value)
                                        }
                                        placeholder="Tell us about your purchase and experience..."
                                    ></textarea>
                                </div>

                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label
                                            htmlFor="purchase_date"
                                            className="form-label"
                                        >
                                            Purchase date
                                        </label>
                                        <input
                                            type="date"
                                            id="purchase_date"
                                            className="form-control"
                                            onChange={(e) =>
                                                setDate(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label
                                            htmlFor="car_year"
                                            className="form-label"
                                        >
                                            Car year
                                        </label>
                                        <input
                                            type="number"
                                            id="car_year"
                                            className="form-control"
                                            min="2015"
                                            max="2023"
                                            value={year}
                                            onChange={(e) =>
                                                setYear(e.target.value)
                                            }
                                            placeholder="e.g. 2022"
                                        />
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <label
                                        htmlFor="cars"
                                        className="form-label"
                                    >
                                        Car make &amp; model
                                    </label>
                                    <select
                                        name="cars"
                                        id="cars"
                                        className="form-select"
                                        value={model}
                                        onChange={(e) =>
                                            setModel(e.target.value)
                                        }
                                    >
                                        <option value="" disabled>
                                            Choose car make and model
                                        </option>
                                        {carmodels.map((carmodel, index) => (
                                            <option
                                                key={
                                                    carmodel.CarMake +
                                                    "-" +
                                                    carmodel.CarModel +
                                                    "-" +
                                                    index
                                                }
                                                value={
                                                    carmodel.CarMake +
                                                    " " +
                                                    carmodel.CarModel
                                                }
                                            >
                                                {carmodel.CarMake}{" "}
                                                {carmodel.CarModel}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mt-4 d-flex justify-content-end">
                                    <button
                                        type="button"
                                        className="btn btn-primary px-4"
                                        onClick={postreview}
                                    >
                                        Post review
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default PostReview;
