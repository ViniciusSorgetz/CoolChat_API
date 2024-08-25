const express = require("express");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const userRoutes = require("./routes/userRoutes");
const roomRoutes = require("./routes/roomRoutes");

dotenv.config();
const port = process.env.PORT;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
      }
});

const { sendMessage, joinRoom, leaveRoom } = require("./socket")(io);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoutes);
app.use("/room", roomRoutes);

app.use("/sobre", (req, res) => {
    res.json({
        título: "CoolChat",
        descrição: "Chat insano para conversas insanas",
        autor: "Vinícius Sorgetz Alves"
    });
});

const onConnection = (socket) => {
    console.log(socket.id);
    socket.on("send-message", sendMessage);
    socket.on("join-room", joinRoom);
    socket.on("leave-room", leaveRoom);
}

io.on("connection", onConnection);

server.listen(port, () => {
    console.log("Rodando na porta " + port);
});