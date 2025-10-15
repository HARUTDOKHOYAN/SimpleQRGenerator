import {SVGPath, ViewBoxSize} from "../Types/QRTypes";

export default class SVGBuildHelper {
    private  _mainSVG:string = '';
    private _mainPathColor:string = '';
    private _solidSegments:Map<string, string> = new Map<string, string>();
    private _pathSegments:Map<string, SVGPath> = new Map<string, SVGPath>();

    public SetViewPortSize(size:ViewBoxSize , rendering:string = "crispEdges" ):SVGBuildHelper {
        this._mainSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${size.minX} ${size.minY} ${size.width} ${size.height}" shape-rendering="${rendering}">`
        return this;
    }
    public SetBackground(color :string): SVGBuildHelper {
        this._mainSVG += `<rect width="100%" height="100%" fill="${color}"/>`
        return this;
    }

    public SetMainPathColor(color :string): SVGBuildHelper {
        this._mainPathColor = color;
        return this;
    }

    public RegisterSoldSegments(segmentName:string) : SVGBuildHelper {
        if(!this._solidSegments.has(segmentName))
             this._solidSegments.set(segmentName , '');
        return this;
    }
    public RegisterPathSegments(segmentName:string) : SVGBuildHelper {
        if(!this._pathSegments.has(segmentName))
            this._pathSegments.set(segmentName , {data:"" , color:""});
        return this;
    }
    public AddCircleInSegment(segmentName:string, x:number , y:number , radius:number , color:string='') : SVGBuildHelper {
        if(color === '')
            color = this._mainPathColor;
        if(this._solidSegments.has(segmentName)) {
            let segment: string = this._solidSegments.get(segmentName) ?? '';
            segment +=  `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}"/>`;
            this._solidSegments.delete(segmentName);
            this._solidSegments.set(segmentName , segment)
        }
        return this;
    }

    public AddPathInSegment(segmentName:string , newSegment:string ,color :string ='') : SVGBuildHelper {
        if(color === '')
            color = this._mainPathColor;
        if(this._pathSegments.has(segmentName)){
            let segment: SVGPath = this._pathSegments.get(segmentName)?? {data:"" , color: ""};
            segment.data+=newSegment;
            segment.color = color;
        }
        return this;
    }

    public BuildSVG() : string {
        this._solidSegments.forEach((value) => {
            this._mainSVG += value;
        });
        this._pathSegments.forEach((value) => {
            this._mainSVG += `<path d="${value.data}" fill="${value.color}"/>`;
        });
        this._mainSVG += `</svg>`;
        return this._mainSVG;
    }
}