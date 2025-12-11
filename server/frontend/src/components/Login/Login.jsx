import React, { useState } from "react";
import "./Login.css";
import Header from "../Header/Header";

const Login = ({ onClose }) => {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [open, setOpen] = useState(true);
    const [error, setError] = useState("");

    const login_url = window.location.origin + "/djangoapp/login";

    const login = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch(login_url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userName: userName,
                    password: password,
                }),
            });

            const json = await res.json();
            if (json.status != null && json.status === "Authenticated") {
                sessionStorage.setItem("username", json.userName);
                setOpen(false);
            } else {
                setError("The user could not be authenticated. Please check your credentials.");
            }
        } catch (err) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        }
    };

    if (!open) {
        window.location.href = "/";
    }

    return (
        <div>
            <Header />
            <div className="login-overlay" onClick={onClose}>
                <div
                    className="modalContainer"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <form className="login-panel" onSubmit={login}>
                        <h2 className="login-title">Sign in to Best Cars</h2>
                        <p className="login-subtitle">
                            Access your account to manage favorites, reviews, and more.
                        </p>

                        {error && <div className="login-error">{error}</div>}

                        <div className="login-field">
                            <label className="login-label" htmlFor="username">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                name="username"
                                placeholder="Enter your username"
                                className="login-input"
                                onChange={(e) => setUserName(e.target.value)}
                            />
                        </div>

                        <div className="login-field">
                            <label className="login-label" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                name="psw"
                                type="password"
                                placeholder="Enter your password"
                                className="login-input"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="login-actions">
                            <input
                                className="btn-primary-main"
                                type="submit"
                                value="Login"
                            />
                            <button
                                type="button"
                                className="btn-outline-main"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>

                        <div className="login-footer">
                            <span>New to Best Cars?</span>
                            <a className="loginlink" href="/register">
                                Register now
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;