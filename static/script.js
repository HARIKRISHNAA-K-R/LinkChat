const socket = io();

let roomID = "";
let username = "";

function joinRoom() {
  const nameVal = document.getElementById("usernameInput").value.trim();
  const roomVal = document.getElementById("roomInput").value.trim();
  const err = document.getElementById("joinError");

  if (!nameVal) { err.textContent = "Please enter your name."; return; }
  if (!roomVal) { err.textContent = "Please enter a room ID."; return; }
  err.textContent = "";

  username = nameVal;
  roomID = roomVal;

  socket.emit("join", { room: roomID, username });

  document.getElementById("joinScreen").classList.add("hidden");
  document.getElementById("chatScreen").classList.remove("hidden");
  document.getElementById("roomLabel").textContent = "Room: " + roomID;
  document.getElementById("msgInput").focus();
}

function leaveRoom() {
  socket.emit("leave", { room: roomID, username });
  roomID = "";
  username = "";
  document.getElementById("chatBox").innerHTML = "";
  document.getElementById("chatScreen").classList.add("hidden");
  document.getElementById("joinScreen").classList.remove("hidden");
  document.getElementById("usernameInput").value = "";
  document.getElementById("roomInput").value = "";
}

function sendMsg() {
  const input = document.getElementById("msgInput");
  const msg = input.value.trim();
  if (!msg || !roomID) return;
  socket.emit("message", { room: roomID, msg, username });
  input.value = "";
  input.focus();
}

function formatTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function appendMessage(msg, sender, isOwn) {
  const box = document.getElementById("chatBox");
  const row = document.createElement("div");
  row.className = "msg-row" + (isOwn ? " own" : "");

  if (!isOwn) {
    const senderEl = document.createElement("div");
    senderEl.className = "msg-sender";
    senderEl.textContent = sender;
    row.appendChild(senderEl);
  }

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";
  bubble.textContent = msg;
  row.appendChild(bubble);

  const time = document.createElement("div");
  time.className = "msg-time";
  time.textContent = formatTime();
  row.appendChild(time);

  box.appendChild(row);
  box.scrollTop = box.scrollHeight;
}

function appendSystem(text) {
  const box = document.getElementById("chatBox");
  const el = document.createElement("div");
  el.className = "system-msg";
  el.textContent = text;
  box.appendChild(el);
  box.scrollTop = box.scrollHeight;
}

socket.on("message", function (data) {
  const isOwn = data.username === username;
  appendMessage(data.msg, data.username, isOwn);
});

socket.on("system", function (data) {
  appendSystem(data.msg);
  const count = data.users ? data.users.length : 0;
  document.getElementById("onlineCount").textContent = count + " online";
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    if (!document.getElementById("chatScreen").classList.contains("hidden")) {
      sendMsg();
    } else {
      joinRoom();
    }
  }
});
