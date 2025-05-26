import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { IoMdClose } from "react-icons/io";

function Signup() {
  const apiURL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const dialogRef = useRef(null);

  const [signUpLoading, setSignUpLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const openModal = () => dialogRef.current?.showModal();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setSignUpLoading(true);
    try {
      const newData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        role: "user",
      };

      const response = await fetch(`${apiURL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });

      if (response.ok) {
        await response.json();
        openModal();
      } else {
        const error = await response.json();
        alert(`Signup failed: ${error.message || "Something went wrong"}`);
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("Something went wrong, please try again.");
    } finally {
      setSignUpLoading(false);
    }
  };

  useEffect(() => {
    if (!formData.email.trim()) return;
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    setIsEmailValid(regex.test(formData.email));
  }, [formData.email]);

  useEffect(() => {
    if (!formData.password) {
      setIsPasswordValid(true);
      setPasswordErrorMessage("");
      return;
    }

    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!$%@#^&])[A-Za-z\d!$%@#^&]{8,}$/;
    if (regex.test(formData.password)) {
      setIsPasswordValid(true);
      setPasswordErrorMessage("");
    } else {
      setIsPasswordValid(false);
      setPasswordErrorMessage(
        "Password must be at least 8 characters long, include at least one number and one special character."
      );
    }
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-row w-fit">
      <div className="m-5 min-w-80 max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Create your account
        </h1>
        <p className="text-sm text-gray-600">Enter your details to sign up</p>

        <form onSubmit={handleSignup} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col">
            <label
              htmlFor="firstName-input"
              className="text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              className="bg-gray-50 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your first name"
              onChange={handleChange}
              required
              disabled={signUpLoading}
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="lastName-input"
              className="text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              className="bg-gray-50 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your last name"
              onChange={handleChange}
              required
              disabled={signUpLoading}
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="email-input"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              className="bg-gray-50 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              onChange={handleChange}
              required
              disabled={signUpLoading}
            />
            {!isEmailValid && (
              <span className="text-sm text-red-500">Email is incorrect</span>
            )}
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
              name="password"
              value={formData.password}
              className="bg-gray-50 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              onChange={handleChange}
              required
              disabled={signUpLoading}
            />
            {!isPasswordValid && (
              <span className="text-sm text-red-500">
                {passwordErrorMessage}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="confirmPassword-input"
              className="text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              className="bg-gray-50 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm your password"
              onChange={handleChange}
              required
              disabled={signUpLoading}
            />
          </div>

          <div className="flex flex-col gap-4">
            {signUpLoading ? (
              <div className="flex justify-center">
                <span className="loader"></span>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-300"
                disabled={!isPasswordValid}
              >
                Sign Up
              </button>
            )}
          </div>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="px-4 text-sm text-gray-500">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/*
          <div className="flex items-center justify-center gap-3 bg-gray-50 border border-gray-300 rounded-lg p-3 cursor-pointer hover:shadow-md transition duration-300">
            <img src="/google-color-icon.svg" alt="Google Icon" className="w-6 h-6" />
            <span className="text-sm font-medium text-gray-700">Continue with Google</span>
          </div>
          */}
        </form>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            Already have an account?{" "}
            <Link to="/auth/login" className="text-blue-600 hover:underline">
              Login here!
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden sm:flex items-center justify-center h-full p-8">
        <img
          src="/black-white-portrait-digital-nomads.jpg"
          alt="Signup Visual"
          className="w-96 h-[32rem] object-cover rounded-2xl shadow-2xl border border-gray-200"
          style={{ maxHeight: "90vh" }}
        />
      </div>

      <div className="relative">
        <dialog ref={dialogRef} className="modal text-white">
          <div className="modal-box bg-gradient-to-br from-blue-700 via-blue-800 to-gray-900 text-white rounded-2xl p-8 shadow-2xl relative max-w-md mx-auto animate-fade-in">
            <button
              onClick={() => dialogRef.current?.close()}
              className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors text-2xl focus:outline-none"
              aria-label="Close"
            >
              <IoMdClose />
            </button>
            <div className="flex flex-col items-center gap-2">
              <span className="bg-green-600 rounded-full p-3 mb-2 shadow-lg">
                <AiOutlineCheckCircle size={48} className="text-white" />
              </span>
              <h3 className="font-extrabold text-2xl mb-2 tracking-tight text-center">
                Account Successfully Created!
              </h3>
              <p className="py-2 text-center text-gray-200 text-base">
                Your account has been created.
                <br />
                <span className="text-blue-200">
                  A verification link and code has been sent to your email.
                </span>
              </p>
              <div className="bg-gray-800/60 rounded-lg p-4 text-sm text-gray-300 mb-2 w-full">
                <span className="font-semibold text-white">Next Steps:</span>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Check your inbox and verify your account.</li>
                  <li>If you can't find the email, check your spam folder.</li>
                  <li>
                    After verification, you can log in and start using the app.
                  </li>
                </ul>
              </div>
              <Link
                to="/auth/login"
                className="mt-4 w-full text-center bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-200"
              >
                Login Here
              </Link>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button tabIndex={-1} aria-label="Close Modal">
              close
            </button>
          </form>
        </dialog>
      </div>
    </div>
  );
}

export default Signup;
