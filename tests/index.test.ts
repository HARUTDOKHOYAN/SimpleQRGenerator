import {describe, it} from 'vitest';
import {Ecc, QRBuilder, QRContentType, SegmentStrategyType} from '../src';

describe('entrypoint side effects', () => {
  it('generates svg with circular modules by default', () => {
      const builder = new QRBuilder();

      const svg = builder
          .setQRType(QRContentType.EMAIL)
          .setQRConfig({
              email: "harut.dokhoyan00@gmail.com",
              subject: "How are you?",
              body: "I create QR",
          })
          .setQrOptions({
              FinderInsideSegments: SegmentStrategyType.SquircleInside,
              FinderBorderSegments: SegmentStrategyType.BagelBorder,
              DataSegments: SegmentStrategyType.Square,
              margin: 2,
              ErrorCorrection: Ecc.HIGH
          })
          .buildQRSVG();
      console.log(svg);
  });
});



