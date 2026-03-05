import { WebSocket, WebSocketServer } from 'ws';
import jwt, { JwtPayload } from "jsonwebtoken";
// import { JWT_SECRET } from '@repo/backend-common';
import { prismaClient } from "@repo/db/client";
const JWT_SECRET = "12321";

const wss = new WebSocketServer({ port: 8080 });


console.log("WebSocket server running on port 8080");
interface User {
  ws: WebSocket,
  rooms: string[],
  userId: string
}

const users: User[] = [];

function checkUser({ token }: { token: string; }): string | null {
  try {

    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    console.log("Decoded token:", decoded);

    if (!decoded.userId) {
      console.log(decoded.userId);
      return null;
    }

    return decoded.userId as string;

  } catch (e) {
    console.log("JWT ERROR:", e);
    return null;
  }
}









wss.on('connection', function connection(ws, request) {
  
  const url = request.url;
  if (!url) {
    return;
  }

  
  const queryParams = new URLSearchParams(url.split('?')[1]);
  const token = queryParams.get('token') || "";
  console.log("New connection, userId:", token);
  const userId = checkUser({ token });
  console.log("New connection, userId:", userId);
  
  if (userId == null) {
    ws.close()
    return null;
  }

  users.push({
    userId,
    rooms: [],
    ws
  })







  
  ws.on('message', async function message(data) {
    let parsedData;
    if (typeof data !== "string") {
      parsedData = JSON.parse(data.toString());
    } else {
      parsedData = JSON.parse(data); // {type: "join-room", roomId: 1}
    }

    if (parsedData.type === "join_room") {
      const user = users.find(x => x.ws === ws);
      user?.rooms.push(String(parsedData.roomId));
    }

    if (parsedData.type === "leave_room") {
      const user = users.find(x => x.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user?.rooms.filter(x => x !== parsedData.roomId);
    }

    console.log("message received")
    console.log(parsedData);

    if (parsedData.type === "erase") {

      await prismaClient.chat.deleteMany({
          where: {
            roomId: Number(parsedData.roomId)
          }
      });

      wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: "erase"
            }));
          }
      });
    }


    if (parsedData.type === "chat") {
      const roomId = String(parsedData.roomId);
      const message = parsedData.message;

      try {
      console.log("Trying to save:", roomId, userId);
      const saved = await prismaClient.chat.create({
        data: {
          roomId: Number(roomId),
          message,
          userId
        }
      });

        console.log("Saved:", saved);
      } catch (err) {
        console.error("DB ERROR:", err);
      }

     
      
      users.forEach(user => {
        if (user.rooms.includes(String(roomId))) {
          user.ws.send(JSON.stringify({
            type: "chat",
            message: message,
            roomId
          }))
        }
      })
    }

  });

});

