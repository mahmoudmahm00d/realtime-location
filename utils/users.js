const users = [];

// Join user to chat
function userJoin(id, username, room, position) {
  if (users.find((user) => user.username === username)) return null;

  const user = { id, username, room, position };

  users.push(user);

  return user;
}

// Get current user
function getUser(username, room) {
  return users.find((user) => user.username === username && user.room === room);
}

// Get current user
function getCurrentUser(id, position = undefined) {
  let index = users.findIndex((user) => user.id === id);
  if (position != undefined) users[index].position = position.position;
  return users[index];
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  getUser,
};
