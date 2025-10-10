import {Point} from "../Types/QRTypes";
import {QRSegment} from "../Types/QREnums";

const FINDER_SIZE = 7;



export function GetQRSegmentByCoordinates(point:Point, size: number): QRSegment {

    for (const startPoint of getFinderAnchors(size)) {
        if (isInRect(point.X, point.Y, startPoint.X, startPoint.Y, FINDER_SIZE, FINDER_SIZE)) {
            const onLeftOrRight = point.X === startPoint.X || point.X === startPoint.X + FINDER_SIZE - 1;
            const onTopOrBottom = point.Y === startPoint.Y || point.Y === startPoint.Y + FINDER_SIZE - 1;
            return onLeftOrRight || onTopOrBottom ? QRSegment.FinderBorder : QRSegment.FinderInside;
        }
    }
    return QRSegment.Data;
}

function getFinderAnchors(size: number): Array<Point> {
    return [
        { X: 0, Y: 0 },
        { X: size - FINDER_SIZE, Y: 0 },
        { X: 0, Y: size - FINDER_SIZE },
    ];
}

function isInRect(x: number, y: number, left: number, top: number, width: number, height: number): boolean {
    return x >= left && x <= left + width - 1 && y >= top && y <= top + height - 1;
}