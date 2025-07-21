export interface IMarkdownRenderer {
    render(markdown: string): string;
    isMarpDocument(markdown: string): boolean;
    processImages(markdown: string, baseUrl: string): string;
}
//# sourceMappingURL=IMarkdownRenderer.d.ts.map