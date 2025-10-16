import { describe, it, expect, vi } from 'vitest';
import { generateQRSvg } from '../src';
describe('entrypoint side effects', () => {
  it('generates svg with circular modules by default', () => {
    const svg = generateQRSvg("test ja adj jajdvjaj jasdlvjk ajsdlj");
    console.log(svg);
  });

  it('generates svg with square modules when strategy is square', () => {
    const svg = generateQRSvg("test", { segmentStrategy: 'square' });
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('<rect');
    console.log(svg);
  });
});


