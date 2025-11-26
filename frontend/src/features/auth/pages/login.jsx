import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { setAuthenticatedUser } from "@redux/slices/authSlice";

function Login() {
  const apiURL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch(`${apiURL}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        if (!result.is_verified) {
          navigate(`/auth/verify?user=${result.user}`);
        } else {
          const token = result.token;
          localStorage.setItem("jwt", token);
          localStorage.setItem(
            "jwt_expiration",
            Date.now() + 30 * 24 * 60 * 60 * 1000
          );
          const userData = jwtDecode(token);

          dispatch(
            setAuthenticatedUser({
              id: userData.id,
              email: userData.email,
              name: userData.name,
            })
          );

          navigate("/app/home");
        }
      } else {
        setErrorMsg(result.message || "Login failed");
      }
    } catch (error) {
      setErrorMsg("An unexpected error occurred. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRedirect = () => {
    setLoading(true);
    window.location.href = `${apiURL}/api/auth/google`;
  };

  return (
    <div className="m-5 min-w-80 max-w-md mx-auto bg-white p-8 rounded-sm shadow-sm">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back!</h1>
      <p className="text-sm text-gray-600">Enter your credentials to log in</p>

      <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            placeholder="you@example.com"
            className="mt-1 p-3 w-full rounded-sm border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            placeholder="••••••••"
            className="mt-1 p-3 w-full rounded-sm border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:outline-none"
          />
        </div>

        <div className="text-right">
          <Link
            to="/auth/forgot-password"
            className="text-sm text-gray-600 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-sm font-medium text-white transition duration-300 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gray-600 hover:bg-gray-700"
          }`}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="px-4 text-sm text-gray-500">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleRedirect}
          className={`flex items-center justify-center gap-3 p-3 w-full rounded-sm border border-gray-300 bg-gray-50 hover:shadow-sm transition ${
            loading ? "cursor-not-allowed opacity-70" : ""
          }`}
        >
          <img src="/google-color-icon.svg" alt="Google" className="w-6 h-6" />
          <span className="text-sm font-medium text-gray-700">
            Continue with Google
          </span>
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        Don’t have an account?{" "}
        <Link to="/auth/signup" className="text-gray-600 hover:underline">
          Register here!
        </Link>
      </div>
    </div>
  );
}

export default Login;
