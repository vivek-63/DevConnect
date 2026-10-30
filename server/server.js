require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const initializeSocket = require("./src/socket/socket");
const { setIO } = require("./src/socket/socketInstance");
const prisma = require("./src/config/database");
const app = require("./app");

const PORT = process.env.PORT || 8080;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

async function startServer() {
  // Check that the required environment variables are present
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL is missing. Add it to server/.env");
    process.exit(1);
  }

  if (!process.env.JWT_SECRET) {
    console.log("JWT_SECRET is missing. Add it to server/.env");
    process.exit(1);
  }

  // Connect to the database
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connected");
  } catch (error) {
    console.log("Database connection failed:", error.message);
    await prisma.$disconnect();
    process.exit(1);
  }

  // Create the HTTP server and attach socket.io to it
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: CLIENT_ORIGIN,
      credentials: true,
    },
  });

  setIO(io);
  initializeSocket(io);

  // Handle server errors (like the port already being used)
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.log(`Port ${PORT} is already in use. Stop the other process or change PORT in .env`);
    } else {
      console.log("Server error:", error.message);
    }
    process.exit(1);
  });

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer()