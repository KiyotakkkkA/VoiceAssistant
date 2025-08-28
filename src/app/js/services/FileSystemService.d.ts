import fs from "fs";
import { FolderStructure } from "../../ts/types/Global";

class FileSystemService {
  private static instance: FileSystemService;

  constructor();

  static getInstance(): FileSystemService;

  fileWrite(filePath: string, content?: string, flag?: string): void;
  fileDelete(filePath: string): void;
  fileRename(filePath: string, newFilename: string): void;

  folderCreate(dirPath: string, name: string): void;
  folderRename(dirPath: string, newName: string): void;
  folderDelete(dirPath: string): void;

  buildNotesStructure(start_path: string, idCounter?: { value: number }): FolderStructure | null;
}
