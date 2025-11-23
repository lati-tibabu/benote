import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const SendInvitation = (props) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");

  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // var userData;
  // try {
  //   userData = jwtDecode(token);
  // } catch (error) {
  //   console.error(error);
  // }

  const userData = useSelector((state) => state.auth.user) || {};

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const searchUserByEmail = async (email) => {
    try {
      const response = await fetch(`${apiURL}/api/users/email`, {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: header,
      });
      const data = await response.json();
      // console.log("from invitation", data);

      if (response.ok) {
        return data; // User found
      } else {
        throw new Error(data.message || "User not found");
      }
    } catch (error) {
      console.error("Error searching user:", error);
      return null;
    }
  };

  const sendInvitation = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Search for the user by email
    const user = await searchUserByEmail(email);

    if (user) {
      try {
        // Create the team membership data
        const membershipData = {
          user_id: user.id,
        };

        // Send the invitation
        const response = await fetch(
          `${apiURL}/api/teams/${props.teamId}/members`,
          {
            method: "POST",
            body: JSON.stringify(membershipData),
            headers: header,
          }
        );

        const data = await response.json();
        // console.log(data);

        if (response.ok) {
          // Create the notification data
          const notificationData = {
            message: `You have been invited to join a team named ${props.teamName}! ${message}`,
            type: "invitation",
            action: {
              team_id: props.teamId,
              route: `/app/team/open/${props.teamId}`,
            },
            receiver_id: user.id,
            sender_id: userData?.id,
          };

          // Send the notification
          const response = await fetch(`${apiURL}/api/notifications`, {
            method: "POST",
            body: JSON.stringify(notificationData),
            headers: header,
          });

          const data = await response.json();

          if (response.ok) {
            alert("Invitation sent successfully!");
          } else {
            console.error("Failed to send invitation:", data);
          }
        }
      } catch (err) {
        console.error("Error sending invitation:", err);
      }
    } else {
      alert("User not found with this email.");
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full flex">
      <div className="bg-transparent p-4 rounded-sm shadow-sm lg:w-1/2 w-full mt-10 grow">
        <div className="flex items-center gap-2 font-bold text-lg">
          <p className="text-2xl">📩</p>
          <h1>Send Team Invitation</h1>
        </div>
        <hr className="h-1/2 bg-gray-500" />
        <p>Enter the email of the user you want to invite to your team.</p>

        <form className="flex flex-col gap-2 mt-3" onSubmit={sendInvitation}>
          <fieldset className="fieldset flex flex-col gap-1">
            <label htmlFor="email">Receiver Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter the email"
              className="p-2 border border-gray-300 rounded-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-950"
              required
            />
          </fieldset>

          <fieldset className="fieldset flex flex-col gap-1">
            <label htmlFor="message">Invitation Message</label>
            <textarea
              id="message"
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="p-2 border border-gray-300 rounded-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-950"
              placeholder="e.g. You are invited to join the software development team"
            ></textarea>
          </fieldset>

          <button
            type="submit"
            className="btn btn-primary bg-black hover:bg-gray-800 text-white border-none"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Invitation"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendInvitation;
