const socket = new WebSocket(`ws://${window.location.host}`);

const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");


function makeMessage(type, payload) {
    const msg = { type, payload };
    return JSON.stringify(msg);
}


socket.addEventListener("open", () => {
    console.log("Connected to Server");
});

socket.addEventListener("message", (message)=>{
    //console.log("New message: ", message.data);
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
});

socket.addEventListener("close", ()=> {
    console.log("Disconnected for server X");
});


function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    //console.log(input.value);
    socket.send(makeMessage("new_message",input.value));
    input.value = "";
}

function handleNickSubmit(event){
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);

/*
setTimeout(()=>{
    socket.send("hello fro the browser!");
}, 10000);
*/