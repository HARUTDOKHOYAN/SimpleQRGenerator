import {qrcodegen} from './qrcore'
import {GetQRSegmentByCoordinates} from "./Helpers/QRMatrixHelper";
import {QRSegment, SegmentStrategyType} from "./Types/QREnums";
import {QrSvgOptions, SegmentData} from "./Types/QRTypes";
import SVGBuildHelper from "./Helpers/SVGBuildHelper";
import {SegmentCreatorFactory} from "./SegmentCreater/ISegmentCreate";
import Ecc = qrcodegen.QrCode.Ecc;


export function generateQRSvg(text: string, options: QrSvgOptions = {}): string {
  const qr = qrcodegen.QrCode.encodeText(text, Ecc.MEDIUM);
  return qrToSvg(qr, options);
}

export function qrToSvg(qr: qrcodegen.QrCode, options: QrSvgOptions = {}): string {
  const margin = options.margin ?? 4;
  const dark = options.darkColor ?? '#000000';
  const light = options.lightColor ?? '#fff';

  const size = qr.size;
  const vb = size + margin * 2;

  const moduleScale = options.moduleScale ?? 1;
  const r = 0.5 * moduleScale;

  const svgBuilder:SVGBuildHelper = new SVGBuildHelper()
  const factory:SegmentCreatorFactory = new SegmentCreatorFactory();
  const strategyType = options.segmentStrategy === 'square'
      ? SegmentStrategyType.Square
      : SegmentStrategyType.Circular;
  svgBuilder
      .SetViewPortSize({minX:0,minY:0,width: vb, height:vb})
      .SetBackground(light)
      .SetMainPathColor(dark)
      .RegisterSoldSegments("QRSegment.FinderInside")
      .RegisterSoldSegments("QRSegment.FinderBorder")
      .RegisterSoldSegments("QRSegment.Data")
  const segmentDat:SegmentData =
      {
        segmentName:'',
        point:{X:0,Y:0 },
        margin:margin,
        radius:r,
        color:dark,
        size:size,
        finderBorderRingStrokeWidth: options.finderBorder?.ringStrokeWidth
      }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      segmentDat.point = {X:x, Y:y};
      if (!qr.getModule(x, y)) continue;

      if (GetQRSegmentByCoordinates({X :x, Y:y}, size) === QRSegment.FinderInside) {
        segmentDat.segmentName = "QRSegment.FinderInside"
        factory.GetStrategy(SegmentStrategyType.FinderInside)
              ?.CreateSegmentStrategy(svgBuilder , segmentDat);
        continue;
      }

      if (GetQRSegmentByCoordinates({X :x, Y:y}, size) === QRSegment.FinderBorder) {
        segmentDat.segmentName = "QRSegment.FinderBorder"

        factory.GetStrategy(SegmentStrategyType.Square)
            ?.CreateSegmentStrategy(svgBuilder , segmentDat);
        continue;
      }

      if (GetQRSegmentByCoordinates({X :x, Y:y}, size) === QRSegment.Data) {
        segmentDat.segmentName = "QRSegment.Data"
        factory.GetStrategy(strategyType)
            ?.CreateSegmentStrategy(svgBuilder , segmentDat);
      }
    }
  }

  return svgBuilder.BuildSVG();
}