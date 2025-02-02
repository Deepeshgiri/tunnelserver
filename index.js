import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;
let clientSocket = null;

// WebSocket connection for the local client
io.on("connection", (socket) => {
  console.log("Client connected");
  clientSocket = socket;

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clientSocket = null;
  });
});

// Test endpoint to check if Vercel API is working
app.get("/test", (req, res) => {
  res.json({ status: "Vercel server is running!" });
});

// Proxy request handler
app.use("/proxy/:service", async (req, res) => {
  if (!clientSocket) {
    return res.status(500).json({ error: "Tunnel not connected" });
  }

  const service = req.params.service;
  clientSocket.emit("request", { service });

  clientSocket.once("response", (data) => {
    res.send(data);
  });
});

// Start server
server.listen(port, () => console.log("Server running on port 3000"));
