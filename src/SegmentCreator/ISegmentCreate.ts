import SVGBuildHelper from "../Helpers/SVGBuildHelper";
import {SegmentStrategyType} from "../Types/QREnums";
import {SegmentData} from "../Types/QRTypes";

const FINDER_SIZE = 7;
const FINDER_CENTER_OFFSET = 3;
const FINDER_INNER_SIZE = 3;
const FINDER_INNER_OFFSET = 2;

export interface ISegmentCreateStrategy {
    createSegmentStrategy(builder: SVGBuildHelper, data: SegmentData): void;
}

export class SegmentCreatorFactory {
    private strategies: Map<SegmentStrategyType, ISegmentCreateStrategy> = new Map();

    constructor() {
        this.strategies.set(SegmentStrategyType.Circular, new CircularSegmentCreateStrategy());
        this.strategies.set(SegmentStrategyType.Square, new SquareSegmentCreateStrategy());
        this.strategies.set(SegmentStrategyType.CircularInside, new FinderInsideBigCircleSegmentCreateStrategy());
        this.strategies.set(SegmentStrategyType.BagelBorder, new FinderBorderBagelSegmentCreateStrategy());
        this.strategies.set(SegmentStrategyType.Triangle, new TriangleSegmentCreateStrategy());
        this.strategies.set(SegmentStrategyType.RoundedSquare, new RoundedSquareSegmentCreateStrategy());
        this.strategies.set(SegmentStrategyType.SquircleBorder, new SquircleFinderBorderSegmentCreateStrategy());
        this.strategies.set(SegmentStrategyType.Diamond, new DiamondSegmentCreateStrategy());
        this.strategies.set(SegmentStrategyType.CornerflowInside, new CornerflowFinderInsideSegmentCreateStrategy());
        this.strategies.set(SegmentStrategyType.CornerflowBorder, new CornerflowBorderFinderSegmentCreateStrategy());
        this.strategies.set(SegmentStrategyType.SquircleInside, new SquircleFinderInsideSegmentCreateStrategy());
    }

    public GetStrategy(type: SegmentStrategyType): ISegmentCreateStrategy | null {
        return this.strategies.get(type) ?? null;
    }
}

class CircularSegmentCreateStrategy implements ISegmentCreateStrategy {
    createSegmentStrategy(builder: SVGBuildHelper, data: SegmentData): void {
        const cx = data.point.X + data.margin + 0.5;
        const cy = data.point.Y + data.margin + 0.5;
        builder.AddCircleInSegment(`${data.segmentName}`, cx, cy, data.radius, data.color);
    }
}

class SquareSegmentCreateStrategy implements ISegmentCreateStrategy {
    createSegmentStrategy(builder: SVGBuildHelper, data: SegmentData): void {
        const x = data.point.X + data.margin;
        const y = data.point.Y + data.margin;
        builder.AddRectInSegment(data.segmentName, x, y, 1, data.color);
    }
}

class FinderInsideBigCircleSegmentCreateStrategy implements ISegmentCreateStrategy {
    createSegmentStrategy(builder: SVGBuildHelper, data: SegmentData): void {
        const size = data.size;
        const finderRadius = 1.5;
        const anchors = [
            { x0: 0, y0: 0 },
            { x0: size - FINDER_SIZE, y0: 0 },
            { x0: 0, y0: size - FINDER_SIZE }
        ];

        for (const { x0, y0 } of anchors) {
            const cx = x0 + FINDER_CENTER_OFFSET + data.margin + 0.5;
            const cy = y0 + FINDER_CENTER_OFFSET + data.margin + 0.5;
            builder.AddCircleInSegment(data.segmentName, cx, cy, finderRadius, data.color);
        }
    }
}

class FinderBorderBagelSegmentCreateStrategy implements ISegmentCreateStrategy {
    createSegmentStrategy(builder: SVGBuildHelper, data: SegmentData): void {
        const size = data.size;
        const ringRadius = 3;
        const defaultStrokeWidth = 1;
        const anchors = [
            { x0: 0, y0: 0 },
            { x0: size - FINDER_SIZE, y0: 0 },
            { x0: 0, y0: size - FINDER_SIZE }
        ];

        const isAnchorTopLeft = anchors.some(a => a.x0 === data.point.X && a.y0 === data.point.Y);
        if (!isAnchorTopLeft) return;

        const centerOffset = FINDER_CENTER_OFFSET + data.margin + 0.5;
        const strokeWidth = data.finderBorderRingStrokeWidth ?? defaultStrokeWidth;

        for (const { x0, y0 } of anchors) {
            const cx = x0 + centerOffset;
            const cy = y0 + centerOffset;
            builder.AddRingInSegment(data.segmentName, cx, cy, ringRadius, strokeWidth, data.color);
        }
    }
}

