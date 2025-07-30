const mongoose=require("mongoose");

const chatModel=new mongoose.Schema({
    senderId:{type:String, required:true},
    receiverId:{type:String, required:true},
    message:{type:String, required:true},
    timeStamp:{type:Date,default:Date.now},
    room:{type:String}
});
module.exports=mongoose.model("chat",chatModel);