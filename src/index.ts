import {qrcodegen} from "./qrcore";

export {QRBuilder} from './QRBuilder';
export { SegmentStrategyType } from './Types/QREnums';
export { FinderInsideSegments, FinderBorderSegments, DataSupportedSegments } from './Types/QRTypes';
export const Ecc = qrcodegen.QrCode.Ecc;
export { 
    QRContentType, 
    WiFiEncryption,
    type WiFiConfig,
    type PhoneConfig,
    type SMSConfig,
    type EmailConfig,
    type URLConfig,
    type TextConfig,
} from './Types/QRContentTypes';