class TriangleSegmentCreateStrategy implements ISegmentCreateStrategy {
    createSegmentStrategy(builder: SVGBuildHelper, data: SegmentData): void {
        const x = data.point.X + data.margin;
        const y = data.point.Y + data.margin;
        const moduleSize = 1;
        const halfSize = moduleSize / 2;
        
        const p1 = `${x + halfSize},${y}`;
        const p2 = `${x},${y + moduleSize}`;
        const p3 = `${x + moduleSize},${y + moduleSize}`;
        const points = `${p1} ${p2} ${p3}`;
        
        builder.AddPolygonInSegment(data.segmentName, points, data.color);
    }
}

class DiamondSegmentCreateStrategy implements ISegmentCreateStrategy {
    createSegmentStrategy(builder: SVGBuildHelper, data: SegmentData): void {
        const x = data.point.X + data.margin;
        const y = data.point.Y + data.margin;
        const moduleSize = 1;
        const halfSize = moduleSize / 2;
        
        const pTop = `${x + halfSize},${y}`;
        const pRight = `${x + moduleSize},${y + halfSize}`;
        const pBottom = `${x + halfSize},${y + moduleSize}`;
        const pLeft = `${x},${y + halfSize}`;
        const points = `${pTop} ${pRight} ${pBottom} ${pLeft}`;
        
        builder.AddPolygonInSegment(data.segmentName, points, data.color);
    }
}

class RoundedSquareSegmentCreateStrategy implements ISegmentCreateStrategy {
    createSegmentStrategy(builder: SVGBuildHelper, data: SegmentData): void {
        const x = data.point.X + data.margin;
        const y = data.point.Y + data.margin;
        const cornerRadius = 0.5;
        const moduleSize = 1;
        
        const n = data.neighbors?.n ?? false;
        const e = data.neighbors?.e ?? false;
        const s = data.neighbors?.s ?? false;
        const w = data.neighbors?.w ?? false;
        
        const rTL = (!n && !w) ? cornerRadius : 0;
        const rTR = (!n && !e) ? cornerRadius : 0;
        const rBR = (!s && !e) ? cornerRadius : 0;
        const rBL = (!s && !w) ? cornerRadius : 0;
        
        let d = `M${x + rTL} ${y}`;
        d += `H${x + moduleSize - rTR}`;
        if (rTR) d += `A${rTR} ${rTR} 0 0 1 ${x + moduleSize} ${y + rTR}`;
        else d += `L${x + moduleSize} ${y}`;
        d += `V${y + moduleSize - rBR}`;
        if (rBR) d += `A${rBR} ${rBR} 0 0 1 ${x + moduleSize - rBR} ${y + moduleSize}`;
        else d += `L${x + moduleSize} ${y + moduleSize}`;
        d += `H${x + rBL}`;
        if (rBL) d += `A${rBL} ${rBL} 0 0 1 ${x} ${y + moduleSize - rBL}`;
        else d += `L${x} ${y + moduleSize}`;
        d += `V${y + rTL}`;
        if (rTL) d += `A${rTL} ${rTL} 0 0 1 ${x + rTL} ${y}`;
        else d += `L${x} ${y}`;
        d += `Z`;

        builder.AddPathInSegment(data.segmentName, d, data.color);
    }
}

