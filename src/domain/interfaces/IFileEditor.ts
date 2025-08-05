export interface EditRequest {
  filePath: string;
  originalText: string;
  newText: string;
  startOffset?: number;
  endOffset?: number;
}

export interface IFileEditor {
  editFile(request: EditRequest): Promise<void>;
}