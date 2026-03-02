import type { Tool } from "@/components/Canvas";

export type RectShape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} 

export type CircleShape = {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
} 

export type PencilShape = {
    type: "pencil";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

export type Shape = RectShape | CircleShape | PencilShape;