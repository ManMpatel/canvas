import { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";


// export function middleware(req: Request, res: Response, next: NextFunction) {
//     const token = req.headers["authorization"] ?? "";

//     const decoded = jwt.verify(token, JWT_SECRET);

//     if (decoded) {
//         // @ts-ignore: TODO: Fix this
//         req.userId = decoded.userId;
//         next();
//     } else {
//         res.status(403).json({
//             message: "Unauthorized"
//         })
//     }
// }

interface CustomJwtPayload extends JwtPayload {
  userId: string;
}

export function middleware(req: Request, res: Response, next: NextFunction) : void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
     res.status(403).json({ message: "No token provided" });
     return
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
     res.status(403).json({ message: "Invalid authorization format" });
     return;
  }

  const token = parts[1];

  // explicit runtime guard so TypeScript knows `token` is a string
  if (!token) {
    res.status(403).json({ message: "Invalid token" });
    return;
  }

  try {
    // cast via unknown to satisfy TS about jwt.verify return type
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as CustomJwtPayload;

    // extend express Request type in a .d.ts file (recommended), or @ts-ignore
    // @ts-ignore-next-line if you haven't extended Request
    req.userId = decoded.userId;

    next();
  } catch (err) {
     res.status(403).json({ message: "Invalid token" });
     return;
  }
}