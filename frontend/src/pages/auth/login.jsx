import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

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
    <div className="m-5 min-w-80">
      <div>
        <div>
          <h1 className="text-2xl font-bold">Welcome back!</h1>
          <p className="text-xs">Enter to login to your account</p>
        </div>

        <div className="mt-10">
          <form onSubmit={handleLogin} className="flex flex-col gap-2">
            <div className="flex flex-col">
              <label htmlFor="email-input" className="text-sm">
                email
              </label>
              <input
                type="email"
                id="email-input"
                name="email"
                value={formData.email}
                className="bg-white border rounded border-gray-400 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email"
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="password-input" className="text-sm">
                password
              </label>
              <input
                type="password"
                id="password-input"
                name="password"
                value={formData.password}
                className="bg-white border rounded border-gray-400 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="password"
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-row gap-10">
              <div className="text-sm text-blue-700 cursor-pointer hover:underline">
                Forgot your password?
              </div>
            </div>

            {/* login buttons */}
            <div className="flex flex-col gap-2 text-center">
              <div>
                {loginError && (
                  <p className="text-red-500 text-sm">{loginErrorMessage}</p>
                )}
              </div>
              {loginLoading ? (
                <span className="loading"></span>
              ) : (
                <button className="btn">login</button>
              )}
              <hr />
              <p className="text-sm">or login with</p>
              <div
                className="google-login-button flex flex-row justify-center items-center gap-5 border-black p-2 bg-white cursor-pointer rounded-md shadow-lg select-none"
                onClick={redirectToGoogle}
              >
                <img
                  src="/google-color-icon.svg"
                  alt="google-icon"
                  className="w-6 h-6"
                />
                <p>Continue with Google</p>
              </div>
              {/* <button
                onClick={redirectToGoogle}
                className="google-login-button"
              >
                Continue with Google
              </button> */}
            </div>
          </form>
        </div>
      </div>
      <div className="flex flex-row text-sm mt-3 gap-1">
        <p>Don't have an account? </p>
        <Link to={"/auth/signup"}>
          <p className="text-blue-700 hover:underline">Register here!</p>
        </Link>
      </div>
    </div>
  );
}

export default Login;
