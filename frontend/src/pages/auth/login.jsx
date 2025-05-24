import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { setAuthenticatedUser } from "../../redux/slices/authSlice";

function Login() {
  const apiURL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const response = await fetch(`${apiURL}/api/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        const token = result.token;
        localStorage.setItem("jwt", token);
        localStorage.setItem(
          "jwt_expiration",
          Date.now() + 30 * 24 * 60 * 60 * 1000
        );
        // const data = await response.json();

        const data = jwtDecode(result.token);
        const authenticatedUser = {
          id: data.id,
          email: data.email,
          name: data.name,
        };
        dispatch(setAuthenticatedUser(authenticatedUser));

        navigate("/app/home");
        setLoginLoading(false);
      } else {
        const result = await response.json();
        setLoginLoading(false);
        setLoginError(true);
        setLoginErrorMessage(result.message);
      }
    } catch (error) {
      setLoginLoading(false);
      setLoginError(true);
      setLoginErrorMessage("An error occured while logging");
      console.log(`Error occured while logging in ${error}`);
    }
  };

  // const handleGoogleLoginSuccess = async (response) => { // Remove the async
  //     try {
  //         const googleToken = response.credential;

  //         const googleLoginResponse = await fetch(`${apiURL}/api/auth/google`, {
  //             method: "POST",
  //             headers: {
  //                 "Content-Type": "application/json",
  //             },
  //             body: JSON.stringify({ token: googleToken }),
  //         });

  //         if (googleLoginResponse.ok) {
  //             const result = await googleLoginResponse.json();
  //             const token = result.token;
  //             localStorage.setItem("jwt", token);
  //             localStorage.setItem("jwt_expiration", Date.now() + 60 * 60 * 1000);
  //             navigate("/app/home");
  //         } else {
  //             const result = await googleLoginResponse.json();
  //             setLoginError(true);
  //             setLoginErrorMessage(result.message);
  //         }
  //     } catch (error) {
  //         setLoginError(true);
  //         setLoginErrorMessage("Google login failed");
  //     }
  // };

  const redirectToGoogle = () => {
    window.location.href = `${apiURL}/api/auth/google`; // Redirect the user to the Google OAuth endpoint
  };

  return (
    <div className="m-5 min-w-80 max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back!</h1>
        <p className="text-sm text-gray-600">
          Enter your credentials to log in to your account
        </p>
      </div>

      <div className="mt-8">
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label
              htmlFor="email-input"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email-input"
              name="email"
              value={formData.email}
              className="bg-gray-50 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="password-input"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password-input"
              name="password"
              value={formData.password}
              className="bg-gray-50 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              onChange={handleChange}
            />
          </div>

          <div className="text-right">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {loginError && (
              <p className="text-red-500 text-sm">{loginErrorMessage}</p>
            )}
            {loginLoading ? (
              <div className="flex justify-center">
                <span className="loader"></span>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
              >
                Log In
              </button>
            )}
          </div>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="px-4 text-sm text-gray-500">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <div
            className="flex items-center justify-center gap-3 bg-gray-50 border border-gray-300 rounded-lg p-3 cursor-pointer hover:shadow-md transition duration-300"
            onClick={redirectToGoogle}
          >
            <img
              src="/google-color-icon.svg"
              alt="Google Icon"
              className="w-6 h-6"
            />
            <span className="text-sm font-medium text-gray-700">
              Continue with Google
            </span>
          </div>
        </form>
      </div>

      <div className="text-center mt-6 text-sm text-gray-600">
        <p>
          Don’t have an account?{" "}
          <Link to="/auth/signup" className="text-blue-600 hover:underline">
            Register here!
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
