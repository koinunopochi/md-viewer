"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarpRenderer = void 0;
const marp_core_1 = require("@marp-team/marp-core");
class MarpRenderer {
    constructor() {
        this.marp = new marp_core_1.Marp({
            html: true,
            inlineSVG: false
        });
    }
    render(markdown) {
        const { html, css } = this.marp.render(markdown);
        return { html, css };
    }
    countSlides(html) {
        const matches = html.match(/<section/g);
        return matches ? matches.length : 0;
    }
    wrapInSlideTemplate(html, css, title) {
        return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Pika Slides</title>
    <style>
        body { margin: 0; overflow: hidden; }
        .marp-container {
            width: 100vw;
            height: 100vh;
            position: relative;
            background: #f5f5f5;
        }
        .marp-slide-wrapper {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .marpit {
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .slide-navigation {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 20px;
            z-index: 1000;
        }
        .slide-navigation button {
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
            background: #333;
            color: white;
            border: none;
            border-radius: 5px;
            transition: background 0.3s;
        }
        .slide-navigation button:hover:not(:disabled) {
            background: #555;
        }
        .slide-navigation button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .slide-counter {
            color: #333;
            font-size: 16px;
            line-height: 40px;
        }
        .back-link {
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1000;
            background: rgba(255,255,255,0.9);
            padding: 10px 15px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            text-decoration: none;
            color: #0969da;
        }
        .back-link:hover {
            text-decoration: underline;
        }
        ${css}
    </style>
</head>
<body>
    <a href="/" class="back-link">← Back to file list</a>
    <div class="marp-container">
        <div class="marp-slide-wrapper">
            ${html}
        </div>
        <div class="slide-navigation">
            <button id="prevSlide">← Previous</button>
            <span class="slide-counter">
                <span id="currentSlide">1</span> / <span id="totalSlides">1</span>
            </span>
            <button id="nextSlide">Next →</button>
        </div>
    </div>
    <script>
        let slides = document.querySelectorAll('section');
        let currentSlideIndex = 0;
        const totalSlides = slides.length;
        
        document.getElementById('totalSlides').textContent = totalSlides;
        
        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.style.display = i === index ? 'block' : 'none';
            });
            document.getElementById('currentSlide').textContent = index + 1;
            document.getElementById('prevSlide').disabled = index === 0;
            document.getElementById('nextSlide').disabled = index === totalSlides - 1;
        }
        
        document.getElementById('prevSlide').addEventListener('click', () => {
            if (currentSlideIndex > 0) {
                currentSlideIndex--;
                showSlide(currentSlideIndex);
            }
        });
        
        document.getElementById('nextSlide').addEventListener('click', () => {
            if (currentSlideIndex < totalSlides - 1) {
                currentSlideIndex++;
                showSlide(currentSlideIndex);
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && currentSlideIndex > 0) {
                currentSlideIndex--;
                showSlide(currentSlideIndex);
            } else if (e.key === 'ArrowRight' && currentSlideIndex < totalSlides - 1) {
                currentSlideIndex++;
                showSlide(currentSlideIndex);
            }
        });
        
        // Initialize
        showSlide(0);
    </script>
</body>
</html>`;
    }
}
exports.MarpRenderer = MarpRenderer;
//# sourceMappingURL=MarpRenderer.js.map