class SquircleFinderBorderSegmentCreateStrategy implements ISegmentCreateStrategy {
    private buildRoundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
        const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2));
        let d = `M${x + radius} ${y}`;
        d += `H${x + w - radius}`;
        if (radius) d += `A${radius} ${radius} 0 0 1 ${x + w} ${y + radius}`;
        else d += `L${x + w} ${y}`;
        d += `V${y + h - radius}`;
        if (radius) d += `A${radius} ${radius} 0 0 1 ${x + w - radius} ${y + h}`;
        else d += `L${x + w} ${y + h}`;
        d += `H${x + radius}`;
        if (radius) d += `A${radius} ${radius} 0 0 1 ${x} ${y + h - radius}`;
        else d += `L${x} ${y + h}`;
        d += `V${y + radius}`;
        if (radius) d += `A${radius} ${radius} 0 0 1 ${x + radius} ${y}`;
        else d += `L${x} ${y}`;
        d += `Z`;
        return d;
    }

    createSegmentStrategy(builder: SVGBuildHelper, data: SegmentData): void {
        const size = data.size;
        const ringThickness = 1;
        const outerRadius = 2;
        const anchors = [
            { x0: 0, y0: 0 },
            { x0: size - FINDER_SIZE, y0: 0 },
            { x0: 0, y0: size - FINDER_SIZE }
        ];
        
        const isAnchorTopLeft = anchors.some(a => a.x0 === data.point.X && a.y0 === data.point.Y);
        if (!isAnchorTopLeft) return;

        const innerRadius = Math.max(0, outerRadius - ringThickness);

        for (const { x0, y0 } of anchors) {
            const x = x0 + data.margin;
            const y = y0 + data.margin;

            const outerPath = this.buildRoundedRectPath(x, y, FINDER_SIZE, FINDER_SIZE, outerRadius);
            const innerPath = this.buildRoundedRectPath(
                x + ringThickness, 
                y + ringThickness, 
                FINDER_SIZE - 2 * ringThickness, 
                FINDER_SIZE - 2 * ringThickness, 
                innerRadius
            );
            const d = `${outerPath}${innerPath}`;
            builder.AddPathInSegment(data.segmentName, d, data.color, 'evenodd', 'evenodd');
        }
    }
}

class CornerflowFinderInsideSegmentCreateStrategy implements ISegmentCreateStrategy {
    private buildSelectiveRoundedRectPath(
        x: number, y: number, w: number, h: number, 
        rTL: number, rTR: number, rBR: number, rBL: number
    ): string {
        const clamp = (r: number) => Math.max(0, Math.min(r, Math.min(w, h) / 2));
        const tl = clamp(rTL), tr = clamp(rTR), br = clamp(rBR), bl = clamp(rBL);
        
        let d = `M${x + tl} ${y}`;
        d += `H${x + w - tr}`;
        if (tr) d += `A${tr} ${tr} 0 0 1 ${x + w} ${y + tr}`;
        else d += `L${x + w} ${y}`;
        d += `V${y + h - br}`;
        if (br) d += `A${br} ${br} 0 0 1 ${x + w - br} ${y + h}`;
        else d += `L${x + w} ${y + h}`;
        d += `H${x + bl}`;
        if (bl) d += `A${bl} ${bl} 0 0 1 ${x} ${y + h - bl}`;
        else d += `L${x} ${y + h}`;
        d += `V${y + tl}`;
        if (tl) d += `A${tl} ${tl} 0 0 1 ${x + tl} ${y}`;
        else d += `L${x} ${y}`;
        d += `Z`;
        return d;
    }

    createSegmentStrategy(builder: SVGBuildHelper, data: SegmentData): void {
        const size = data.size;
        const cornerflowRadius = 1.5;
        const anchors = [
            { x0: 0, y0: 0 },
            { x0: size - FINDER_SIZE, y0: 0 },
            { x0: 0, y0: size - FINDER_SIZE }
        ];
        
        const isInnerTopLeft = anchors.some(a => (a.x0 + FINDER_INNER_OFFSET) === data.point.X && 
                                                   (a.y0 + FINDER_INNER_OFFSET) === data.point.Y);
        if (!isInnerTopLeft) return;

        const anchor = anchors.find(a => (a.x0 + FINDER_INNER_OFFSET) === data.point.X && 
                                          (a.y0 + FINDER_INNER_OFFSET) === data.point.Y)!;
        const x = anchor.x0 + FINDER_INNER_OFFSET + data.margin;
        const y = anchor.y0 + FINDER_INNER_OFFSET + data.margin;
        
        const d = this.buildSelectiveRoundedRectPath(x, y, FINDER_INNER_SIZE, FINDER_INNER_SIZE, 
                                                     cornerflowRadius, 0, cornerflowRadius, 0);
        builder.AddPathInSegment(data.segmentName, d, data.color);
    }
}

