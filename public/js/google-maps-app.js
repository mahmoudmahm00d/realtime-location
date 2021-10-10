const joinBtn = document.querySelector("#join-btn");
let map;
let position = { lat: 33.51, lng: 36.27 };

// Get username and room from URL
const username = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io({ autoConnect: false });

joinBtn.addEventListener("click", joinOrLeave);

function joinOrLeave() {
  if (!socket.connected) {
    socket.connect();
    const user = username.username;
    socket.emit("join", { username: user, position });
    joinBtn.value = "Set Offline";
  } else {
    socket.disconnect();
    joinBtn.value = "Set Online";
  }
}

socket.on("time", (time) => console.log(time));

function initializeMap(pos) {
  // if (pos) {
  //   let latLng = pos.split(",");
  //   location = { lat: parseFloat(latLng[0]), lng: parseFloat(latLng[1]) };
  // }

  let marker;

  map = new google.maps.Map(document.getElementById("map"), {
    center: position,
    zoom: 12,
  });

  marker = new google.maps.Marker({
    map,
    draggable: true,
    animation: google.maps.Animation.DROP,
    position: position,
  });

  // const infowindow = new google.maps.InfoWindow({
  //   content: "Please Select Location",
  // });

  // if (!pos) {
  //   infowindow.open({
  //     anchor: marker,
  //     map,
  //   });
  // }

  // Create Pan to My Location Button
  const locationButton = document.createElement("button");
  locationButton.textContent = "Pan to My Location";
  locationButton.classList.add("btn");
  // Assign button to the map
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);

  locationButton.addEventListener("click", () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          position = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          marker.setPosition(position);
          map.setCenter(position);
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
  });

  //Pop up info window on marker click
  marker.addListener("click", () => {
    infowindow.open({
      anchor: marker,
      map,
    });
  });

  //Assign selected location after drag end
  marker.addListener("dragend", (pos) => {
    position = pos.latLng;

    document.querySelector(
      "#GeoLocation"
    ).value = `${position.lat()},${position.lng()}`;
    if (socket.connected) socket.emit("locationUpdate", { position });
  });
}
