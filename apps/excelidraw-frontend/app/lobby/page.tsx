// "use client";

// import { useState } from "react";
// import styles from "./page.module.css";
// import { useRouter } from "next/navigation";

// export default function Home():JSX.Element {
//   const [roomId, setRoomId] = useState("");
//   const router = useRouter();

//   return (
//     <div style={{
//       display: "flex",
//       justifyContent: "center",
//       alignItems: "center",
//       height: "100vh",
//       width: "100vw"
//     }}>
//       <div>
//         <input style={{
//           padding: 10
//         }} value={roomId} onChange={(e) => {
//           setRoomId(e.target.value);
//         }} type="text" placeholder="Room id"></input>

//         <button style={{padding: 10}} onClick={() => {
//           window.location.href = `http://localhost:3000/canvas/${roomId}`;
//         }}>Join room</button>
//       </div>
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Home(): JSX.Element {
  const [roomName, setRoomName] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);
  const router = useRouter();

  // Fetch all rooms on load
  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/rooms`);
        console.log("BACKEND RESPONSE:", res.data);
        setRooms(res.data.rooms);
      } catch (err) {
        console.log("Error fetching rooms");
      }
    }

    fetchRooms();
  }, []);

  async function createRoom() {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/rooms`,
        { name: roomName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      router.push(`/canvas/${res.data.roomid}`);

    } catch (err) {
      alert("Error creating room");
    }
  }

  function joinRoom(id: number) {
    console.log("Joining room with ID:", id);
    router.push(`/canvas/${id}`);
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Create Room</h1>

      <input
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="Room name"
        style={{ padding: 10 }}
        className="text-black"
      />

      <button
        onClick={createRoom}
        style={{ padding: 10, marginLeft: 10 }}
      >
        Create Room
      </button>

      <hr style={{ margin: "30px 0" }} />

      <h2>Available Rooms</h2>

      {rooms.map((room) => (
        <div key={room.id} style={{ marginBottom: 10 }}>
          {room.slug}
          <button
            style={{ marginLeft: 10 }}
            onClick={() => joinRoom(room.id)}
          >
            Join
          </button>
        </div>
      ))}
    </div>
  );
}

