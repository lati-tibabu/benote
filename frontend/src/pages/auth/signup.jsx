import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { IoMdClose } from "react-icons/io";

function Signup() {
  const apiURL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const dialogRef = useRef(null);

  const openModal = () => {
    dialogRef.current?.showModal();
  };

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

  // Check if passwords match
  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
    } else {
      setSignUpLoading(true);
      try {
        const newData = {
          name: formData.firstName + " " + formData.lastName,
          email: formData.email,
          password: formData.password,
          role: "user",
        };

        const response = await fetch(`${apiURL}/api/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("User signed up successfully:", result);
          openModal();
        } else {
          const error = await response.json();
          alert(`Signup failed: ${error.message || "Something went wrong"}`);
        }
      } catch (error) {
        console.error("Error during signup:", error);
        alert("Something went wrong, please try again.");
      }
    }
  };

  useEffect(() => {
    if (formData.email.trim() === "") {
      return;
    }

    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (regex.test(formData.email)) {
      setIsEmailValid(true);
    } else {
      setIsEmailValid(false);
    }
  }, [formData.email]);

  useEffect(() => {
    if (formData.password === "") {
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex flex-row w-fit">
      <div className="p-5 px-8 min-w-80 max-w-96 transition-all duration-150">
        <div>
          <div>
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-xs">Enter your details to sign up</p>
          </div>
          <div className="mt-10">
            <form onSubmit={handleSignup} className="flex flex-col gap-2">
              <div className="flex flex-col">
                <label htmlFor="firstName-input" className="text-sm">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName-input"
                  name="firstName"
                  value={formData.firstName}
                  className="bg-white border rounded border-gray-400 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="First Name"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="lastName-input" className="text-sm">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName-input"
                  name="lastName"
                  value={formData.lastName}
                  className="bg-white border rounded border-gray-400 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Last Name"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="email-input" className="text-sm">
                  Email
                </label>
                <input
                  type="email"
                  id="email-input"
                  name="email"
                  value={formData.email}
                  className="bg-white border rounded border-gray-400 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email"
                  onChange={handleChange}
                  required
                />
                {!isEmailValid && (
                  <span className="text-sm text-red-500">
                    Email is incorrect
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <label htmlFor="password-input" className="text-sm">
                  Password
                </label>
                <input
                  type="password"
                  id="password-input"
                  name="password"
                  value={formData.password}
                  className="bg-white border rounded border-gray-400 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Password"
                  onChange={handleChange}
                  required
                />
                {!isPasswordValid && (
                  <span className="text-sm text-red-500 text-wrap">
                    {passwordErrorMessage}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <label htmlFor="confirmPassword-input" className="text-sm">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword-input"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  className="bg-white border rounded border-gray-400 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm Password"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col gap-2 text-center">
                {signUpLoading ? (
                  <span className="loading"></span>
                ) : (
                  <button
                    type="submit"
                    className="btn bg-gray-700 text-white"
                    disabled={!isPasswordValid}
                  >
                    Sign Up
                  </button>
                )}
                <hr />
                <p className="text-sm">or sign up with</p>
                <div className="flex flex-row justify-center items-center gap-5 border-black p-2 bg-white cursor-pointer rounded-md shadow-lg select-none">
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
          <p>Already have an account? </p>
          <Link to={"/auth/login"}>
            <p className="text-blue-700 hover:underline">Login here!</p>
          </Link>
        </div>
      </div>

      <img
        src="/black-white-portrait-digital-nomads.jpg"
        alt=""
        className="hidden sm:block w-96 object-cover"
      />
      <div className="relative">
        <dialog ref={dialogRef} className="modal text-white">
          <div className="modal-box bg-gray-800 text-white rounded-lg p-5 relative">
            <div className="flex flex-col items-center">
              <AiOutlineCheckCircle size={48} className="text-white mb-4" />
              <h3 className="font-bold text-lg">
                Account Successfully Created!
              </h3>
              <p className="py-4 text-center text-gray-300">
                Your account has been created. You can now log in to start using
                the app.
              </p>
              <Link
                to="/auth/login"
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Login Here
              </Link>
            </div>
          </div>

          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </div>
  );
}

export default Signup;
