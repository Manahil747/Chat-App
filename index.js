const express=require("express");
const mongoose=require("mongoose");
const chat=require("./models/chatModel");
const responseModel=require("./responseModel");
const app=express();
app.use(express.json());
const cors=require("cors");
require("dotenv").config();
const port=process.env.PORT || 3000;
const http=require("http");
const {Server}=require("socket.io");
const server=http.createServer(app);

//MONGOOSE CONNECTED
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("Mongodb Connected"))
.catch(err=>console.log("error:",err));

// GET USER HISTORY PER ROOM
app.use("/chat_history/:roomName",async(req,res)=>{
    const room=req.params.roomName;
    try{
    const data=await chat.find({room})
    res.status(200).json(responseModel({
        statusCode:200,
        success:true,
        data:data,
        message:"Get data successully",
        documents:data.length
    }))}
    catch(err){
        res.status(400).json({Error:err.message});
    }
});


const io=new Server(server,{
    cors:{
        origin:"*",
        methods:['GET','POST']
    }
});

//SocketConnection
io.on("connection",(socket=>{
    console.log("User connected",socket.id);
    io.emit("userconnected",{userId:socket.id});

    // //Typing//
    socket.on("typing",roomName=>{
        socket.to(roomName).emit("user_typing",{userId:socket.id});
    });

    // //stop_typing
    socket.on("stop_typing",roomName=>{
        socket.to(roomName).emit("stop_typing",{userId:socket.id});
    });

    //join_room//
    socket.on("join_room",roomName=>{
        socket.join(roomName);
        console.log(`${socket.id}, ${roomName}`);
        socket.to(roomName).emit('userJoinRoom',{userId:socket.id, room:roomName});
    });

    //Leave_Room//
    socket.on("leave_room",roomName=>{
        socket.leave(roomName);
        console.log(`${socket.id},${roomName}`);
        socket.to(roomName).emit("userLeaveRoom",{userId:socket.id, room:roomName})
    });

    //send/receive_messages
    socket.on("send_message",async(data)=>{
        const{msg,roomName}=data;
        console.log(data);
        try{
        const messageData=new chat({
            senderId:socket.id,
            receiverId:roomName,
            message:msg,
            timeStamp:new Date(),
            room:roomName
        })
        console.log(messageData);
      await messageData.save();
      
      io.to(roomName).emit('receive_message',{userId:socket.id, message:msg});
    }
    catch(err){
        console.error(err);
    }
})
     socket.on("disconnect",()=>{
     console.log("User disconnected: ",socket.id);
     io.emit("userdisconnected",{userId:socket.id});
    })
}));

server.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});