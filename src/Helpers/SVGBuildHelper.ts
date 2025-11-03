import {SVGPath, ViewBoxSize} from "../Types/QRTypes";

export default class SVGBuildHelper {
    private mainSVG: string = '';
    private mainPathColor: string = '';
    private solidSegments: Map<string, string> = new Map();
    private pathSegments: Map<string, SVGPath> = new Map();

    public SetViewPortSize(size: ViewBoxSize, rendering: string = "crispEdges"): SVGBuildHelper {
        this.mainSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${size.minX} ${size.minY} ${size.width} ${size.height}" shape-rendering="${rendering}">`;
        return this;
    }
    
    public SetBackground(color: string): SVGBuildHelper {
        this.mainSVG += `<rect width="100%" height="100%" fill="${color}"/>`;
        return this;
    }

    public SetMainPathColor(color: string): SVGBuildHelper {
        this.mainPathColor = color;
        return this;
    }

    public RegisterSolidSegments(segmentName: string): SVGBuildHelper {
        if (!this.solidSegments.has(segmentName)) {
            this.solidSegments.set(segmentName, '');
        }
        return this;
    }

    public RegisterPathSegments(segmentName: string): SVGBuildHelper {
        if (!this.pathSegments.has(segmentName)) {
            this.pathSegments.set(segmentName, { data: "", color: "" });
        }
        return this;
    }

    public AddCircleInSegment(segmentName: string, x: number, y: number, radius: number, color: string = ''): SVGBuildHelper {
        if (color === '') color = this.mainPathColor;
        if (this.solidSegments.has(segmentName)) {
            let segment: string = this.solidSegments.get(segmentName) ?? '';
            segment += `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}"/>`;
            this.solidSegments.set(segmentName, segment);
        }
        return this;
    }

    public AddPathInSegment(segmentName: string, newSegment: string, color: string = '', fillRule?: 'nonzero' | 'evenodd', clipRule?: 'nonzero' | 'evenodd'): SVGBuildHelper {
        if (color === '') color = this.mainPathColor;
        if (!this.pathSegments.has(segmentName)) {
            this.pathSegments.set(segmentName, { data: "", color: "" });
        }
        const segment = this.pathSegments.get(segmentName)!;
        segment.data += newSegment;
        segment.color = color;
        if (fillRule) segment.fillRule = fillRule;
        if (clipRule) segment.clipRule = clipRule;
        return this;
    }

    public AddRectInSegment(segmentName: string, x: number, y: number, size: number, color: string = ''): SVGBuildHelper {
        if (color === '') color = this.mainPathColor;
        if (this.solidSegments.has(segmentName)) {
            let segment: string = this.solidSegments.get(segmentName) ?? '';
            segment += `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${color}"/>`;
            this.solidSegments.set(segmentName, segment);
        }
        return this;
    }

    public AddRingInSegment(segmentName: string, cx: number, cy: number, radius: number, strokeWidth: number = 1, color: string = ''): SVGBuildHelper {
        if (color === '') color = this.mainPathColor;
        if (this.solidSegments.has(segmentName)) {
            let segment: string = this.solidSegments.get(segmentName) ?? '';
            segment += `<circle cx="${cx}" cy="${cy}" r="${radius}" stroke="${color}" stroke-width="${strokeWidth}" fill="none"/>`;
            this.solidSegments.set(segmentName, segment);
        }
        return this;
    }

    public AddPolygonInSegment(segmentName: string, points: string, color: string = ''): SVGBuildHelper {
        if (color === '') color = this.mainPathColor;
        if (this.solidSegments.has(segmentName)) {
            let segment: string = this.solidSegments.get(segmentName) ?? '';
            segment += `<polygon points="${points}" fill="${color}"/>`;
            this.solidSegments.set(segmentName, segment);
        }
        return this;
    }

    public BuildSVG(): string {
        this.solidSegments.forEach((value) => {
            if (value !== '') this.mainSVG += value;
        });
        this.pathSegments.forEach((value) => {
            if (value.data !== '') {
                const fillRuleAttr = value.fillRule ? ` fill-rule="${value.fillRule}"` : '';
                const clipRuleAttr = value.clipRule ? ` clip-rule="${value.clipRule}"` : '';
                this.mainSVG += `<path d="${value.data}" fill="${value.color}"${fillRuleAttr}${clipRuleAttr}/>`;
            }
        });
        this.mainSVG += `</svg>`;
        return this.mainSVG;
    }
}