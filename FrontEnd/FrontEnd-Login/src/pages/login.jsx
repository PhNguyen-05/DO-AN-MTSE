// src/pages/login.jsx

import { useState } from "react";
import { FaEnvelope, FaLock, FaSignInAlt, FaUserGraduate } from "react-icons/fa";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("accessToken", data.accessToken);

                alert("Đăng nhập thành công!");

                window.location.href = data.redirectUrl;
                return;
            }

            setError(
                data.message ||
                data?.errors?.[0]?.msg ||
                "Đăng nhập thất bại"
            );
        } catch (err) {
            setError("Không thể kết nối tới máy chủ.");
        }
    };

    return (
        <>
            <style>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: Arial, sans-serif;
                }

                .login-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    background:
                        linear-gradient(
                            rgba(0, 0, 0, 0.55),
                            rgba(0, 0, 0, 0.55)
                        ),
                        url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1974&auto=format&fit=crop')
                        center/cover no-repeat;
                }

                .login-container {
                    width: 100%;
                    max-width: 420px;
                }

                .login-card {
                    background: rgba(255, 255, 255, 0.12);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border-radius: 20px;
                    padding: 40px 30px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
                    color: white;
                }

                .login-title {
                    text-align: center;
                    font-size: 32px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }

                .login-subtitle {
                    text-align: center;
                    color: rgba(255, 255, 255, 0.8);
                    margin-bottom: 30px;
                    font-size: 14px;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                }

                .input-wrapper {
                    position: relative;
                }

                .input-icon {
                    position: absolute;
                    top: 50%;
                    left: 15px;
                    transform: translateY(-50%);
                    color: rgba(255, 255, 255, 0.8);
                }

                .form-input {
                    width: 100%;
                    height: 50px;
                    border: none;
                    outline: none;
                    border-radius: 12px;
                    padding-left: 45px;
                    background: rgba(255, 255, 255, 0.15);
                    color: white;
                    font-size: 15px;
                }

                .form-input::placeholder {
                    color: rgba(255, 255, 255, 0.7);
                }

                .form-input:focus {
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    background: rgba(255, 255, 255, 0.2);
                }

                .login-btn {
                    width: 100%;
                    height: 50px;
                    border: none;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #4f46e5, #7c3aed);
                    color: white;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: 0.3s;
                }

                .login-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(124, 58, 237, 0.4);
                }

                .error-message {
                    background: rgba(255, 0, 0, 0.15);
                    border: 1px solid rgba(255, 0, 0, 0.4);
                    color: #fff;
                    padding: 12px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                    font-size: 14px;
                }

                .forgot-password {
                    text-align: center;
                    margin-top: 20px;
                }

                .forgot-password a {
                    color: rgba(255, 255, 255, 0.8);
                    text-decoration: none;
                    font-size: 14px;
                }

                .forgot-password a:hover {
                    color: white;
                }

                @media (max-width: 576px) {
                    .login-card {
                        padding: 30px 20px;
                    }

                    .login-title {
                        font-size: 28px;
                    }
                }
            `}</style>

            <div className="login-page">
                <div className="login-container">
                    <div className="login-card">
                        <h1 className="login-title">
                            <FaUserGraduate
                                style={{
                                    marginRight: "10px",
                                }}
                            />
                            LOGIN
                        </h1>

                        <p className="login-subtitle">
                            Đăng nhập vào hệ thống luyện thi
                        </p>

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">
                                    Email
                                </label>

                                <div className="input-wrapper">
                                    <FaEnvelope className="input-icon" />

                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="example@gmail.com"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Mật khẩu
                                </label>

                                <div className="input-wrapper">
                                    <FaLock className="input-icon" />

                                    <input
                                        type="password"
                                        className="form-input"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="login-btn"
                            >
                                <FaSignInAlt
                                    style={{
                                        marginRight: "8px",
                                    }}
                                />
                                ĐĂNG NHẬP
                            </button>
                        </form>

                        <div className="forgot-password">
                            <a href="#">
                                Quên mật khẩu?
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}