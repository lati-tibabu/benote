import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { IoMdClose } from "react-icons/io";

function Signup() {
  const apiURL = import.meta.env.VITE_API_URL;
  const dialogRef = useRef(null);

  const [signUpLoading, setSignUpLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [signupError, setSignupError] = useState("");

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
    setSignupError("");

    if (formData.password !== formData.confirmPassword) {
      setSignupError("Passwords do not match.");
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
        setSignupError(error.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setSignupError("Something went wrong. Please try again.");
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

    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!$%@#^&])[A-Za-z\d!$%@#^&]{8,}$/;
    if (regex.test(formData.password)) {
      setIsPasswordValid(true);
      setPasswordErrorMessage("");
    } else {
      setIsPasswordValid(false);
      setPasswordErrorMessage(
        "Use at least 8 characters with one number and one special character."
      );
    }
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Start your Benote workspace in under a minute.
        </p>

        <form onSubmit={handleSignup} className="mt-7 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">First name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                placeholder="First name"
                onChange={handleChange}
                required
                disabled={signUpLoading}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Last name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                placeholder="Last name"
                onChange={handleChange}
                required
                disabled={signUpLoading}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              placeholder="you@example.com"
              onChange={handleChange}
              required
              disabled={signUpLoading}
            />
            {!isEmailValid && (
              <span className="mt-1 block text-sm text-red-600">Please enter a valid email.</span>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              placeholder="********"
              onChange={handleChange}
              required
              disabled={signUpLoading}
            />
            {!isPasswordValid && (
              <span className="mt-1 block text-sm text-red-600">{passwordErrorMessage}</span>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Confirm password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              placeholder="********"
              onChange={handleChange}
              required
              disabled={signUpLoading}
            />
          </div>

          {signupError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {signupError}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={signUpLoading || !isPasswordValid}
          >
            {signUpLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/auth/login" className="font-medium text-cyan-700 hover:underline">
            Log in
          </Link>
        </p>
      </div>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box rounded-2xl border border-slate-200 bg-white p-7 text-slate-900 shadow-xl">
          <button
            onClick={() => dialogRef.current?.close()}
            className="absolute right-4 top-4 text-slate-500 transition hover:text-slate-800"
            aria-label="Close"
          >
            <IoMdClose size={22} />
          </button>
          <div className="flex flex-col items-center text-center">
            <span className="rounded-full bg-emerald-100 p-3 text-emerald-700">
              <AiOutlineCheckCircle size={36} />
            </span>
            <h3 className="mt-4 text-2xl font-semibold">Account created</h3>
            <p className="mt-2 text-sm text-slate-600">
              We sent a verification link and code to your email address.
            </p>
            <div className="mt-4 w-full rounded-xl bg-slate-50 p-4 text-left text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Next steps</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Open your inbox and verify your account.</li>
                <li>Check spam if you do not see the message.</li>
                <li>After verification, sign in to continue.</li>
              </ul>
            </div>
            <Link
              to="/auth/login"
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to login
            </Link>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button tabIndex={-1} aria-label="Close modal">
            close
          </button>
        </form>
      </dialog>
    </>
  );
}

export default Signup;
