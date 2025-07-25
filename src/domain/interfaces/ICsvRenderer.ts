export interface ICsvRenderer {
  render(csvContent: string): string;
}