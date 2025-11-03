import {qrcodegen} from './qrcore'
import {GetQRSegmentByCoordinates} from "./Helpers/QRMatrixHelper";
import {QRSegment, SegmentStrategyType} from "./Types/QREnums";
import {QrSvgOptions, SegmentData} from "./Types/QRTypes";
import SVGBuildHelper from "./Helpers/SVGBuildHelper";
import {SegmentCreatorFactory} from "./SegmentCreator/ISegmentCreate";
import {
   QRContentType,
   WiFiConfig,
   PhoneConfig,
   SMSConfig,
   EmailConfig,
   URLConfig,
   TextConfig
} from "./Types/QRContentTypes";
import {formatQRContent} from "./Helpers/QRContentFormatter";
import Ecc = qrcodegen.QrCode.Ecc;

type QRConfig = WiFiConfig | PhoneConfig | SMSConfig | EmailConfig | URLConfig | TextConfig;

export class QRBuilder {
  private options: QrSvgOptions | undefined;
  private config: QRConfig | undefined;
  private type: QRContentType | undefined;

  public setQRType(type: QRContentType): QRBuilder {
    this.type = type;
    return this;
  }

  public setQrOptions(options: QrSvgOptions): QRBuilder {
    this.options = options;
    return this;
  }

  public setQRConfig(config: QRConfig): QRBuilder {
    this.config = config;
    return this;
  }

  public buildQRSVG(): string {
    if (this.type === undefined || this.options === undefined || this.config === undefined) {
      throw new Error("QRBuilder requires type, options, and config to be set before building");
    }

    const formattedContent = formatQRContent(this.type, this.config);
    this.setDefaultValues(this.options ?? {});
    const qr = qrcodegen.QrCode.encodeText(formattedContent, this.options.ErrorCorrection ?? Ecc.LOW);
    return this.generateQRSVG(qr, this.options);
  }

  private setDefaultValues(options: QrSvgOptions): void {
    options.margin = options.margin ?? 4;
    options.foregroundColor = options.foregroundColor ?? '#000000';
    options.backgroundColor = options.backgroundColor ?? '#fff';
    options.moduleScale = options.moduleScale ?? 1;
    options.FinderBorderSegments = options.FinderBorderSegments ?? SegmentStrategyType.Square;
    options.FinderInsideSegments = options.FinderInsideSegments ?? SegmentStrategyType.Square;
    options.DataSegments = options.DataSegments ?? SegmentStrategyType.Square;
  }

  private generateQRSVG(qr: qrcodegen.QrCode, options: QrSvgOptions = {}): string {
    if (options.margin === undefined ||
        options.moduleScale === undefined ||
        options.FinderBorderSegments === undefined ||
        options.FinderInsideSegments === undefined ||
        options.DataSegments === undefined ||
        options.backgroundColor === undefined ||
        options.foregroundColor === undefined) {
      return "";
    }

    const size = qr.size;
    const viewBoxSize = size + options.margin * 2;
    const moduleRadius = 0.5 * options.moduleScale;

    const svgBuilder = new SVGBuildHelper();
    const factory = new SegmentCreatorFactory();
    
    svgBuilder
      .SetViewPortSize({ minX: 0, minY: 0, width: viewBoxSize, height: viewBoxSize })
      .SetBackground(options.backgroundColor)
      .SetMainPathColor(options.foregroundColor)
      .RegisterSolidSegments("QRSegment.SingleSquare")
      .RegisterSolidSegments("QRSegment.FinderBorder")
      .RegisterSolidSegments("QRSegment.Data");

    const segmentData: SegmentData = {
      segmentName: '',
      point: { X: 0, Y: 0 },
      margin: options.margin,
      radius: moduleRadius,
      color: options.foregroundColor,
      size: size,
    };

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        segmentData.point = { X: x, Y: y };
        if (!qr.getModule(x, y)) continue;

        const currentSegment = GetQRSegmentByCoordinates({ X: x, Y: y }, size);

        const isSameSegment = (nx: number, ny: number): boolean => {
          if (nx < 0 || ny < 0 || nx >= size || ny >= size) return false;
          if (!qr.getModule(nx, ny)) return false;
          return GetQRSegmentByCoordinates({ X: nx, Y: ny }, size) === currentSegment;
        };

        segmentData.neighbors = {
          n: isSameSegment(x, y - 1),
          e: isSameSegment(x + 1, y),
          s: isSameSegment(x, y + 1),
          w: isSameSegment(x - 1, y)
        };

        if (currentSegment === QRSegment.FinderInside) {
          segmentData.segmentName = "QRSegment.SingleSquare";
          factory.GetStrategy(options?.FinderInsideSegments)
            ?.createSegmentStrategy(svgBuilder, segmentData);
          continue;
        }

        if (currentSegment === QRSegment.FinderBorder) {
          segmentData.segmentName = "QRSegment.FinderBorder";
          factory.GetStrategy(options?.FinderBorderSegments)
            ?.createSegmentStrategy(svgBuilder, segmentData);
          continue;
        }

        if (currentSegment === QRSegment.Data) {
          segmentData.segmentName = "QRSegment.Data";
          factory.GetStrategy(options?.DataSegments)
            ?.createSegmentStrategy(svgBuilder, segmentData);
        }
      }
    }

    return svgBuilder.BuildSVG();
  }
}
