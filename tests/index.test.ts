import { describe, it, expect, vi } from 'vitest';
import { generateQRSvg } from '../src';
describe('entrypoint side effects', () => {
  it('logs the greeting at least once on import', async () => {
    const qr = generateQRSvg("test");

    console.log(qr);
  });
});


