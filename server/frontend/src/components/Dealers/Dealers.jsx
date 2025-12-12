import React, { useState, useEffect } from "react";
import "./Dealers.css";
import "../assets/style.css";
import Header from "../Header/Header";
import review_icon from "../assets/reviewicon.png";

const Dealers = () => {
    const [dealersList, setDealersList] = useState([]);
    const [states, setStates] = useState([]);
    const [selectedState, setSelectedState] = useState("");

    const dealer_url = "/djangoapp/get_dealers";

    const isLoggedIn = sessionStorage.getItem("username") != null;

    const getDealers = async () => {
        const res = await fetch(dealer_url, {
            method: "GET",
        });
        const retobj = await res.json();

        if (retobj.status === 200) {
            const all_dealers = Array.from(retobj.dealers);

            // collect unique states
            const stateList = Array.from(
                new Set(all_dealers.map((dealer) => dealer.state))
            ).sort();

            setStates(stateList);
            setDealersList(all_dealers);
        }
    };

    const filterDealers = async (state) => {
        setSelectedState(state);

        if (!state || state === "All") {
            // Reset to all dealers
            getDealers();
            return;
        }

        const urlByState = `/djangoapp/get_dealers/${state}`;
        const res = await fetch(urlByState, {
            method: "GET",
        });
        const retobj = await res.json();

        if (retobj.status === 200) {
            const state_dealers = Array.from(retobj.dealers);
            setDealersList(state_dealers);
        }
    };

    useEffect(() => {
        getDealers();
    }, []);

    return (
        <div className="dealers-page bg-light min-vh-100">
            <Header />

            <main className="container py-4">
                {/* Header + Filter */}
                <section className="mb-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <div>
                            <h1 className="h3 mb-1 text-secondary">
                                Our dealerships
                            </h1>
                            <p className="text-muted mb-0">
                                Browse all locations or filter by state to find a
                                dealer near you.
                            </p>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <label
                                htmlFor="state"
                                className="form-label mb-0 me-1 text-muted small"
                            >
                                Filter by state
                            </label>
                            <select
                                name="state"
                                id="state"
                                className="form-select form-select-sm"
                                style={{ minWidth: "160px" }}
                                value={selectedState || ""}
                                onChange={(e) => filterDealers(e.target.value)}
                            >
                                <option value="" disabled>
                                    Choose state...
                                </option>
                                <option value="All">All states</option>
                                {states.map((state) => (
                                    <option key={state} value={state}>
                                        {state}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Dealers table */}
                <section className="card shadow-sm">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 dealers-table">
                                <thead className="table-light">
                                    <tr>
                                        <th scope="col">ID</th>
                                        <th scope="col">Dealer name</th>
                                        <th scope="col">City</th>
                                        <th scope="col">Address</th>
                                        <th scope="col">ZIP</th>
                                        <th scope="col">State</th>
                                        {isLoggedIn && (
                                            <th scope="col" className="text-center">
                                                Review dealer
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {dealersList.length === 0 ? (
                                        <tr>
                                            <td colSpan={isLoggedIn ? 7 : 6}>
                                                <p className="text-muted text-center mb-0 py-3">
                                                    No dealerships found.
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        dealersList.map((dealer) => (
                                            <tr key={dealer.id}>
                                                <td>{dealer.id}</td>
                                                <td>
                                                    <a
                                                        href={`/dealer/${dealer.id}`}
                                                        className="dealer-link"
                                                    >
                                                        {dealer.full_name}
                                                    </a>
                                                </td>
                                                <td>{dealer.city}</td>
                                                <td>{dealer.address}</td>
                                                <td>{dealer.zip}</td>
                                                <td>{dealer.state}</td>
                                                {isLoggedIn && (
                                                    <td className="text-center">
                                                        <a
                                                            href={`/postreview/${dealer.id}`}
                                                            className="btn btn-link p-0"
                                                        >
                                                            <img
                                                                src={review_icon}
                                                                className="review_icon"
                                                                alt="Post review"
                                                            />
                                                        </a>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dealers;
