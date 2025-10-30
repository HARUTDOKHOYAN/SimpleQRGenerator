import {SegmentStrategyType} from "./QREnums";

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
    neighbors?: { n: boolean; e: boolean; s: boolean; w: boolean };
}

export type QrSvgOptions = {
    margin?: number; 
    foregroundColor?: string; 
    backgroundColor?: string;
    moduleScale?: number; 
    FinderInsideSegments?:FinderInsideSegments;
    FinderBorderSegments?:FinderBorderSegments;
    DataSegments?:DataSupportedSegments;
};

export type FinderInsideSegments =
    SegmentStrategyType.Circular |
    SegmentStrategyType.Diamond |
    SegmentStrategyType.Square |
    SegmentStrategyType.CircalInside |
    SegmentStrategyType.RoundedSquare |
    SegmentStrategyType.CornerflowInside |
    SegmentStrategyType.SquircleInside;
export type FinderBorderSegments =
    SegmentStrategyType.Circular |
    SegmentStrategyType.Square |
    SegmentStrategyType.BagelBorder |
    SegmentStrategyType.RoundedSquare |
    SegmentStrategyType.SquircleBorder |
    SegmentStrategyType.CornerflowBorder

export type DataSupportedSegments =
    SegmentStrategyType.Circular |
    SegmentStrategyType.Square |
    SegmentStrategyType.Triangle |
    SegmentStrategyType.RoundedSquare |
    SegmentStrategyType.Diamond

export type ViewBoxSize = {
    minX:number;
    minY:number;
    width:number;
    height:number;
}

export type SVGPath = {
    data:string;
    color:string;
    fillRule?: 'nonzero' | 'evenodd';
    clipRule?: 'nonzero' | 'evenodd';
}
