import React, { useState } from "react";
import "./Register.css";
import Header from "../Header/Header";
import user_icon from "../assets/person.png";
import email_icon from "../assets/email.png";
import password_icon from "../assets/password.png";
import close_icon from "../assets/close.png";

const Register = () => {
    // State variables for form inputs
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [error, setError] = useState("");

    const goHome = () => {
        window.location.href = window.location.origin;
    };

    // Handle form submission
    const register = async (e) => {
        e.preventDefault();
        setError("");

        const register_url = window.location.origin + "/djangoapp/registration";

        try {
            const res = await fetch(register_url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userName,
                    password,
                    firstName,
                    lastName,
                    email,
                }),
            });

            const json = await res.json();

            // Align with Django registration view:
            // success:  {"userName": ..., "status": "Authenticated"}
            // user exists: {"userName": ..., "status": "User already exists"}
            // email exists: {"email": ..., "status": "Email already in use"}
            // errors: {"error": "..."}
            if (json.status === "Authenticated") {
                sessionStorage.setItem("username", json.userName);
                window.location.href = window.location.origin;
            } else if (json.status === "User already exists") {
                setError("A user with this username already exists.");
            } else if (json.status === "Email already in use") {
                setError("This email address is already registered.");
            } else if (json.error) {
                setError(json.error);
            } else {
                setError("Registration failed. Please try again.");
            }
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        }
    };

    return (
        <div>
            <Header />
            <div className="register-overlay">
                <div className="register-modal">
                    <div className="register-header">
                        <span className="register-title">Create your account</span>
                        <button
                            type="button"
                            className="register-close-btn"
                            onClick={goHome}
                        >
                            <img
                                src={close_icon}
                                alt="Close"
                                className="register-close-icon"
                            />
                        </button>
                    </div>
                    <p className="register-subtitle">
                        Sign up to save your favorite dealerships and manage your reviews.
                    </p>

                    {error && <div className="register-error">{error}</div>}

                    <form onSubmit={register}>
                        <div className="register-inputs">
                            <div className="register-input">
                                <img
                                    src={user_icon}
                                    className="img_icon"
                                    alt="Username"
                                />
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    className="register-field"
                                    onChange={(e) => setUserName(e.target.value)}
                                />
                            </div>
                            <div className="register-input">
                                <img
                                    src={user_icon}
                                    className="img_icon"
                                    alt="First Name"
                                />
                                <input
                                    type="text"
                                    name="first_name"
                                    placeholder="First name"
                                    className="register-field"
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>
                            <div className="register-input">
                                <img
                                    src={user_icon}
                                    className="img_icon"
                                    alt="Last Name"
                                />
                                <input
                                    type="text"
                                    name="last_name"
                                    placeholder="Last name"
                                    className="register-field"
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                            <div className="register-input">
                                <img
                                    src={email_icon}
                                    className="img_icon"
                                    alt="Email"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email address"
                                    className="register-field"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="register-input">
                                <img
                                    src={password_icon}
                                    className="img_icon"
                                    alt="Password"
                                />
                                <input
                                    name="psw"
                                    type="password"
                                    placeholder="Password"
                                    className="register-field"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="register-actions">
                            <input
                                className="btn-primary-main"
                                type="submit"
                                value="Register"
                            />
                        </div>
                        <div className="register-footer">
                            <span>Already have an account?</span>
                            <a href="/login" className="register-link">
                                Login here
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
