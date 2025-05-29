const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let holdCount = 0;
let timer = 0;
let interval = null;

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("button-down", () => {
    holdCount++;
    console.log(`button-down: holdCount=${holdCount}`);
    if (holdCount === 1) {
      interval = setInterval(() => {
        timer++;
        io.emit("timer-update", timer);
      }, 1000);
    }
  });

  socket.on("button-up", () => {
    holdCount = Math.max(0, holdCount - 1);
    console.log(`button-up: holdCount=${holdCount}`);
    if (holdCount === 0 && interval) {
      clearInterval(interval);
      interval = null;
      timer = 0;
      io.emit("timer-update", timer);
    }
  });

  socket.on("disconnect", () => {
    holdCount = Math.max(0, holdCount - 1);
    console.log(`disconnect: holdCount=${holdCount}`);
    if (holdCount === 0 && interval) {
      clearInterval(interval);
      interval = null;
      timer = 0;
      io.emit("timer-update", timer);
    }
  });
});

server.listen(3000, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
