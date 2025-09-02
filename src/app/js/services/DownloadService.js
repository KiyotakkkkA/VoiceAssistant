import fs from 'fs';
import path from 'path';
import https from 'https';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { createReadStream } from 'fs';
import { createGunzip } from 'zlib';
import { Extract } from 'unzipper';

export class DownloadService {
    static instance;

    static getInstance() {
        if (!DownloadService.instance) {
            DownloadService.instance = new DownloadService();
        }
        return DownloadService.instance;
    }

    async download(link, downloadPath, needUnzip = false) {
        try {
            const directLink = this._convertGoogleDriveLink(link);
            
            const dir = path.dirname(downloadPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            await this._downloadFile(directLink, downloadPath);

            if (needUnzip) {
                await this._extractFile(downloadPath);
            }
        } catch (error) {
            throw new Error(`Download failed: ${error.message}`);
        }
    }

    _convertGoogleDriveLink(link) {
        let fileId;
        
        let match = link.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
        if (match) {
            fileId = match[1];
        }
        
        if (!fileId) {
            match = link.match(/[?&]id=([a-zA-Z0-9-_]+)/);
            if (match) {
                fileId = match[1];
            }
        }
        
        if (!fileId) {
            match = link.match(/\/uc\?.*id=([a-zA-Z0-9-_]+)/);
            if (match) {
                fileId = match[1];
            }
        }

        if (fileId) {
            return `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
        }
        
        return link;
    }

    _downloadFile(url, filePath) {
        return new Promise((resolve, reject) => {
            let file = null;
            let redirectCount = 0;
            const maxRedirects = 5;
            
            const safeCleanup = () => {
                if (file) {
                    file.destroy();
                    file = null;
                }
                if (fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                    } catch (e) {}
                }
            };
            
            const downloadFromUrl = (downloadUrl) => {
                file = createWriteStream(filePath);
                
                file.on('error', (err) => {
                    safeCleanup();
                    reject(err);
                });
                
                const request = https.get(downloadUrl, (response) => {
                    if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
                        redirectCount++;
                        if (redirectCount > maxRedirects) {
                            safeCleanup();
                            return reject(new Error('Too many redirects'));
                        }
                        
                        const location = response.headers.location;
                        if (!location) {
                            safeCleanup();
                            return reject(new Error('Redirect without location header'));
                        }
                        
                        safeCleanup();
                        return downloadFromUrl(location);
                    }

                    const contentType = response.headers['content-type'] || '';
                    if (contentType.includes('text/html')) {
                        let htmlData = '';
                        
                        response.on('data', (chunk) => {
                            htmlData += chunk;
                        });
                        
                        response.on('end', () => {
                            safeCleanup();
                            
                            const actionMatch = htmlData.match(/action="([^"]+)"/);
                            const confirmMatch = htmlData.match(/name="confirm" value="([^"]+)"/);
                            const idMatch = htmlData.match(/name="id" value="([^"]+)"/);
                            const uuidMatch = htmlData.match(/name="uuid" value="([^"]+)"/);
                            
                            if (actionMatch && idMatch) {
                                let directUrl = actionMatch[1].replace(/&amp;/g, '&');
                                directUrl += `?id=${idMatch[1]}&export=download`;
                                
                                if (confirmMatch) {
                                    directUrl += `&confirm=${confirmMatch[1]}`;
                                }
                                if (uuidMatch) {
                                    directUrl += `&uuid=${uuidMatch[1]}`;
                                }
                                
                                return downloadFromUrl(directUrl);
                            } else {
                                const fileId = this._extractFileId(downloadUrl);
                                if (fileId) {
                                    const altUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
                                    return downloadFromUrl(altUrl);
                                }
                                return reject(new Error('Could not parse Google Drive download page'));
                            }
                        });
                        
                        response.on('error', (err) => {
                            safeCleanup();
                            reject(err);
                        });
                        return;
                    }

                    if (response.statusCode !== 200) {
                        safeCleanup();
                        return reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                    }

                    response.pipe(file);
                    
                    response.on('end', () => {
                        if (file && !file.destroyed) {
                            file.end();
                        }
                    });
                    
                    response.on('error', (err) => {
                        safeCleanup();
                        reject(err);
                    });
                }).on('error', (err) => {
                    safeCleanup();
                    reject(err);
                });
                
                file.on('finish', () => {
                    file = null;
                    resolve();
                });
                
                request.setTimeout(30000, () => {
                    request.destroy();
                    safeCleanup();
                    reject(new Error('Request timeout'));
                });
            };
            
            downloadFromUrl(url);
        });
    }

    async _extractFile(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const dir = path.dirname(filePath);
        const basename = path.basename(filePath, ext);

        try {
            if (ext === '.zip') {
                await pipeline(
                    createReadStream(filePath),
                    Extract({ path: dir })
                );
                fs.unlinkSync(filePath);
            } else if (ext === '.gz') {
                const outputPath = path.join(dir, basename);
                await pipeline(
                    createReadStream(filePath),
                    createGunzip(),
                    createWriteStream(outputPath)
                );
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            throw new Error(`Extraction failed: ${error.message}`);
        }
    }

    async getFileInfo(link) {
        const fileId = this._extractFileId(link);
        if (!fileId) {
            throw new Error('Invalid Google Drive link');
        }

        return new Promise((resolve, reject) => {
            const url = `https://drive.google.com/file/d/${fileId}/view`;
            
            https.get(url, (response) => {
                let htmlData = '';
                response.on('data', (chunk) => {
                    htmlData += chunk;
                });
                
                response.on('end', () => {
                    try {
                        const titleMatch = htmlData.match(/<title>([^<]+)<\/title>/);
                        const sizeMatch = htmlData.match(/(\d+(?:\.\d+)?)\s*([KMGT]?B)/i);
                        
                        resolve({
                            title: titleMatch ? titleMatch[1].replace(' - Google Drive', '') : 'Unknown',
                            size: sizeMatch ? `${sizeMatch[1]}${sizeMatch[2]}` : 'Unknown',
                            fileId: fileId
                        });
                    } catch (error) {
                        reject(new Error('Could not parse file info'));
                    }
                });
            }).on('error', reject);
        });
    }

    _extractFileId(link) {
        let match = link.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
        if (match) return match[1];
        
        match = link.match(/[?&]id=([a-zA-Z0-9-_]+)/);
        if (match) return match[1];
        
        match = link.match(/\/uc\?.*id=([a-zA-Z0-9-_]+)/);
        if (match) return match[1];
        
        return null;
    }
}