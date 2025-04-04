import React, { useEffect } from "react";
import useSocket from "../hooks/useSocket";
import { useSelector } from "react-redux";

const SocketHandler = () => {
  const apiURL = import.meta.env.VITE_API_URL || "http://localhost:3060";
  const userData = useSelector((state) => state.auth.user) || {};

  const socket = useSocket(apiURL);
  // console.log(apiURL);

  useEffect(() => {
    if (!socket) return;

    socket.emit("register", userData?.id);

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socket.off("disconnect");
    };
  }, [socket]);
  return null;
};

export default SocketHandler;
