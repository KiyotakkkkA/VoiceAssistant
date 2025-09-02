import fs from 'fs';

class DownloadService {
    private static instance: DownloadService;

    constructor();

    static getInstance(): DownloadService;

    private _convertGoogleDriveLink(link: string): string;
    private _downloadFile(url: string, filePath: string): Promise<void>;
    private _extractFile(filePath: string): Promise<void>;

    download(link: string, downloadPath: string, needUnzip?: boolean): Promise<void>;
}