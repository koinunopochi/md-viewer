import { IMarpRenderer, MarpRenderResult } from '../interfaces/IMarpRenderer';
export declare class MarpRenderer implements IMarpRenderer {
    private marp;
    constructor();
    render(markdown: string): MarpRenderResult;
    countSlides(html: string): number;
    wrapInSlideTemplate(html: string, css: string, title: string): string;
}
//# sourceMappingURL=MarpRenderer.d.ts.map