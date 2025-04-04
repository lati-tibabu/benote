import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const useSocket = (serverURL) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketIo = io(serverURL);
    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [serverURL]);

  return socket;
};

export default useSocket;
