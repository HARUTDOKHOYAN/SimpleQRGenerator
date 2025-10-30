import {qrcodegen} from './qrcore'
import {GetQRSegmentByCoordinates} from "./Helpers/QRMatrixHelper";
import {QRSegment, SegmentStrategyType} from "./Types/QREnums";
import {QrSvgOptions, SegmentData} from "./Types/QRTypes";
import SVGBuildHelper from "./Helpers/SVGBuildHelper";
import {SegmentCreatorFactory} from "./SegmentCreater/ISegmentCreate";
import Ecc = qrcodegen.QrCode.Ecc;


export function generateQRSvg(text: string, options: QrSvgOptions = {}): string {
  options.margin = options.margin ?? 4
  options.foregroundColor = options.foregroundColor ?? '#000000';
  options.backgroundColor = options.backgroundColor ?? '#fff';
  options.moduleScale = options.moduleScale ?? 1;
  options.FinderBorderSegments = options.FinderBorderSegments ?? SegmentStrategyType.Square;
  options.FinderInsideSegments = options.FinderInsideSegments ?? SegmentStrategyType.Square;
  options.DataSegments = options.DataSegments ?? SegmentStrategyType.Square;
  const qr = qrcodegen.QrCode.encodeText(text, Ecc.MEDIUM);
  return qrToSvg(qr, options);
}

export function qrToSvg(qr: qrcodegen.QrCode, options: QrSvgOptions = {}): string {

  if (options.margin == undefined ||
      options.moduleScale == undefined ||
      options.FinderBorderSegments == undefined ||
      options.FinderInsideSegments == undefined ||
      options.DataSegments == undefined||
      options.backgroundColor == undefined ||
      options.foregroundColor == undefined)
    return "";
  const size = qr.size;
  const vb = size + options.margin * 2;
  const r = 0.5 * options.moduleScale;

  const svgBuilder:SVGBuildHelper = new SVGBuildHelper()
  const factory:SegmentCreatorFactory = new SegmentCreatorFactory();
  svgBuilder
      .SetViewPortSize({minX:0,minY:0,width: vb, height:vb})
      .SetBackground(options.backgroundColor)
      .SetMainPathColor(options.foregroundColor)
      .RegisterSolidSegments("QRSegment.SingleSquare")
      .RegisterSolidSegments("QRSegment.FinderBorder")
      .RegisterSolidSegments("QRSegment.Data")
  const segmentDat:SegmentData =
      {
        segmentName:'',
        point:{X:0,Y:0 },
        margin:options.margin,
        radius:r,
        color:options.foregroundColor,
        size:size,
      }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      segmentDat.point = {X:x, Y:y};
      if (!qr.getModule(x, y)) continue;

      const currentSegment = GetQRSegmentByCoordinates({X:x, Y:y}, size);

      const isSameSeg = (nx:number, ny:number): boolean => {
        if (nx < 0 || ny < 0 || nx >= size || ny >= size) return false;
        if (!qr.getModule(nx, ny)) return false;
        return GetQRSegmentByCoordinates({X:nx, Y:ny}, size) === currentSegment;
      };

      segmentDat.neighbors = {
        n: isSameSeg(x, y-1),
        e: isSameSeg(x+1, y),
        s: isSameSeg(x, y+1),
        w: isSameSeg(x-1, y)
      };

      if (currentSegment === QRSegment.FinderInside) {
        segmentDat.segmentName = "QRSegment.SingleSquare"
        factory.GetStrategy(options?.FinderInsideSegments)
              ?.CreateSegmentStrategy(svgBuilder , segmentDat);
        continue;
      }

      if (currentSegment === QRSegment.FinderBorder) {
        segmentDat.segmentName = "QRSegment.FinderBorder"
        factory.GetStrategy(options?.FinderBorderSegments)
            ?.CreateSegmentStrategy(svgBuilder , segmentDat);
        continue;
      }

      if (currentSegment === QRSegment.Data) {
        segmentDat.segmentName = "QRSegment.Data"
        factory.GetStrategy(options?.DataSegments)
            ?.CreateSegmentStrategy(svgBuilder , segmentDat);
      }
    }
  }

  return svgBuilder.BuildSVG();
}