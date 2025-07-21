import { IMarkdownRenderer } from '../interfaces/IMarkdownRenderer';
export declare class MarkdownRenderer implements IMarkdownRenderer {
    render(markdown: string): string;
    isMarpDocument(markdown: string): boolean;
    processImages(markdown: string, baseUrl: string): string;
}
//# sourceMappingURL=MarkdownRenderer.d.ts.map