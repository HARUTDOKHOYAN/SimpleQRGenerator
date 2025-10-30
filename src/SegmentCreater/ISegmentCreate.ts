import SVGBuildHelper from "../Helpers/SVGBuildHelper";
import {SegmentStrategyType} from "../Types/QREnums";
import {SegmentData} from "../Types/QRTypes";

export interface ISegmentCreateStrategy
{
    CreateSegmentStrategy(builder:SVGBuildHelper ,data: SegmentData): void;
}

export class SegmentCreatorFactory {
    private _creates:Map<SegmentStrategyType, ISegmentCreateStrategy> = new Map<SegmentStrategyType, ISegmentCreateStrategy>();
    constructor()
    {
        this._creates.set(SegmentStrategyType.Circular, new CircularSegmentCreateStrategy());
        this._creates.set(SegmentStrategyType.Square, new SquareSegmentCreateStrategy());
        this._creates.set(SegmentStrategyType.CircalInside, new FinderInsideBigCircleSegmentCreateStrategy())
        this._creates.set(SegmentStrategyType.BagelBorder, new FinderBorderBagelSegmentCreateStrategy());
        this._creates.set(SegmentStrategyType.Triangle, new TriangleSegmentCreateStrategy());
        this._creates.set(SegmentStrategyType.RoundedSquare, new RoundedSquareSegmentCreateStrategy());
        this._creates.set(SegmentStrategyType.SquircleBorder, new SquircleFinderBorderSegmentCreateStrategy());
		this._creates.set(SegmentStrategyType.Diamond, new DiamondSegmentCreateStrategy());
        this._creates.set(SegmentStrategyType.CornerflowInside, new CornerflowFinderInsideSegmentCreateStrategy());
        this._creates.set(SegmentStrategyType.CornerflowBorder, new CornerflowBorderFinderSegmentCreateStrategy());
        this._creates.set(SegmentStrategyType.SquircleInside, new SquircleFinderInsideSegmentCreateStrategy());
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
        // Draw a single module as a 1x1 rectangle
        builder.AddRectInSegment(data.segmentName, x, y, 1, data.color);
    }
}

class FinderInsideBigCircleSegmentCreateStrategy implements ISegmentCreateStrategy{
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
                       builder.AddCircleInSegment(data.segmentName, cx, cy, ringRadius, data.color);
                   }
           }
}

class FinderBorderBagelSegmentCreateStrategy implements ISegmentCreateStrategy{
    CreateSegmentStrategy(builder: SVGBuildHelper,data: SegmentData ): void {
        const size = data.size;
        const anchors = [
            {x0: 0, y0: 0},
            {x0: size - 7, y0: 0},
            {x0: 0, y0: size - 7}
        ];
        // Only emit once per finder: when current point is the anchor's top-left cell
        const isAnchorTopLeft = anchors.some(a => a.x0 === data.point.X && a.y0 === data.point.Y);
        if (!isAnchorTopLeft) return;
        const cxOffset = 3 + data.margin + 0.5;
        const cyOffset = 3 + data.margin + 0.5;
        const ringRadius = 3;
        const strokeWidth = data.finderBorderRingStrokeWidth ?? 1;
        for (const {x0, y0} of anchors) {
            const cx = x0 + cxOffset;
            const cy = y0 + cyOffset;
            builder.AddRingInSegment(data.segmentName, cx, cy, ringRadius, strokeWidth, data.color);
        }
    }
}

class TriangleSegmentCreateStrategy implements ISegmentCreateStrategy{
    CreateSegmentStrategy(builder: SVGBuildHelper,data: SegmentData ): void {
        const x = data.point.X + data.margin;
        const y = data.point.Y + data.margin;
        const moduleSize = 1;
        const p1 = `${x + moduleSize/2},${y}`;              // top-center
        const p2 = `${x},${y + moduleSize}`;                 // bottom-left
        const p3 = `${x + moduleSize},${y + moduleSize}`;    // bottom-right
        const points = `${p1} ${p2} ${p3}`;
        builder.AddPolygonInSegment(data.segmentName, points, data.color);
    }
}


