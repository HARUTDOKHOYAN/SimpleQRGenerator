export type Point = {
    X : number;
    Y : number;
}

export type QrSvgOptions = {
    margin?: number; // quiet zone in modules
    darkColor?: string;
    lightColor?: string;
    moduleScale?: number; // for circle radius (0..1), 1 => r = 0.5
};
