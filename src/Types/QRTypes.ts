export type Point = {
    X : number;
    Y : number;
}

export type SegmentData = {
    segmentName:string
    color:string
    point: Point;
    margin : number;
    radius : number;
    size: number;
    finderBorderRingStrokeWidth?: number;
}

export type QrSvgOptions = {
    margin?: number; // quiet zone in modules
    darkColor?: string;
    lightColor?: string;
    moduleScale?: number; // for circle radius (0..1), 1 => r = 0.5
    segmentStrategy?: 'circular' | 'square' | 'finderBorderBigCircle' | 'finderBorderBagel';
    finderBorder?: {
        ringStrokeWidth?: number;
    }
};

export type ViewBoxSize = {
    minX:number;
    minY:number;
    width:number;
    height:number;
}

export type SVGPath = {
    data:string;
    color:string;
}