class DiamondSegmentCreateStrategy implements ISegmentCreateStrategy{
    CreateSegmentStrategy(builder: SVGBuildHelper, data: SegmentData): void {
        const x = data.point.X + data.margin;
        const y = data.point.Y + data.margin;
        const moduleSize = 1;
        const pTop = `${x + moduleSize / 2},${y}`;                 // top-center
        const pRight = `${x + moduleSize},${y + moduleSize / 2}`;   // right-center
        const pBottom = `${x + moduleSize / 2},${y + moduleSize}`;  // bottom-center
        const pLeft = `${x},${y + moduleSize / 2}`;                 // left-center
        const points = `${pTop} ${pRight} ${pBottom} ${pLeft}`;
        builder.AddPolygonInSegment(data.segmentName, points, data.color);
    }
}


class RoundedSquareSegmentCreateStrategy implements ISegmentCreateStrategy{

    CreateSegmentStrategy(builder: SVGBuildHelper , data: SegmentData): void {
        const x = data.point.X + data.margin;
        const y = data.point.Y + data.margin;
        const r = 0.5;
        const n = data.neighbors?.n ?? false;
        const e = data.neighbors?.e ?? false;
        const s = data.neighbors?.s ?? false;
        const w = data.neighbors?.w ?? false;
        const rTL = (!n && !w) ? r : 0;
        const rTR = (!n && !e) ? r : 0;
        const rBR = (!s && !e) ? r : 0;
        const rBL = (!s && !w) ? r : 0;
        let d = `M${x + rTL} ${y}`;
        d += `H${x + 1 - rTR}`;
        if (rTR) d += `A${rTR} ${rTR} 0 0 1 ${x + 1} ${y + rTR}`; else d += `L${x + 1} ${y}`;
        d += `V${y + 1 - rBR}`;
        if (rBR) d += `A${rBR} ${rBR} 0 0 1 ${x + 1 - rBR} ${y + 1}`; else d += `L${x + 1} ${y + 1}`;
        d += `H${x + rBL}`;
        if (rBL) d += `A${rBL} ${rBL} 0 0 1 ${x} ${y + 1 - rBL}`; else d += `L${x} ${y + 1}`;
        d += `V${y + rTL}`;
        if (rTL) d += `A${rTL} ${rTL} 0 0 1 ${x + rTL} ${y}`; else d += `L${x} ${y}`;
        d += `Z`;

        builder.AddPathInSegment(data.segmentName, d, data.color);
    }
}

class SquircleFinderBorderSegmentCreateStrategy implements ISegmentCreateStrategy{
    private buildRoundedRectPath(x:number, y:number, w:number, h:number, r:number): string {
        const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2));
        let d = `M${x + radius} ${y}`;
        d += `H${x + w - radius}`;
        if (radius) d += `A${radius} ${radius} 0 0 1 ${x + w} ${y + radius}`; else d += `L${x + w} ${y}`;
        d += `V${y + h - radius}`;
        if (radius) d += `A${radius} ${radius} 0 0 1 ${x + w - radius} ${y + h}`; else d += `L${x + w} ${y + h}`;
        d += `H${x + radius}`;
        if (radius) d += `A${radius} ${radius} 0 0 1 ${x} ${y + h - radius}`; else d += `L${x} ${y + h}`;
        d += `V${y + radius}`;
        if (radius) d += `A${radius} ${radius} 0 0 1 ${x + radius} ${y}`; else d += `L${x} ${y}`;
        d += `Z`;
        return d;
    }

    CreateSegmentStrategy(builder: SVGBuildHelper, data: SegmentData): void {
        const size = data.size;
        const anchors = [
            {x0: 0, y0: 0},
            {x0: size - 7, y0: 0},
            {x0: 0, y0: size - 7}
        ];
        const isAnchorTopLeft = anchors.some(a => a.x0 === data.point.X && a.y0 === data.point.Y);
        if (!isAnchorTopLeft) return;

        const outerW = 7;
        const outerH = 7;
        const ringThickness = 1; // 1 module ring thickness
        const outerRadius = 2; // rounded outer corners
        const innerRadius = Math.max(0, outerRadius - ringThickness);

        for (const {x0, y0} of anchors) {
            const x = x0 + data.margin;
            const y = y0 + data.margin;

            const outerPath = this.buildRoundedRectPath(x, y, outerW, outerH, outerRadius);
            const innerPath = this.buildRoundedRectPath(x + ringThickness, y + ringThickness, outerW - 2 * ringThickness, outerH - 2 * ringThickness, innerRadius);
            const d = `${outerPath}${innerPath}`;
            builder.AddPathInSegment(data.segmentName, d, data.color, 'evenodd', 'evenodd');
        }
    }
}

