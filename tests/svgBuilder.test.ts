import { describe, it, expect } from 'vitest';
import SVGBuildHelper from '../src/Helpers/SVGBuildHelper';

describe('SVGBuildHelper', () => {
  it('builds SVG with viewport and background', () => {
    const svg = new SVGBuildHelper()
      .SetViewPortSize({ minX: 0, minY: 0, width: 10, height: 10 })
      .SetBackground('#fff')
      .SetMainPathColor('#000')
      .RegisterSolidSegments('seg')
      .AddRectInSegment('seg', 0, 0, 1)
      .BuildSVG();

    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('viewBox="0 0 10 10"');
    expect(svg).toContain('<rect width="100%" height="100%" fill="#fff"/>');
    expect(svg).toContain('<rect x="0" y="0" width="1" height="1" fill="#000"/>');
    expect(svg.endsWith('</svg>')).toBe(true);
  });

  it('accepts legacy RegisterSoldSegments alias', () => {
    const svg = new SVGBuildHelper()
      .SetViewPortSize({ minX: 0, minY: 0, width: 2, height: 2 })
      .SetBackground('#fff')
      .SetMainPathColor('#123')
      .RegisterSolidSegments('legacy')
      .AddCircleInSegment('legacy', 1, 1, 0.5)
      .BuildSVG();

    expect(svg).toContain('<circle cx="1" cy="1" r="0.5" fill="#123"/>');
  });

  it('auto-registers path segments and uses main path color by default', () => {
    const svg = new SVGBuildHelper()
      .SetViewPortSize({ minX: 0, minY: 0, width: 3, height: 3 })
      .SetBackground('#fff')
      .SetMainPathColor('#abc')
      .AddPathInSegment('pathSeg', 'M0 0h1')
      .BuildSVG();

    expect(svg).toContain('<path d="M0 0h1" fill="#abc"/>');
  });

  it('omits empty segments from output', () => {
    const svg = new SVGBuildHelper()
      .SetViewPortSize({ minX: 0, minY: 0, width: 1, height: 1 })
      .SetBackground('#fff')
      .SetMainPathColor('#000')
      .RegisterSolidSegments('emptySolid')
      .RegisterPathSegments('emptyPath')
      .BuildSVG();

    expect(svg).not.toContain('<path d=""');
  });
});


