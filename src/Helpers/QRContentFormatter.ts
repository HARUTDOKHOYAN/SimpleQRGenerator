import {
    QRContentType,
    WiFiConfig,
    WiFiEncryption,
    PhoneConfig,
    SMSConfig,
    EmailConfig,
    URLConfig,
    TextConfig
} from '../Types/QRContentTypes';

export function formatWiFi(config: WiFiConfig): string {
    const encryption = config.encryption || WiFiEncryption.WPA;
    const password = config.password || '';
    const hidden = config.hidden ? 'true' : 'false';
    
    // Escape special characters in SSID and password
    const escapedSsid = escapeSpecialChars(config.ssid);
    const escapedPassword = escapeSpecialChars(password);
    
    let wifiString = `WIFI:T:${encryption};S:${escapedSsid};`;
    
    if (password) {
        wifiString += `P:${escapedPassword};`;
    }
    
    if (config.hidden) {
        wifiString += `H:${hidden};`;
    }
    
    wifiString += ';';
    
    return wifiString;
}

export function formatPhone(config: PhoneConfig): string {
    // Remove non-numeric characters except + for international format
    const cleanNumber = config.phoneNumber.replace(/[^\d+]/g, '');
    return `TEL:${cleanNumber}`;
}

export function formatSMS(config: SMSConfig): string {
    const cleanNumber = config.phoneNumber.replace(/[^\d+]/g, '');
    const message = config.message || '';
    
    if (message) {
        return `SMSTO:${cleanNumber}:${message}`;
    }
    
    return `SMSTO:${cleanNumber}`;
}

export function formatEmail(config: EmailConfig): string {
    let emailString = `MAILTO:${config.email}`;
    
    const params: string[] = [];
    
    if (config.subject) {
        params.push(`subject=${encodeURIComponent(config.subject)}`);
    }
    
    if (config.body) {
        params.push(`body=${encodeURIComponent(config.body)}`);
    }
    
    if (params.length > 0) {
        emailString += `?${params.join('&')}`;
    }
    
    return emailString;
}

export function formatURL(config: URLConfig): string {
    let url = config.url;
    
    // Add protocol if missing
    if (!url.match(/^[a-zA-Z]+:\/\//)) {
        url = `https://${url}`;
    }
    
    return url;
}

export function formatText(config: TextConfig): string {
    return config.text;
}

export function formatQRContent(type:QRContentType ,data:any ): string {
    switch (type) {
        case QRContentType.WIFI:
            return formatWiFi(data);
        case QRContentType.PHONE:
            return formatPhone(data);
        case QRContentType.SMS:
            return formatSMS(data);
        case QRContentType.EMAIL:
            return formatEmail(data);
        case QRContentType.URL:
            return formatURL(data);
        case QRContentType.TEXT:
            return formatText(data);
        default:
            throw new Error(`Unknown QR content type`);
    }
}

function escapeSpecialChars(str: string): string {
    return str
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/"/g, '\\"')
        .replace(/:/g, '\\:');
}