class SquircleFinderInsideSegmentCreateStrategy implements ISegmentCreateStrategy {
    private buildRoundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
        const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2));
        let d = `M${x + radius} ${y}`;
        d += `H${x + w - radius}`;
        if (radius) d += `A${radius} ${radius} 0 0 1 ${x + w} ${y + radius}`;
        else d += `L${x + w} ${y}`;
        d += `V${y + h - radius}`;
        if (radius) d += `A${radius} ${radius} 0 0 1 ${x + w - radius} ${y + h}`;
        else d += `L${x + w} ${y + h}`;
        d += `H${x + radius}`;
        if (radius) d += `A${radius} ${radius} 0 0 1 ${x} ${y + h - radius}`;
        else d += `L${x} ${y + h}`;
        d += `V${y + radius}`;
        if (radius) d += `A${radius} ${radius} 0 0 1 ${x + radius} ${y}`;
        else d += `L${x} ${y}`;
        d += `Z`;
        return d;
    }

    createSegmentStrategy(builder: SVGBuildHelper, data: SegmentData): void {
        const size = data.size;
        const innerRadius = 1;
        const anchors = [
            { x0: 0, y0: 0 },
            { x0: size - FINDER_SIZE, y0: 0 },
            { x0: 0, y0: size - FINDER_SIZE }
        ];
        
        const isInnerTopLeft = anchors.some(a => (a.x0 + FINDER_INNER_OFFSET) === data.point.X && 
                                                   (a.y0 + FINDER_INNER_OFFSET) === data.point.Y);
        if (!isInnerTopLeft) return;

        const anchor = anchors.find(a => (a.x0 + FINDER_INNER_OFFSET) === data.point.X && 
                                          (a.y0 + FINDER_INNER_OFFSET) === data.point.Y)!;
        const x = anchor.x0 + FINDER_INNER_OFFSET + data.margin;
        const y = anchor.y0 + FINDER_INNER_OFFSET + data.margin;

        const d = this.buildRoundedRectPath(x, y, FINDER_INNER_SIZE, FINDER_INNER_SIZE, innerRadius);
        builder.AddPathInSegment(data.segmentName, d, data.color);
    }
}

class CornerflowBorderFinderSegmentCreateStrategy implements ISegmentCreateStrategy {
    private buildSelectiveRoundedRectPath(
        x: number, y: number, w: number, h: number, 
        rTL: number, rTR: number, rBR: number, rBL: number
    ): string {
        const clamp = (r: number) => Math.max(0, Math.min(r, Math.min(w, h) / 2));
        const tl = clamp(rTL), tr = clamp(rTR), br = clamp(rBR), bl = clamp(rBL);
        
        let d = `M${x + tl} ${y}`;
        d += `H${x + w - tr}`;
        if (tr) d += `A${tr} ${tr} 0 0 1 ${x + w} ${y + tr}`;
        else d += `L${x + w} ${y}`;
        d += `V${y + h - br}`;
        if (br) d += `A${br} ${br} 0 0 1 ${x + w - br} ${y + h}`;
        else d += `L${x + w} ${y + h}`;
        d += `H${x + bl}`;
        if (bl) d += `A${bl} ${bl} 0 0 1 ${x} ${y + h - bl}`;
        else d += `L${x} ${y + h}`;
        d += `V${y + tl}`;
        if (tl) d += `A${tl} ${tl} 0 0 1 ${x + tl} ${y}`;
        else d += `L${x} ${y}`;
        d += `Z`;
        return d;
    }

    createSegmentStrategy(builder: SVGBuildHelper, data: SegmentData): void {
        const size = data.size;
        const ringThickness = 1.1;
        const outerRadiusTL = 1;
        const outerRadiusTR = 0;
        const outerRadiusBR = 1;
        const outerRadiusBL = 0;
        
        const anchors = [
            { x0: 0, y0: 0 },
            { x0: size - FINDER_SIZE, y0: 0 },
            { x0: 0, y0: size - FINDER_SIZE }
        ];
        
        const isAnchorTopLeft = anchors.some(a => a.x0 === data.point.X && a.y0 === data.point.Y);
        if (!isAnchorTopLeft) return;

        for (const { x0, y0 } of anchors) {
            const x = x0 + data.margin;
            const y = y0 + data.margin;

            const outerPath = this.buildSelectiveRoundedRectPath(
                x, y, FINDER_SIZE, FINDER_SIZE,
                outerRadiusTL, outerRadiusTR, outerRadiusBR, outerRadiusBL
            );
            const innerPath = this.buildSelectiveRoundedRectPath(
                x + ringThickness,
                y + ringThickness,
                FINDER_SIZE - 2 * ringThickness,
                FINDER_SIZE - 2 * ringThickness,
                0, 0, 0, 0
            );
            const d = `${outerPath}${innerPath}`;
            builder.AddPathInSegment(data.segmentName, d, data.color, 'evenodd', 'evenodd');
        }
    }
}