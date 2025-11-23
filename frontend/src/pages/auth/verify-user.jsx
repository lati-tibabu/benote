import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function VerifyUser() {
  const apiURL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userId, setUserId] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  useEffect(() => {
    // Support both ?user=...&token=... and ?user?id=...&token=...
    let userParam = searchParams.get("user");
    let tokenParam = searchParams.get("token");
    // Handle ?user?id=...&token=...
    if (!userParam) {
      const allParams = Array.from(searchParams.entries());
      const userIdParam = allParams.find(([key]) => key.startsWith("user?id"));
      if (userIdParam) {
        userParam = userIdParam[1];
      }
    }
    setUserId(userParam || "");
    setToken(tokenParam || "");
    // If both present, auto-submit
    if (userParam && tokenParam && !autoSubmitted) {
      setAutoSubmitted(true);
      handleVerify(userParam, tokenParam);
    }
    // eslint-disable-next-line
  }, [searchParams]);

  const handleVerify = async (uid, tkn) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${apiURL}/api/users/verify/${uid}/${tkn}`);
      const data = await response.json();
      if (response.ok) {
        setSuccess("Your email has been verified! You can now log in.");
        setTimeout(() => navigate("/auth/login"), 2000);
      } else {
        setError(data.message || "Verification failed.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleVerify(userId, token);
  };

  const showForm = !(userId && token && autoSubmitted);

  const handleSendVerificationCode = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(
        `${apiURL}/api/users/regenerate/verification-token?id=${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          //   body: JSON.stringify({ to: userId, resendVerification: true }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setSuccess("Verification code sent to your email.");
      } else {
        setError(data.message || "Failed to send verification code.");
      }
    } catch (err) {
      setError("An error occurred while resending code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
      {showForm ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Only show token input, userId is hidden */}
          <input type="hidden" value={userId} />
          <input
            type="text"
            placeholder="Verification Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <button
            type="submit"
            className="bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>
      ) : null}
      <button
        className="mt-4 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
        disabled={!userId || loading}
        onClick={handleSendVerificationCode}
      >
        Resend Verification Code
      </button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-gray-600 mt-4">{success}</p>}
      {loading && !showForm && (
        <p className="text-gray-500 mt-4">Verifying...</p>
      )}
    </div>
  );
}

export default VerifyUser;
