import {describe, it} from 'vitest';
import {Ecc, QRBuilder, QRContentType, SegmentStrategyType} from '../src';

describe('entrypoint side effects', () => {
  it('generates svg with circular modules by default', () => {
      const builder = new QRBuilder();

      const svg = builder
          .setQRType(QRContentType.TEXT)
          .setQRConfig({
              text: "Test",
          })
          .setQrOptions({
              FinderInsideSegments: SegmentStrategyType.CornerflowInside,
              FinderBorderSegments: SegmentStrategyType.SquircleBorder,
              DataSegments: SegmentStrategyType.Triangle,
              margin: 3,
              ErrorCorrection: Ecc.HIGH,
          })
          .buildQRSVG();
      console.log(svg);
  });
});



