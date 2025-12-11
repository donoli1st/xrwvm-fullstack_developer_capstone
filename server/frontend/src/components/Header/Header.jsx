import React from "react";
import "../assets/style.css";
import "../assets/bootstrap.min.css";

const Header = () => {
    const logout = async (e) => {
        e.preventDefault();
        const logout_url = window.location.origin + "/djangoapp/logout";

        try {
            const res = await fetch(logout_url, {
                method: "GET",
            });

            const json = await res.json();
            if (json) {
                const username = sessionStorage.getItem("username");
                sessionStorage.removeItem("username");
                alert("Logging out " + username + "...");
                window.location.href = window.location.origin;
            } else {
                alert("The user could not be logged out.");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong while logging out.");
        }
    };

    const curr_user = sessionStorage.getItem("username");

    let authSection = (
        <div className="d-flex align-items-center gap-2">
            <a className="btn btn-outline-light btn-sm" href="/login">
                Login
            </a>
            <a className="btn btn-light btn-sm" href="/register">
                Register
            </a>
        </div>
    );

    if (curr_user !== null && curr_user !== "") {
        authSection = (
            <div className="d-flex align-items-center gap-3">
                <span className="text-white fw-semibold">{curr_user}</span>
                <button
                    type="button"
                    className="btn btn-outline-light btn-sm"
                    onClick={logout}
                >
                    Logout
                </button>
            </div>
        );
    }

    return (
        <nav
            className="navbar navbar-expand-lg navbar-dark"
            style={{ backgroundColor: "#00a8c6" }}
        >
            <div className="container">
                <a className="navbar-brand fw-bold" href="/">
                    Best Cars
                </a>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarText"
                    aria-controls="navbarText"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarText">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <a
                                className="nav-link"
                                aria-current="page"
                                href="/"
                            >
                                Home
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/about">
                                About Us
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/contact">
                                Contact Us
                            </a>
                        </li>
                    </ul>

                    <div id="loginlogout">{authSection}</div>
                </div>
            </div>
        </nav>
    );
};

export default Header;
