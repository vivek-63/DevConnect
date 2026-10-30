
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const prisma = require("./src/config/database");

const userRoutes = require("./src/routes/user");
const projectRoutes = require("./src/routes/projects");
const postRoutes = require("./src/routes/posts");
const commentRoutes = require("./src/routes/comment");
const conversationRoutes = require("./src/routes/conversation");
const messageRoutes = require("./src/routes/message");
const followRoutes = require("./src/routes/follow");
const searchRoutes = require("./src/routes/search");
const notificationRoutes = require("./src/routes/notifications");
const aiRoutes = require("./src/routes/ai");

const { generalLimiter } = require("./src/middleware/RateLimit");
const errorHandler = require("./src/middleware/errorHandler");

const app = express();

const CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN || "http://localhost:5173";

// Allow Express to work correctly behind a trusted proxy.
app.set("trust proxy", 1);

// Add security headers.
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Allow requests from the frontend.
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);

// Read cookies and request data.
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "1mb" }));

// Limit excessive requests.
app.use(generalLimiter);

// Check whether the API is running.
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    app: "DevConnect API",
  });
});

// Check whether the database is reachable.
app.get("/health/db", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      database: "unreachable",
    });
  }
});

// Register application routes.
app.use("/", userRoutes);
app.use("/user", userRoutes);

app.use("/", projectRoutes);
app.use("/", postRoutes);
app.use("/", commentRoutes);
app.use("/", conversationRoutes);
app.use("/", messageRoutes);
app.use("/", followRoutes);
app.use("/", searchRoutes);
app.use("/", notificationRoutes);

app.use("/ai", aiRoutes);

// Handle errors from routes and middleware.
app.use(errorHandler);

module.exports = app;
