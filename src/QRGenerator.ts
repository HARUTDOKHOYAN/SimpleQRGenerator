import {qrcodegen} from './qrcore'
import {GetQRSegmentByCoordinates} from "./Helpers/QRMatrixHelper";
import {QRSegment} from "./Types/QREnums";
import {QrSvgOptions} from "./Types/QRTypes";
import SVGBuildHelper from "./Helpers/SVGBuildHelper";
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

  const svgBuilder = new SVGBuildHelper()
  svgBuilder
      .SetViewPortSize({minX:0,minY:0,width: vb, height:vb})
      .SetBackground(light)
      .SetMainPathColor(dark)
      .RegisterSoldSegments(`${QRSegment.FinderInside}`)
      .RegisterSoldSegments(`${QRSegment.FinderBorder}`)
      .RegisterPathSegments(`${QRSegment.Data}`)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!qr.getModule(x, y)) continue;

      if (GetQRSegmentByCoordinates({X :x, Y:y}, size) === QRSegment.FinderInside) {
        const cx = x + margin + 0.5;
        const cy = y + margin + 0.5;
        svgBuilder.AddCircleInSegment(`${QRSegment.FinderInside}`,cx,cy,r,dark)
        continue;
      }

      if (GetQRSegmentByCoordinates({X :x, Y:y}, size) === QRSegment.FinderBorder) {
        const cx = x + margin + 0.5;
        const cy = y + margin + 0.5;
        svgBuilder.AddCircleInSegment(`${QRSegment.FinderBorder}`,cx,cy,r,dark)
        continue;
      }

      if (GetQRSegmentByCoordinates({X :x, Y:y}, size) === QRSegment.Data) {
        const x0 = x + margin;
        const y0 = y + margin;
        svgBuilder.AddPathInSegment(`${QRSegment.Data}`,`M${x0} ${y0}h1v1h-1z`)
      }
    }
  }

  // Build solid circular rings for finder borders (top-left, top-right, bottom-left)
  // let finderRings = '';
  // for (const { x0, y0 } of getFinderAnchors(size)) {
  //   console.log(x0 , y0);
  //   const cx = x0 + 3 + margin + 0.5;
  //   const cy = y0 + 3 + margin + 0.5;
  //   const ringRadius = 3;         // centered within 7x7 finder
  //   const strokeWidth = 1;        // 1 module thick ring
  //   finderRings += `<circle cx="${cx}" cy="${cy}" r="${ringRadius}" stroke="${dark}" stroke-width="${strokeWidth}" fill="none"/>`;
  // }

  return svgBuilder.BuildSVG();


  // // Circular modules
  // const moduleScale = options.moduleScale ?? 1;
  // const r = 0.5 * moduleScale;
  // let circles = '';
  // for (let y = 0; y < size; y++) {
  //   for (let x = 0; x < size; x++) {
  //     if (qr.getModule(x, y)) {
  //       const cx = x + margin + 0.5;
  //       const cy = y + margin + 0.5;
  //       circles += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${dark}"/>`;
  //     }
  //   }
  // }
  //
  // const svg =
  //   `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vb} ${vb}">` +
  //   `<rect width="100%" height="100%" fill="${light}"/>` +
  //   circles +
  //   `</svg>`;
  // return svg;
}