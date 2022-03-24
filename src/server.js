import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

//console.log("hello");


const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

function publicRooms() {
    
    const {
        socket: {
            adapter: {sids, rooms}
        },
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_,key)=>{
        if(sids.get(key) === undefined){
            publicRooms.push(key);
        }
    });
}

wsServer.on("connection", (socket)=>{
    socket["nickname"] = "Anon";
    socket.onAny((event)=>{
        console.log(`Socket Event: ${event}`);
    });
    
    socket.on("enter_room", (roomName, done) =>{
        
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname); // welcome의 event를 roomName에 있는 모든 사람들에게 emit
    }); 

    socket.on("disconnecting", ()=>{
        socket.rooms.forEach((room)=> socket.to(room).emit("bye"), socket.nickname);
    });

    socket.on("new_message", (msg, room, done)=>{
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    })

    socket.on("nickname", (nickname)=>{
        socket["nickname"] = nickname;
    })
});


function onSocketClose() {
    console.log("Discnnected from the Browser ❌");
};


/*
const wss = new WebSocket.Server({ server }); // 서버는 http, ws 2개의 protocol을 이해할 수있다.
const sockets = [];
wss.on("connection",(socket)=> { // 커넥션이 생겼을때 socket으로 즉시 메세지를 보낸다

    sockets.push(socket);
    console.log("현재 연결된 소켓 수: " + sockets.length);
    socket["nickname"] = "Anon";

    console.log("Connected to Browser ✅");
    socket.on("close",onSocketClose);
    socket.on("message", (msg) => {
        //socket.send(message.toString()); // 프론트에서 받은거 보내기
        
        const message = JSON.parse(msg);
        //console.log(parsed, message);

        switch(message.type){
            case "new_message":
                sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${message.payload.toString()}`));
                break;
            case "nickname":
                socket["nickname"] = message.payload;
                break;

        }

    });
    
}); */

httpServer.listen(3000, handleListen);