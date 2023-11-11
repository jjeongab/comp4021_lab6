const express = require("express");

const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");

// Create the Express app
const app = express();

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const chatSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 }
});
app.use(chatSession);

// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

// Handle the /register endpoint
app.post("/register", (req, res) => {
    // Get the JSON data from the body
    const {username, avatar, name, password } = req.body;

    //
    // D. Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync("data/users.json"));
    //
    // E. Checking for the user data correctness
    //
    if(!containWordCharsOnly(username))
    {
        console.log("inside the containwordcharsoly");
        res.json({status: "error", error: "invalid name" });
        return;
    }
    //
    // G. Adding the new user account
    //
    console.log("outside the containwordcharsoly");
    const hash = bcrypt.hashSync(password, 10);
    //
    // H. Saving the users.json file
    //
    users[username] = {avatar, name, password: hash};
    fs.writeFileSync("data/users.json", JSON.stringify(users, null, "  "));
    //
    // I. Sending a success response to the browser
    //
    res.json({ status: "success"});
    // Delete when appropriate
    // res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

// Handle the /signin endpoint
app.post("/signin", (req, res) => {
    // Get the JSON data from the body
    const { username, password } = req.body;
    //
    // D. Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync("data/users.json"));
    //
    // E. Checking for username/password
    //
    if(username in users) {
    }
    const psw = password;
    const hashpsw = users[username].password;
    console.log(hashpsw);
    if(bcrypt.compareSync(psw, hashpsw)){
    }else{
        res.json({status: "error", error:  "Password does not match"});
    }
    const {avatar, name, pd} = users[username];
    req.session.user = { username,  avatar , name};
    //
    // G. Sending a success response with the user account
    //
    console.log("signin", req.session.user);
    // console.log(typeof(req.session.user));
    res.json({ status: "success", user: req.session.user});
    // Delete when appropriate
    // res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {

    //
    // B. Getting req.session.user
    //
    //
    // D. Sending a success response with the user account
    //
    if (req.session.user != null){
    }
    else{
        res.json({status: "error". error});
        return;
    }
    const {username, avatar, name} = req.session.user;
    res.json({ status: "success", user: req.session.user});
 
    // Delete when appropriate
    // res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {

    //
    // Deleting req.session.user
    //    
    console.log("On a singout");
    console.log("before on app signout ", req.session.user);
    // if(req.session.user.username != null){
    //     delete req.session.user.username;
    // }
    // if(req.session.user.avatar != null){
    //     delete req.session.user.avatar;
    // }
    // if(req.session.user.name != null){
    //     delete req.session.user.name;
    // }
    //
    // Sending a success response
    //
    delete req.session.user;
    console.log("after on app signout", req.session.user);
    res.json({ status: "success"});    
 
    // Delete when appropriate
    // res.json({ status: "error", error: "This endpoint is not yet implemented." });
});


//
// ***** Please insert your Lab 6 code here *****
//
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer);

io.use((socket, next) =>{
    chatSession(socket.request, {}, next);
});
//javascript object st{oring the online users
const onlineUsers = {
    "tony": { avatar: "Owl",    name: "Tony Lee" },
    "may":  { avatar: "Rabbit", name: "May Wong" }
};
io.on("connection", (socket) =>{ // adding a newuser to onlineUsers list 
    let username = null;
    let avatar = null;
    let name = null;
    if(socket.request.session.user)
    {
        // const {username, avatar, name} = socket.request.session.user;
        // const obj = Object.values(socket.request.session.user);
        // console.log(typeof(socket.request.session.user));
        // username = obj[0];
        // avatar = obj[1];
        // name = obj[2];
        const obj = socket.request.session.user;
        // console.log("obj", obj);
        username = obj.username;
        avatar = obj.avatar;
        name = obj.name;
        // console.log("name", name);
        // console.log("name:", obj[2]);
        onlineUsers[username] = {avatar, name};
        console.log("onlineUsers:", onlineUsers);
        // io.emit("add user", JSON.stringify(onlineUsers[username]));
        // const user = JSON.stringify(onlineUsers[username]);
        io.emit("add user", JSON.stringify(onlineUsers[username]));
        // console.log(onlineUsers);
    }
    socket.on("disconnect", () => 
    {
        const obj = socket.request.session.user;
        // console.log("obj", obj);
        // username = obj.username;
        // avatar = obj.avatar;
        // name = obj.name;
        const user = JSON.stringify(onlineUsers[username]);
        delete onlineUsers[username];
        io.emit("remove user",user);
    });
    socket.on("get users", () =>
    {
        // const data = JSON.stringify(onlineUsers); // data need to be stringify
        io.emit("users",JSON.stringify(onlineUsers));
        // io.emit("users", data);
    });
    socket.on("get messages", () =>
    {
        const chatroom = fs.readFileSync("data/chatroom.json", "utf-8"); // read an JSOn file to Javascript object 
        // console.log("chatroom get messages:", JSON.stringify(chatroom))
        socket.emit("messages",chatroom);
        // for(let key in chatroom)
        // {
        //     if(chatroom.hasOwnProperty(key))
        //     {
        //         const value = chatroom[key];
        //         console.log("value: ", JSON.stringify(value));
        //         // socket.emit("messages",JSON.stringify(value.content));
        //         socket.emit("messages",JSON.stringify(value));
        //     }
        // }
    });
    socket.on("post message", (content) =>{
        console.log("content in post messages", content);
        const message = {
            user: {username, avatar, name},
            datetime: new Date(),
            content: content
        } // message is an object type 
        const chatroom = JSON.parse(fs.readFileSync("data/chatroom.json")); // also an object type 
        chatroom.push(message);
        fs.writeFileSync("data/chatroom.json", JSON.stringify(chatroom, null, "  "));
        io.emit("add message", JSON.stringify(message));

    });
    // socket.on("typing", (username) =>
    // {
    //     username = socket.request.session.user.username;
    //     console.log("tping username: ", username);
    //     io.emit("typing message", JSON.stringify(username));
    // });
    socket.on('typing', (data)=>{
        if(data.typing==true)
           io.emit('display', data)
        else
            data.typing = false;
           io.emit('display', data)
      })
});
// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
    console.log("The chat server has started...");
});
