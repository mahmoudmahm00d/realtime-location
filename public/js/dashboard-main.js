let markers = new Map();
let map;
let position = { lat: 33.51, lng: 36.27 };

const userList = document.getElementById("users");
const joinBtn = document.querySelector("#join-btn");

const socket = io();
socket.emit("Managemnet", "join");

socket.on("activeUsers", ({ room, users }) => {
  deleteMarkers();
  if (users) {
    setUsersLocations(users);
    outputUsers(users);
  }
});

socket.on("userUpdateLocation", ({ username, pos }) => {
  updateUserLocation(username, pos);
});

function updateUserLocation(username, pos) {
  if (markers.has(username)) {
    let marker = markers.get(username);
    let latlng = new google.maps.LatLng(pos.position.lat, pos.position.lng);
    marker.position = latlng;
    marker.setMap(undefined);
    marker.setMap(map);
    markers.set(username, marker);
  }
}

// Add users to DOM
function setUsersLocations(users) {
  users.forEach((user) => {
    let username = user.username;
    let position = user.position;
    addMarker(username, position);
  });
}

function outputUsers(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    console.log(user);
    // users.push(user);
    const li = document.createElement("li");
    li.className = "list-group-item bg-dark";
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

function initializeMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: position,
    zoom: 10,
  });
}

// Adds a marker to the map and push to the array.
function addMarker(username, position) {
  const marker = new google.maps.Marker({
    position,
    map,
  });
  
  const infowindow = new google.maps.InfoWindow();

  google.maps.event.addListener(marker, "click", function () {
    infowindow.setContent(username);
    infowindow.open(map, marker);
  });

  markers.set(username, marker);
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  markers.forEach(function (value, key) {
    markers.get(key).setMap(map);
  });
}

// Removes the markers from the map, but keeps them in the array.
function hideMarkers() {
  setMapOnAll(null, null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  hideMarkers();
  markers = new Map();
}