class CornerflowFinderInsideSegmentCreateStrategy implements ISegmentCreateStrategy
{
    private buildSelectiveRoundedRectPath(x:number, y:number, w:number, h:number, rTL:number, rTR:number, rBR:number, rBL:number): string {
        const clamp = (r:number) => Math.max(0, Math.min(r, Math.min(w, h) / 2));
        const tl = clamp(rTL), tr = clamp(rTR), br = clamp(rBR), bl = clamp(rBL);
        let d = `M${x + tl} ${y}`;
        d += `H${x + w - tr}`;
        if (tr) d += `A${tr} ${tr} 0 0 1 ${x + w} ${y + tr}`; else d += `L${x + w} ${y}`;
        d += `V${y + h - br}`;
        if (br) d += `A${br} ${br} 0 0 1 ${x + w - br} ${y + h}`; else d += `L${x + w} ${y + h}`;
        d += `H${x + bl}`;
        if (bl) d += `A${bl} ${bl} 0 0 1 ${x} ${y + h - bl}`; else d += `L${x} ${y + h}`;
        d += `V${y + tl}`;
        if (tl) d += `A${tl} ${tl} 0 0 1 ${x + tl} ${y}`; else d += `L${x} ${y}`;
        d += `Z`;
        return d;
    }

    CreateSegmentStrategy(builder: SVGBuildHelper, data: SegmentData): void {
        const size = data.size;
        const anchors = [
            {x0: 0, y0: 0},
            {x0: size - 7, y0: 0},
            {x0: 0, y0: size - 7}
        ];
        // Draw once per finder: trigger only when current module is the inner 3x3's top-left cell (offset +2,+2)
        const isInnerTopLeft = anchors.some(a => (a.x0 + 2) === data.point.X && (a.y0 + 2) === data.point.Y);
        if (!isInnerTopLeft) return;

        const innerW = 3;
        const innerH = 3;
        const r = 1.5; // strong curve like sample

        // Compute anchor for this inner top-left
        const anchor = anchors.find(a => (a.x0 + 2) === data.point.X && (a.y0 + 2) === data.point.Y)!;
        const x = anchor.x0 + 2 + data.margin; // 3x3 center starts at offset 2 within 7x7
        const y = anchor.y0 + 2 + data.margin;
        // Round only TL and BR corners to match provided SVG look
        const d = this.buildSelectiveRoundedRectPath(x, y, innerW, innerH, r, 0, r, 0);
        builder.AddPathInSegment(data.segmentName, d, data.color);
    }
}

