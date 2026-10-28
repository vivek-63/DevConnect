require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const initializeSocket = require("./src/socket/socket");
const { setIO } = require("./src/socket/socketInstance");
const prisma = require("./src/config/database");
const app = require("./app");

const PORT = Number(process.env.PORT) || 8080;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const DB_CONNECT_TIMEOUT_MS = 10000;

function describeDatabaseTarget(databaseUrl) {
  if (!databaseUrl) return "not set";
  try {
    const parsed = new URL(databaseUrl);
    return `${parsed.hostname}:${parsed.port || 5432}${parsed.pathname}`;
  } catch {
    return "invalid DATABASE_URL";
  }
}

function connectWithTimeout() {
  return Promise.race([
    prisma.$connect(),
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(
          new Error(
            `Timed out connecting to PostgreSQL after ${DB_CONNECT_TIMEOUT_MS}ms. Is the database running and is DATABASE_URL correct?`
          )
        );
      }, DB_CONNECT_TIMEOUT_MS);
    }),
  ]);
}

async function start() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing. Add it to server/.env");
    process.exit(1);
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is missing. Add it to server/.env");
    process.exit(1);
  }

  console.log("Connecting to database:", describeDatabaseTarget(process.env.DATABASE_URL));

  try {
    await connectWithTimeout();
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connection verified");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: CLIENT_ORIGIN,
      credentials: true,
    },
  });

  setIO(io);
  initializeSocket(io);

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Stop the other process or set PORT in .env`);
      process.exit(1);
    }
    console.error("HTTP server error:", error.message);
    process.exit(1);
  });

  server.listen(PORT, () => {
    console.log(`DevConnect API listening on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

start();
