import { useEffect } from "react";
import { io } from "socket.io-client";

function AdminNotifications() {
  const socket = io("http://192.168.1.5:2525", { transports: ["websocket"] });

  useEffect(() => {
  socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);
  socket.emit("joinAdmin");
});
socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
    });

socket.on("new_notification", (data) => {
  console.log("📩 Got notification:", data);
   return () => {
      socket.disconnect();
      console.log("🔌 Socket disconnected on unmount");
    };
});
  }, [socket]);

}
