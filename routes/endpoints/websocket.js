require("dotenv").config();
const express = require("express");
const router = express.Router();
const WebSocket = require('ws');

function createwssRoutes(clients) {
    router.post("/ws/:userid",async (req, res) => {
        const {message} = req.body;
        const {userid} = req.params;
        try {
            const client = clients.get(userid);
            console.log('client.readyState', client.readyState);
            if (client && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
            // wss.clients.forEach(function each(client) {
            //     console.log(client, userid);
            //     if (client.readyState === WebSocket.OPEN && client.clientId === userid) {
            //         client.send(JSON.stringify(message));
            //     }
            // })
            res.status(200).send("Message from Websocket");
        } catch (e) {
          console.error(`/ws:${e.message}`);
          res.end();
        }
    
      }
    );


    return router;
        
}


module.exports = createwssRoutes;