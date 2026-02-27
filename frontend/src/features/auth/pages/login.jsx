import { useState } from "react";
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
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
        Welcome back
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Sign in to continue your productivity workflow.
      </p>

      <form onSubmit={handleLogin} className="mt-7 flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
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
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-xs font-medium text-cyan-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            placeholder="********"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
            required
          />
        </div>

        {errorMsg && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-xl py-3 text-sm font-semibold text-white transition ${
            loading
              ? "cursor-not-allowed bg-slate-400"
              : "bg-slate-900 hover:bg-slate-800"
          }`}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-xs uppercase tracking-[0.18em] text-slate-400">or</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleRedirect}
          className={`flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${
            loading ? "cursor-not-allowed opacity-70" : ""
          }`}
        >
          <img src="/google-color-icon.svg" alt="Google" className="h-5 w-5" />
          Continue with Google
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link to="/auth/signup" className="font-medium text-cyan-700 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default Login;
