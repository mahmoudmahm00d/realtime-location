const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
//Dev utlitis
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getUser,
} = require("./utils/users");
const formatMessage = require("./utils/messages");

//Constatnts
const botName = "Management";
const adminRoom = "Administration";
const onlineRoom = "Online";

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  socket.on("join", ({ username, position }) => {
    //Check if user already exists
    const userInList = getUser(username, onlineRoom);

    //Notify if user exists
    if (userInList) {
      socket.emit("alreadyExists", { username, room: onlineRoom, position });
      return;
    }

    //Add user to online room
    const user = userJoin(socket.id, username, onlineRoom, position);
    socket.join(onlineRoom);

    socket
      .to(adminRoom)
      .emit(
        "message",
        formatMessage(botName, `${user.username} is online now`)
      );

    // Send users and room info
    io.to(adminRoom).emit("activeUsers", {
      room: onlineRoom,
      users: getRoomUsers(onlineRoom),
    });
  });

  socket.on('Managemnet', (message)=>{
    socket.join(adminRoom);
    // Send users and room info
    io.to(adminRoom).emit("activeUsers", {
      room: onlineRoom,
      users: getRoomUsers(onlineRoom),
    });
  });

  socket.on("locationUpdate", (pos) => {
    //Spicefy who is the user
    const user = getCurrentUser(socket.id, pos);
    const username = user.username;
    //Write message to his room
    io.to(adminRoom).emit("userUpdateLocation", { username, pos });
  });

  socket.on("disconnect", () => {
    //Delete user from users list
    const user = userLeave(socket.id);
    //if there is such a user with that socket id
    if (user) {
      io.to(adminRoom).emit(
        "message",
        formatMessage(botName, `${user.username} is offline  the .`)
      );

      //Update rooms' users
      io.to(adminRoom).emit("activeUsers", {
        room: onlineRoom,
        users: getRoomUsers(onlineRoom),
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`server started on port ${PORT}`));
