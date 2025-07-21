export interface MarpRenderResult {
    html: string;
    css: string;
}
export interface IMarpRenderer {
    render(markdown: string): MarpRenderResult;
    countSlides(html: string): number;
    wrapInSlideTemplate(html: string, css: string, title: string): string;
}
//# sourceMappingURL=IMarpRenderer.d.ts.map