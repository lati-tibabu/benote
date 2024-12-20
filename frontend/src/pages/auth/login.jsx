import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const apiURL = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

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
        // console.log(`Login Succesful, ${result.token}`);
        // console.log("Token is ", localStorage.getItem("jwt"));
        navigate("/app/home");
      } else {
        const result = await response.json();
        console.log(`Login Unsuccesful, ${result.message}`);
      }
    } catch (error) {
      console.log(`Error occured while logging in ${error}`);
    }
  };

  return (
    <div className="m-5">
      <div>
        <div>
          <h1 className="text-2xl font-bold">Welcome back!</h1>
          <p className="text-xs">Enter to login to your account</p>
        </div>
        {/* form */}
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
              <div className="flex flex-row gap-1 items-center">
                <input type="checkbox" id="remember-me" className="bg-white" />
                <label htmlFor="remember-me">Remember me</label>
              </div>
              <div className="text-sm text-blue-700 cursor-pointer hover:underline">
                Forgot your password?
              </div>
            </div>

            {/* login buttons */}
            <div className="flex flex-col gap-2 text-center">
              <button className="btn">login</button>
              <hr />
              <p className="text-sm">or login with</p>
              <div className="flex flex-row justify-center items-center gap-5 border-black border-1 p-2 bg-white cursor-pointer rounded-md shadow-md">
                <img
                  src="/google-color-icon.svg"
                  alt="google-icon"
                  className="w-6 h-6"
                />
                <p>Continue with Google</p>
              </div>
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
