# HTML Preview Test

## 基本的なHTML

```html
<!DOCTYPE html>
<html>
<head>
    <title>Hello World</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f0f8ff; padding: 20px; }
        h1 { color: #4169e1; text-align: center; }
        .box { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="box">
        <h1>🌟 Hello, World!</h1>
        <p>これは<strong>HTMLプレビュー</strong>のテストです。</p>
        <ul>
            <li>✅ スタイルが適用される</li>
            <li>✅ JavaScriptも動作する</li>
            <li>✅ インタラクティブな要素もOK</li>
        </ul>
        <button onclick="alert('Hello from HTML!')">クリックしてみて！</button>
    </div>
</body>
</html>
```

## インタラクティブなHTML

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        .counter-app {
            max-width: 300px;
            margin: 0 auto;
            padding: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            color: white;
            text-align: center;
            font-family: 'Segoe UI', sans-serif;
        }
        .counter {
            font-size: 48px;
            font-weight: bold;
            margin: 20px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        button {
            background: rgba(255,255,255,0.2);
            border: 2px solid rgba(255,255,255,0.3);
            color: white;
            padding: 10px 20px;
            margin: 5px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s;
        }
        button:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="counter-app">
        <h2>🔢 Counter App</h2>
        <div class="counter" id="counter">0</div>
        <button onclick="increment()">➕ Plus</button>
        <button onclick="decrement()">➖ Minus</button>
        <button onclick="reset()">🔄 Reset</button>
    </div>
    
    <script>
        let count = 0;
        const counterElement = document.getElementById('counter');
        
        function increment() {
            count++;
            updateDisplay();
        }
        
        function decrement() {
            count--;
            updateDisplay();
        }
        
        function reset() {
            count = 0;
            updateDisplay();
        }
        
        function updateDisplay() {
            counterElement.textContent = count;
            counterElement.style.transform = 'scale(1.1)';
            setTimeout(() => {
                counterElement.style.transform = 'scale(1)';
            }, 150);
        }
    </script>
</body>
</html>
```

## CSS Animationのテスト

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        .animation-demo {
            padding: 40px;
            background: #1a1a2e;
            color: white;
            border-radius: 15px;
            text-align: center;
            font-family: 'Arial', sans-serif;
        }
        .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(255,255,255,0.3);
            border-top: 5px solid #00d4ff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .bounce {
            display: inline-block;
            animation: bounce 2s infinite;
            font-size: 24px;
            margin: 0 5px;
        }
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-30px); }
            60% { transform: translateY(-15px); }
        }
        .wave {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
            background-size: 400% 400%;
            animation: gradient 3s ease infinite;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
        }
        @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
    </style>
</head>
<body>
    <div class="animation-demo">
        <h2>🎨 CSS Animations</h2>
        <div class="spinner"></div>
        <div>
            <span class="bounce">🌟</span>
            <span class="bounce" style="animation-delay: 0.1s">✨</span>
            <span class="bounce" style="animation-delay: 0.2s">⭐</span>
            <span class="bounce" style="animation-delay: 0.3s">💫</span>
            <span class="bounce" style="animation-delay: 0.4s">🌟</span>
        </div>
        <div class="wave">
            <strong>Animated Background!</strong>
        </div>
        <p>HTMLプレビュー機能で<br>CSS Animationも完全に動作します！</p>
    </div>
</body>
</html>
```