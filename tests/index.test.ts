import {describe, it} from 'vitest';
import {generateQRSvg} from '../src';
import {SegmentStrategyType} from "../src";

describe('entrypoint side effects', () => {
  it('generates svg with circular modules by default', () => {
    const svg = generateQRSvg("https://www.youtube.com/watch?v=4K00naoeNDE&list=RD4K00naoeNDE&start_radio=1" ,
        {
            FinderInsideSegments:SegmentStrategyType.SquircleInside,
            FinderBorderSegments:SegmentStrategyType.BagelBorder,
            DataSegments: SegmentStrategyType.Liquid,
            margin:2,
        });
    console.log(svg);
  });
});


