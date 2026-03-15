from flask import Flask, render_template
from flask_socketio import SocketIO, join_room, leave_room, send, emit

app = Flask(__name__, template_folder="template")
socketio = SocketIO(app)

rooms = {}
sid_info = {}


@app.route("/")
def home():
    return render_template("index.html")


@socketio.on("join")
def on_join(data):
    from flask import request
    room = data["room"]
    username = data.get("username", "Anonymous")
    join_room(room)
    if room not in rooms:
        rooms[room] = []
    rooms[room].append(username)
    sid_info[request.sid] = {"room": room, "username": username}
    emit("system", {"msg": f"{username} joined the room.", "users": rooms[room]}, to=room)


@socketio.on("message")
def handle_message(data):
    room = data["room"]
    msg = data["msg"]
    username = data.get("username", "Anonymous")
    send({"msg": msg, "username": username}, to=room)


@socketio.on("leave")
def on_leave(data):
    from flask import request
    room = data["room"]
    username = data.get("username", "Anonymous")
    leave_room(room)
    if room in rooms and username in rooms[room]:
        rooms[room].remove(username)
    sid_info.pop(request.sid, None)
    emit("system", {"msg": f"{username} left the room.", "users": rooms.get(room, [])}, to=room)


@socketio.on("disconnect")
def on_disconnect():
    from flask import request
    info = sid_info.pop(request.sid, None)
    if not info:
        return
    room = info["room"]
    username = info["username"]
    leave_room(room)
    if room in rooms and username in rooms[room]:
        rooms[room].remove(username)
    emit("system", {"msg": f"{username} left the room.", "users": rooms.get(room, [])}, to=room)


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, use_reloader=False, log_output=True, allow_unsafe_werkzeug=True)
