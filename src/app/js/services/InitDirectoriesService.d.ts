import fs from 'fs';

class InitDirectoriesService {
    private static instance: InitDirectoriesService;

    constructor();

    static getInstance(): InitDirectoriesService;

    buildTree(basePath: string): void;
}