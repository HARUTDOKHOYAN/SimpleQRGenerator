import {describe, it} from 'vitest';
import {Ecc, QRBuilder, QRContentType, SegmentStrategyType} from '../src';

describe('entrypoint side effects', () => {
  it('generates svg with circular modules by default', () => {

      const builder = new QRBuilder();

      const svg = builder
          .SetQRType(QRContentType.EMAIL)
          .SetQRConfig( {
              email: "harut.dokhoyan00@gmail.com",
              subject: "How are you?",
              body: "I crate QR",
              })
          .SetQrOptions({
              FinderInsideSegments: SegmentStrategyType.SquircleInside,
              FinderBorderSegments: SegmentStrategyType.BagelBorder,
              DataSegments: SegmentStrategyType.Square,
              margin: 2,
              ErrorCorrection: Ecc.HIGH
          })
          .BuildQRSVG();
      console.log(svg);
  });
});