class SquircleFinderInsideSegmentCreateStrategy implements ISegmentCreateStrategy
{
    private buildRoundedRectPath(x:number, y:number, w:number, h:number, r:number): string {
        const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2));
        let d = `M${x + radius} ${y}`;
        d += `H${x + w - radius}`;
        if (radius) d += `A${radius} ${radius} 0 0 1 ${x + w} ${y + radius}`; else d += `L${x + w} ${y}`;
        d += `V${y + h - radius}`;
        if (radius) d += `A${radius} ${radius} 0 0 1 ${x + w - radius} ${y + h}`; else d += `L${x + w} ${y + h}`;
        d += `H${x + radius}`;
        if (radius) d += `A${radius} ${radius} 0 0 1 ${x} ${y + h - radius}`; else d += `L${x} ${y + h}`;
        d += `V${y + radius}`;
        if (radius) d += `A${radius} ${radius} 0 0 1 ${x + radius} ${y}`; else d += `L${x} ${y}`;
        d += `Z`;
        return d;
    }

    CreateSegmentStrategy(builder: SVGBuildHelper, data: SegmentData): void {
        const size = data.size;
        const anchors = [
            {x0: 0, y0: 0},
            {x0: size - 7, y0: 0},
            {x0: 0, y0: size - 7}
        ];
        // Trigger once at the inner 3x3 top-left cell within each 7x7 finder
        const isInnerTopLeft = anchors.some(a => (a.x0 + 2) === data.point.X && (a.y0 + 2) === data.point.Y);
        if (!isInnerTopLeft) return;

        const innerW = 3;
        const innerH = 3;
        const innerRadius = 1; // round the inner fill to match squircle look

        const anchor = anchors.find(a => (a.x0 + 2) === data.point.X && (a.y0 + 2) === data.point.Y)!;
        const x = anchor.x0 + 2 + data.margin;
        const y = anchor.y0 + 2 + data.margin;

        const d = this.buildRoundedRectPath(x, y, innerW, innerH, innerRadius);
        builder.AddPathInSegment(data.segmentName, d, data.color);
    }
}

class CornerflowBorderFinderSegmentCreateStrategy implements ISegmentCreateStrategy
{
    private buildSelectiveRoundedRectPath(x:number, y:number, w:number, h:number, rTL:number, rTR:number, rBR:number, rBL:number): string {
        const clamp = (r:number) => Math.max(0, Math.min(r, Math.min(w, h) / 2));
        const tl = clamp(rTL), tr = clamp(rTR), br = clamp(rBR), bl = clamp(rBL);
        let d = `M${x + tl} ${y}`;
        d += `H${x + w - tr}`;
        if (tr) d += `A${tr} ${tr} 0 0 1 ${x + w} ${y + tr}`; else d += `L${x + w} ${y}`;
        d += `V${y + h - br}`;
        if (br) d += `A${br} ${br} 0 0 1 ${x + w - br} ${y + h}`; else d += `L${x + w} ${y + h}`;
        d += `H${x + bl}`;
        if (bl) d += `A${bl} ${bl} 0 0 1 ${x} ${y + h - bl}`; else d += `L${x} ${y + h}`;
        d += `V${y + tl}`;
        if (tl) d += `A${tl} ${tl} 0 0 1 ${x + tl} ${y}`; else d += `L${x} ${y}`;
        d += `Z`;
        return d;
    }

    CreateSegmentStrategy(builder: SVGBuildHelper, data: SegmentData): void {
        const size = data.size;
        const anchors = [
            {x0: 0, y0: 0},
            {x0: size - 7, y0: 0},
            {x0: 0, y0: size - 7}
        ];
        const isAnchorTopLeft = anchors.some(a => a.x0 === data.point.X && a.y0 === data.point.Y);
        if (!isAnchorTopLeft) return;

        const outerW = 7;
        const outerH = 7;
        const ringThickness = 1.1; // thicker border per reference
        const outerRadiusTL = 1; // rounded at TL
        const outerRadiusTR = 0; // square
        const outerRadiusBR = 1; // rounded at BR
        const outerRadiusBL = 0; // square

        for (const {x0, y0} of anchors) {
            const x = x0 + data.margin;
            const y = y0 + data.margin;

            const outerPath = this.buildSelectiveRoundedRectPath(
                x, y, outerW, outerH,
                outerRadiusTL, outerRadiusTR, outerRadiusBR, outerRadiusBL
            );
            const innerPath = this.buildSelectiveRoundedRectPath(
                x + ringThickness,
                y + ringThickness,
                outerW - 2 * ringThickness,
                outerH - 2 * ringThickness,
                0, 0, 0, 0 // inner hole sharp
            );
            const d = `${outerPath}${innerPath}`;
            builder.AddPathInSegment(data.segmentName, d, data.color, 'evenodd', 'evenodd');
        }
    }
}