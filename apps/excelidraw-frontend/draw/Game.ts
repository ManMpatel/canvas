import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radiusX: number;
    radiusY: number;
} | {
    type: "pencil";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
} 

export class Game {

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[]
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "circle";

    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }
    
    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)

        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)

        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)
    }

    setTool(tool: "circle" | "pencil" | "rect" | "eraser" ) {
        this.selectedTool = tool;
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        console.log(this.existingShapes);
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type == "chat") {
                const parsedShape = JSON.parse(message.message)
                this.existingShapes.push(parsedShape.shape)
                this.clearCanvas();
            }
        }
    }

   

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0, 0, 0)"
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.existingShapes.map((shape) => {
            if (shape.type === "rect") {
                this.ctx.strokeStyle = "rgba(255, 255, 255)"
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.ellipse(shape.centerX,shape.centerY,shape.radiusX,shape.radiusY,0,0,Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();                
            }else if (shape.type === "pencil"){
                this.ctx.beginPath();
                this.ctx.moveTo(shape.startX , shape.startY);
                this.ctx.lineTo(shape.endX , shape.endY);
                this.ctx.stroke();
                this.ctx.closePath();
            }
        })
    }

    mouseDownHandler = (e: MouseEvent) => {
        this.clicked = true
        this.startX = e.offsetX
        this.startY = e.offsetY
    }
    mouseUpHandler = (e: MouseEvent) => {
        this.clicked = false
        const width = e.offsetX - this.startX;
        const height = e.offsetY - this.startY;

        const selectedTool = this.selectedTool;
        let shape: Shape | null = null;
        if (selectedTool === "rect") {

            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                height,
                width
            }
        } else if (selectedTool === "circle") {
            const width = e.offsetX - this.startX;
            const height = e.offsetY - this.startY;

            const centerX = this.startX + width / 2;
            const centerY = this.startY + height / 2;

            shape = {
                type: "circle",
                centerX,
                centerY,
                radiusX: Math.abs(width / 2),
                radiusY: Math.abs(height / 2),
            };
        }

        if (!shape) {
            return;
        }


        this.existingShapes.push(shape);

        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                shape
            }),
            roomId: this.roomId
        }))
    }
    mouseMoveHandler = (e: MouseEvent) => {
        if (this.clicked) {
            const mouseX = e.offsetX;
            const mouseY = e.offsetY;
            
            //*to eras the shape while erasing
            if (this.selectedTool === "eraser") {
            this.ctx.beginPath();
             const eraseRadius = 40;
            this.ctx.arc(mouseX, mouseY, eraseRadius, 0, Math.PI * 2);
            this.ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.closePath();

            this.existingShapes = this.existingShapes.filter((shape) => {

                // Pencil  partial erase
                if (shape.type === "pencil") {
                    const x1 = shape.startX;
                    const y1 = shape.startY;
                    const x2 = shape.endX;
                    const y2 = shape.endY;

                    const A = mouseX - x1;
                    const B = mouseY - y1;
                    const C = x2 - x1;
                    const D = y2 - y1;

                    const dot = A * C + B * D;
                    const len_sq = C * C + D * D;
                    const param = len_sq !== 0 ? dot / len_sq : -1;

                    let xx, yy;

                    if (param < 0) {
                        xx = x1;
                        yy = y1;
                    } else if (param > 1) {
                        xx = x2;
                        yy = y2;
                    } else {
                        xx = x1 + param * C;
                        yy = y1 + param * D;
                    }

                    const dx = mouseX - xx;
                    const dy = mouseY - yy;

                    return (dx * dx + dy * dy) > eraseRadius * eraseRadius;
                }

                //  Rect  delete whole if touched
                if (shape.type === "rect") {
                    const closestX = Math.max(shape.x, Math.min(mouseX, shape.x + shape.width));
                    const closestY = Math.max(shape.y, Math.min(mouseY, shape.y + shape.height));

                    const dx = mouseX - closestX;
                    const dy = mouseY - closestY;

                    return (dx * dx + dy * dy) > eraseRadius * eraseRadius;
                }

                // Circle  delete whole if touched
                if (shape.type === "circle") {
                    const dx = mouseX - shape.centerX;
                    const dy = mouseY - shape.centerY;

                    const value =
                        (dx * dx) / (shape.radiusX * shape.radiusX) +
                        (dy * dy) / (shape.radiusY * shape.radiusY);

                    // value <= 1 means inside ellipse
                    return value > 1;
                }

                return true;
            });

            this.clearCanvas();
            return;
        }
            
        // *to draw the shape while moving the mouse
            const selectedTool = this.selectedTool;
            const width = e.offsetX - this.startX;
            const height = e.offsetY - this.startY;
            if (selectedTool !== "pencil") {
                this.clearCanvas();
                }
            this.ctx.strokeStyle = "rgba(255, 255, 255)"

            if (this.selectedTool === "rect") {
                this.ctx.strokeRect(this.startX, this.startY, width, height);   
            } else if (this.selectedTool === "circle") {
                const width = e.offsetX - this.startX;
                const height = e.offsetY - this.startY;

                const centerX = this.startX + width / 2;
                const centerY = this.startY + height / 2;

                const radiusX = Math.abs(width / 2);
                const radiusY = Math.abs(height / 2);

                this.ctx.beginPath();
                this.ctx.ellipse(
                centerX,
                centerY,
                radiusX,
                radiusY,
                0,              // rotation
                0,
                Math.PI * 2
                );
                this.ctx.stroke();
                this.ctx.closePath();
            } else if(this.selectedTool === "pencil" && this.clicked) {
                
                this.existingShapes.push ({
                type: "pencil",
                startX: this.startX,
                startY: this.startY,
                endX :e.clientX,
                endY: e.clientY,
                })
            
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(e.clientX, e.clientY);
                this.ctx.stroke();
                this.ctx.closePath();

                this.startX = e.clientX;
                this.startY = e.clientY;
            }
            
        }
    }

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler)

        this.canvas.addEventListener("mouseup", this.mouseUpHandler)

        this.canvas.addEventListener("mousemove", this.mouseMoveHandler)    

    }
}





// add the eraser tool first and the second version 
// make the connection fo the fronted of excelidraw sign in and the dsign up to the room page and tehn the excelidraw page.



// say Radhe Radhe when overthinking
// sit in hte bit darker room with the quite space
// set for the 40 min and then take a breack 