const mongoose = require("mongoose"),
      User     = require("../models/user"),
      {ObjectID} = require("mongodb"),
      Message   = require("../models/message"),
      Channel   = require("../models/channel");


module.exports = (io)=>{
        io.on("connection", (socket)=>{
        console.log("New User Connected");


        socket.on("join", (params, callback)=>{
            socket.join(params.channelID);
        
            callback();
        });

        socket.on("createdMessage", (data, callback) =>{
            User.findById(ObjectID(data.userID)).then((rUser)=>{
                var msg = {
                    text: data.message,
                    author:{
                        id: rUser._id,
                        name: rUser.username
                    }
                };
                Message.create(msg).then((rMsg)=>{ 
                    console.log(rMsg);
                    Channel.findByIdAndUpdate(ObjectID(data.channelID)).then((rChannel)=>{
                        rChannel.message.push(rMsg);
                        rChannel.save();
                        //io.emit("newMessage", msg);
                        io.to(data.channelID).emit("newMessage",msg);
                        console.log(rChannel);
                    }).catch((e)=>{
                        console.log(e);
                    });
                }).catch((e)=>{
                    console.log(e);
                });

            }).catch((e)=>{
                console.log(e);
            });
            
            //io.emit("newMessage", data.message);
            callback();
        });

    
        socket.on("disconnect", (params)=>{
            console.log("Diconected");
        })
    });
}