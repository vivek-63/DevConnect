const users = require("./onlineUser");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("register", (userId) => {
      if (!userId) {
        console.log("Invalid userId");
        return;
      }

      users[Number(userId)] = socket.id;
      users[String(userId)] = socket.id;

      socket.userId = Number(userId);

      console.log(`User ${userId} registered`);

      console.log("Online users:", users);

      // Notify other users
      io.emit("userOnline", Number(userId));

      // Send current online users
      socket.emit(
        "onlineUsers",
        Object.keys(users).map(Number)
      );
    });

    socket.on("getOnlineUsers", () => {
      socket.emit(
        "onlineUsers",
        Object.keys(users).map(Number)
      );
    });

    socket.on("disconnect", () => {
      const userId = socket.userId;

      if (!userId) return;

      delete users[Number(userId)];
      delete users[String(userId)];

      console.log(`User ${userId} disconnected`);

      io.emit(
        "userOffline",
        Number(userId)
      );

    });
  });
};