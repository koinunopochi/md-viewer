# Markdown Viewer

zenn-markdown-htmlを使用したシンプルなMarkdownビューアーです。

## 機能

- DB移行ディレクトリ内のMarkdownファイルをブラウザで表示
- Zennスタイルの美しいレンダリング
- ファイル一覧から選択して表示
- 埋め込みコンテンツ対応（Twitter、YouTube等）

## 使い方

### 通常版（埋め込み対応）
```bash
# 起動（ポート15555）
npm start

# ブラウザで開く
open http://localhost:15555
```

### シンプル版（Mermaidの問題回避）
```bash
# 起動（ポート15556）
npm run simple

# ブラウザで開く
open http://localhost:15556
```

### ローカル版（完全自立型）⭐️推奨
```bash
# 起動（ポート15558 + Mermaidサーバー15557）
npm run local

# ブラウザで開く
open http://localhost:15558
```

## 3つのバージョンの違い

### 通常版 (`npm start`)
- **ポート**: 15555
- **埋め込み**: 対応（Twitter、YouTube等）
- **Mermaid**: Zennの埋め込みサーバー使用
- **用途**: 一般的なMarkdownファイル表示

### シンプル版 (`npm run simple`)
- **ポート**: 15556
- **埋め込み**: 非対応
- **Mermaid**: コードブロックとして表示
- **用途**: 埋め込み機能を使わない場合

### ローカル版 (`npm run local`) ⭐️推奨
- **ポート**: 15558 (Mermaidサーバー: 15557)
- **埋め込み**: Mermaidのみローカル対応
- **Mermaid**: 自前サーバーで完全描画
- **用途**: 外部サービスに依存せずMermaid表示

## 仕組み

1. Expressサーバーが起動
2. `/` - MDファイル一覧を表示
3. `/view/:filename` - 選択したMDファイルをHTMLに変換して表示

## 注意事項

- 一時的な表示用ツールです
- DB移行ディレクトリ内のMDファイルのみ表示可能
- セキュリティのため、相対パス遡りは禁止されています
- **推奨**: ローカル版（外部サービス非依存でMermaid完全対応）