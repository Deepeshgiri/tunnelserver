import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

let clientSocket = null;

io.on("connection", (socket) => {
  console.log("Client connected");
  clientSocket = socket;
});

app.use("/proxy/:service", async (req, res) => {
  if (!clientSocket) {
    return res.status(500).send("Tunnel not connected");
  }

  const service = req.params.service;
  clientSocket.emit("request", { service });

  clientSocket.once("response", (data) => {
    res.send(data);
  });
});

server.listen(3000, () => console.log("Server running on port 3000"));
