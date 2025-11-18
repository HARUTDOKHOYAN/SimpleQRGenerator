import {describe, it} from 'vitest';
import {Ecc, QRBuilder, QRContentType, SegmentStrategyType} from '../src';

describe('entrypoint side effects', () => {
  it('generates svg with circular modules by default', () => {
      const builder = new QRBuilder();

      const svg = builder
          .setQRType(QRContentType.URL)
          .setQRConfig({
              text: "harut.dokhoyan00@gmail.com",
          })
          .setQrOptions({
              FinderInsideSegments: SegmentStrategyType.CornerflowBorder,
              FinderBorderSegments: SegmentStrategyType.Circular,
              DataSegments: SegmentStrategyType.Circular,
              margin: 10,
              ErrorCorrection: Ecc.HIGH,
              foregroundColor:"#42cef5",
              backgroundColor:"#859194",
          })
          .buildQRSVG();
      console.log(svg);
  });
});



