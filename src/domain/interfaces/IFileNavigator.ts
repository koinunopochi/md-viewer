import { FileNavigation } from '../entities/FileNavigation';

export interface IFileNavigator {
  getNavigation(currentFilePath: string): Promise<FileNavigation>;
}