import { WebSocket, WebSocketServer } from 'ws';
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common';
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });


console.log("WebSocket server running on port 8080");
interface User {
  ws: WebSocket,
  rooms: string[],
  userId: string
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {

    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    console.log("Decoded token:", decoded);

    if (!decoded.userId) {
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
  const userId = checkUser(token);
  console.log("New connection, userId:", token);
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

    if (parsedData.type === "chat") {
      const roomId = String(parsedData.roomId);
      const message = parsedData.message;

      try {
      console.log("Trying to save:", roomId, userId);

      console.log(roomId, message, userId);
      console.log(roomId, message, userId);
      console.log(roomId, message, userId);
      const saved = await prismaClient.chat.create({
        data: {
          roomId: Number(roomId),
          message,
          userId
        }
      });

        console.log("✅ Saved:", saved);
      } catch (err) {
        console.error("❌ DB ERROR:", err);
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

