export enum QRContentType {
    TEXT = 'TEXT',
    URL = 'URL',
    WIFI = 'WIFI',
    PHONE = 'PHONE',
    SMS = 'SMS',
    EMAIL = 'EMAIL'
}

export enum WiFiEncryption {
    WPA = 'WPA',
    WEP = 'WEP',
    NOPASS = 'nopass'
}

export interface WiFiConfig {
    ssid: string;
    password?: string;
    encryption?: WiFiEncryption;
    hidden?: boolean;
}

export interface PhoneConfig {
    phoneNumber: string;
}

export interface SMSConfig {
    phoneNumber: string;
    message?: string;
}

export interface EmailConfig {
    email: string;
    subject?: string;
    body?: string;
}

export interface URLConfig {
    url: string;
}

export interface TextConfig {
    text: string;
}

