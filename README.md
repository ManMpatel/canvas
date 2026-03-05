# 🎨 Excelidraw – Realtime Collaborative Drawing App

A **real-time collaborative whiteboard application** inspired by Excalidraw.

Multiple users can **draw together in the same room**, and every drawing event is **synchronized instantly using WebSockets**. Shapes are also **stored in a database**, so drawings remain visible even after refreshing the page.

---

# 🚀 Demo

## 🎥 Project Walkthrough

👉 **Demo Video:**  
(soon)

In the demo you will see:

• User authentication  
• Joining a drawing room  
• Real-time drawing with multiple users  
• Pencil free drawing  
• Rectangle and circle drawing  
• Eraser functionality  
• Database persistence of drawings  

---

# ✨ Features

### 🎨 Drawing Tools
- Rectangle Tool
- Circle Tool
- Pencil Tool (free-hand drawing)
- Eraser Tool

### ⚡ Real-Time Collaboration
- Multiple users drawing simultaneously
- Instant synchronization via WebSockets
- Event broadcasting only to users in the same room

### 💾 Database Persistence
- Shapes are saved in a PostgreSQL database
- Drawings remain after refresh

### 🔐 Authentication
- JWT based authentication
- Secure WebSocket connections

### 🏠 Room System
- Users can join different drawing rooms
- Drawing events are scoped to the room

---

# 🏗 System Architecture

This project uses a **monorepo architecture** with separate services for frontend, HTTP backend, and WebSocket backend.

```
canvas
│
├── apps
│   ├── excelidraw-frontend
│   ├── ws-backend
│   └── http-backend
│
├── packages
│   └── db
│
├── pnpm-workspace.yaml
└── turbo.json
```

---

# ⚙️ Tech Stack

### Frontend
• React  
• TypeScript  
• HTML Canvas API  

### Backend
• Node.js  
• WebSocket (ws library)  
• JWT Authentication  

### Database
• PostgreSQL  
• Prisma ORM  
• Neon Database  

### Development Tools
• PNPM Workspaces  
• Turbo Monorepo  

---

# 🔄 Real-Time Communication Flow

When a user draws something:

1️⃣ User draws on the canvas  
2️⃣ Frontend sends the shape data through WebSocket  
3️⃣ WebSocket server receives the message  
4️⃣ Shape is stored in the database  
5️⃣ Event is broadcast to all users in the same room  
6️⃣ All clients update their canvas instantly  

Example WebSocket message:

```
{
  "type": "chat",
  "roomId": "4",
  "message": {
    "shape": {
      "type": "rect",
      "x": 100,
      "y": 120,
      "width": 200,
      "height": 150
    }
  }
}
```

---

# 🧠 Canvas Rendering Logic

The canvas rendering works by maintaining a list of shapes.

Each shape contains:

- type
- position
- size
- coordinates

Example shape structure:

```
{
  "shape": {
    "type": "circle",
    "centerX": 320,
    "centerY": 200,
    "radiusX": 50,
    "radiusY": 50
  }
}
```

When a new shape is received:

1️⃣ It is pushed into `existingShapes` array  
2️⃣ Canvas is cleared  
3️⃣ All shapes are redrawn sequentially  

This approach ensures **consistent rendering across all clients**.

---

# 🧹 Eraser Logic

The eraser works by detecting when the cursor overlaps a shape.

When detected:

1️⃣ The shape is removed from the canvas state  
2️⃣ The backend deletes it from the database  
3️⃣ A WebSocket event is broadcast to all users  
4️⃣ All clients update their canvas  

---

# 🗄 Database Schema

Shapes are stored as chat messages.

Example table structure:

```
Chat
---------------------
id
roomId
userId
message
```

Each drawing action is saved as structured JSON.

---

# 🛠 Running the Project Locally

### 1️⃣ Clone Repository

```
git clone https://github.com/ManMpatel/canvas.git
```

### 2️⃣ Install Dependencies

```
pnpm install
```

### 3️⃣ Configure Environment Variables

Create `.env`

```
DATABASE_URL=your_database_url
JWT_SECRET=your_secret
```

### 4️⃣ Run Database Migration

```
pnpm prisma migrate dev
```

### 5️⃣ Start Development Server

```
pnpm run dev
```

This starts:

• React frontend  
• WebSocket backend  
• HTTP backend  

---

# 📈 Future Improvements

Planned enhancements:

• Undo / Redo functionality  
• Shape selection and movement  
• User cursor presence (like Figma)  
• Canvas zoom and panning  
• Shape IDs for precise deletion  
• Performance optimizations for large drawings  

---

# 👨‍💻 Author

**Man Manojkumar Patel**

Full-Stack Developer  
Sydney, Australia

---

# ⭐ If you like the project

Feel free to star the repository.
