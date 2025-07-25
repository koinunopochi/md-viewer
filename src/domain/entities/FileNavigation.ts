export interface NavigationFile {
  path: string;
  name: string;
  type: 'markdown' | 'html' | 'csv' | 'image';
}

export interface FileNavigation {
  previous?: NavigationFile;
  next?: NavigationFile;
  parent?: NavigationFile;
  siblings: NavigationFile[];
  children: NavigationFile[];
}