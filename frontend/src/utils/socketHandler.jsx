import React, { useEffect } from "react";
import useSocket from "../hooks/useSocket";
import { useSelector } from "react-redux";

const SocketHandler = () => {
  const apiURL = import.meta.env.VITE_API_URL || "http://localhost:3060";
  const userData = useSelector((state) => state.auth.user) || {};

  const socket = useSocket(apiURL);

  useEffect(() => {
    if (!socket) {
      console.warn(
        "Socket not initialized yet, backend may not support socket connections."
      );
      return;
    }

    try {
      socket.emit("register", userData?.id);

      socket.on("disconnect", () => {
        console.log("Disconnected from server");
      });

      socket.on("connect_error", () => {
        console.error("Socket connection error:", err.message);
      });

      socket.on("error", (err) => {
        console.error("Socket error:", err.message);
      });

      return () => {
        socket.off("disconnect");
        socket.off("connect_error");
        socket.off("error");
      };
    } catch (error) {}
  }, [socket, userData?.id]);
  return null;
};

export default SocketHandler;
