import SVGBuildHelper from "../Helpers/SVGBuildHelper";
import {SegmentStrategyType} from "../Types/QREnums";
import {SegmentData} from "../Types/QRTypes";

export interface ISegmentCreateStrategy
{
    CreateSegmentStrategy(builder:SVGBuildHelper ,data: SegmentData): void;
}

export class SegmentCreatorFactory {
    private _creates:Map<SegmentStrategyType, ISegmentCreateStrategy> = new Map<SegmentStrategyType, ISegmentCreateStrategy>();
    constructor() {
        this._creates.set(SegmentStrategyType.Circular,new CircularSegmentCreateStrategy());
        this._creates.set(SegmentStrategyType.Square,new SquareSegmentCreateStrategy());
        this._creates.set(SegmentStrategyType.FinderBorderBagel,new FinderBorderBagelCreateStrategy());
        this._creates.set(SegmentStrategyType.FinderInside,new FinderInsideBigCircleCreate());
        this._creates.set(SegmentStrategyType.FinderInsideTriangle,new FinderInsideTriangleCreateStrategy());
    }
    public GetStrategy(type:SegmentStrategyType):ISegmentCreateStrategy | null{
        if(this._creates.has(type))
            return  this._creates.get(type)?? null;
        return null
    }
}

class CircularSegmentCreateStrategy implements ISegmentCreateStrategy{
    CreateSegmentStrategy(builder: SVGBuildHelper,data: SegmentData ): void {
        const cx = data.point.X + data.margin + 0.5;
        const cy = data.point.Y + data.margin + 0.5;
        builder.AddCircleInSegment(`${data.segmentName}`,cx,cy,data.radius,data.color)
    }
}

class SquareSegmentCreateStrategy implements ISegmentCreateStrategy{
    CreateSegmentStrategy(builder: SVGBuildHelper,data: SegmentData ): void {
        const x = data.point.X + data.margin;
        const y = data.point.Y + data.margin;
        builder.AddRectInSegment( data.segmentName,x,y , data.size , data.color);
    }
}

class FinderInsideBigCircleCreate implements ISegmentCreateStrategy{
    // center of finder pattern: offset 3 from top-left within 7x7
    private _finderOffset:number = 3;
    CreateSegmentStrategy(builder: SVGBuildHelper,data: SegmentData ): void {
               // Determine which finder this module belongs to and draw one big circle centered on it
               // Anchors: (0,0), (size-7,0), (0,size-7)
                const size = data.size;
                const anchors = [
                        {x0: 0, y0: 0},
                       {x0: size - 7, y0: 0},
                       {x0: 0, y0: size - 7}
                  ];
                for (const {x0, y0} of anchors) {
                       const cx = x0 + this._finderOffset + data.margin + 0.5;
                       const cy = y0 + this._finderOffset + data.margin + 0.5;
                       const ringRadius = 1.5; // covers finder area
                       builder.AddCircleInSegment("QRSegment.FinderBorder", cx, cy, ringRadius, data.color);
                   }
           }
}

class FinderBorderBagelCreateStrategy implements ISegmentCreateStrategy{
    CreateSegmentStrategy(builder: SVGBuildHelper,data: SegmentData ): void {
        const size = data.size;
        const anchors = [
            {x0: 0, y0: 0},
            {x0: size - 7, y0: 0},
            {x0: 0, y0: size - 7}
        ];
        const cxOffset = 3 + data.margin + 0.5;
        const cyOffset = 3 + data.margin + 0.5;
        const ringRadius = 3;
        const strokeWidth = data.finderBorderRingStrokeWidth ?? 1;
        for (const {x0, y0} of anchors) {
            const cx = x0 + cxOffset;
            const cy = y0 + cyOffset;
            builder.AddRingInSegment("QRSegment.FinderBorder", cx, cy, ringRadius, strokeWidth, data.color);
        }
    }
}

class FinderInsideTriangleCreateStrategy implements ISegmentCreateStrategy{
    CreateSegmentStrategy(builder: SVGBuildHelper,data: SegmentData ): void {
        // Draw a triangle within the current 1x1 module cell at data.point
        const x = data.point.X + data.margin;
        const y = data.point.Y + data.margin;
        const moduleSize = 1;
        const p1 = `${x + moduleSize/2},${y}`;              // top-center
        const p2 = `${x},${y + moduleSize}`;                 // bottom-left
        const p3 = `${x + moduleSize},${y + moduleSize}`;    // bottom-right
        const points = `${p1} ${p2} ${p3}`;
        builder.AddPolygonInSegment("QRSegment.FinderInside", points, data.color);
    }
}