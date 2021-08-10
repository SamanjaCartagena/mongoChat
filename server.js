const express = require('express');
const cors= require('cors');
const app = express();
app.use(cors());
const mongo = require('mongodb').MongoClient;
const client = require('socket.io')(4000).sockets;


//Connect to mongo
var url = "mongodb://localhost:27017/";

mongo.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("astoriaChats");
 let chat= dbo.createCollection("chats", function(err, res) {
    if (err) throw err;
    console.log("Collection created!");
    
  });

    //Connect to socket.io
    client.on('connection', function(socket){
     //  let chat = database.collection('astoriachats');
        
        //Create function to send status
        sendStatus = function(s){
            socket.emit('status',s); 
        }
        //Get chats from mongo collection
        dbo.collection("chats").find().limit(100).sort({_id:1}).toArray(function(err,res){
          if(err){
              throw error;
          }
          //Emit the messages
          socket.emit('output',res);
        });

        //Handle input events
        socket.on('input', function(data){
         let name = data.name;
         let message = data.message;


         //Check for name and message
         if(name == '' || message == ''){
             //Send error status
             sendStatus('Please enter a name and message');
         }
         else{
             //Insert message
             dbo.collection("chats").insert({name: name, message:message}, function(){
                 client.emit('output',[data]);
                 //Send status object
                 sendStatus({
                     message:'Message sent',
                     clear:true
                 });
             });
         }
        });
      //Handle clear
    //  socket.on('clear',function(data){
          //Remove all chats from collection
      //    dbo.collection("chats").remove({}, function(){
              //Emit cleared
        //      socket.emit('cleared');
          //});

      //});
      

    });
});