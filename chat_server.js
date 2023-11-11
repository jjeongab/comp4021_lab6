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
        return;
    }
    const {avatar, name, pd} = users[username];
    req.session.user = {username, avatar , name};
    //
    // G. Sending a success response with the user account
    //
    res.json({ status: "success", user: {username, avatar, name}});
    // Delete when appropriate
    // res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {

    //
    // B. Getting req.session.user
    //
    const user = req.session.user;
    //
    // D. Sending a success response with the user account
    //
    if (user){
    }
    else{
        res.json({status: "error". error});
    }
    res.json({ status: "success", user: {username, avatar, name}});
 
    // Delete when appropriate
    res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {

    //
    // Deleting req.session.user
    //    
    const user = req.session.user;
    if (req.session.user)
        delete req.user;
    //
    // Sending a success response
    //
    res.json({ success: true });    
 
    // Delete when appropriate
    res.json({ status: "error", error: "This endpoint is not yet implemented." });
});


//
// ***** Please insert your Lab 6 code here *****
//
// const { createServer } = require("http");
// const { Server } = require("socket.io");
// const e = require("express");
// const httpServer = createServer(app);
// const io = new Server(httpServer);

// io.use((socket, next) =>{
//     chatSession(socket.request, {}, next);
// });
// const onlineUsers = {};

// io.on("connection", (socket) =>{
//     if(socket.request.session.user)
//     {
//         onlineUsers[username] = {avatar, name};
//         io.emit("add user", user);
//         console.log(onlineUsers);
//     }
//     socket.on("disconnect", () => 
//     {
//         delete onlineUsers[username];
//         io.emit("remove user", user);
//         console.log(onlineUsers);
//     });
//     socket.on("get users", () =>
//     {
//         JSON.stringify(onlineUsers);
//         socket.emit("users", onlineUsers);
//     })
// });
// Use a web server to listen at port 8000
app.listen(8000, () => {
    console.log("The chat server has started...");
});
