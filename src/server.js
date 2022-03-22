import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

//console.log("hello");


const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server }); // 서버는 http, ws 2개의 protocol을 이해할 수있다.

function onSocketClose() {
    console.log("Discnnected from the Browser ❌");
};

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
    
});

server.listen(3000, handleListen);