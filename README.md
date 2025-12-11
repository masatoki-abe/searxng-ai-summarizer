# SearXNG AI Summarizer

SearXNGの検索結果をAI（Google Gemini）を使って要約するFirefox拡張機能です。
任意のSearXNGインスタンスで動作し、検索結果の概要を素早く把握することができます。

## 機能

- **AI要約**: 検索結果の上位スニペットを抽出し、簡潔な日本語の要約を生成します。
- **Gemini API対応**: 高速かつ高性能なGoogle Geminiモデル（`gemini-1.5-flash`等）を使用。
- **プライバシー**: APIキーはブラウザ内に安全に保存され、検索結果のテキストのみがAIに送信されます。

## インストール方法

### Firefox
1. アドレスバーに `about:debugging#/runtime/this-firefox` と入力します。
2. 「一時的なアドオンを読み込む...」をクリックします。
3. ディレクトリ内の `manifest.json` を選択します。

## 設定方法

1. 拡張機能のアイコンをクリックし、「設定画面を開く」ボタンを押します（または検索結果画面の歯車アイコンをクリック）。
2. 設定画面で **Gemini API Key** を入力します（[Google AI Studio](https://aistudio.google.com/) で取得可能です）。
3. 必要に応じてモデル名（デフォルト: `gemini-2.5-flash-lite`）を変更します。
4. "設定を保存" ボタンをクリックします。

## 使い方

1. 任意の [SearXNG インスタンス](https://searx.space/) で検索を行います。
2. 検索結果ページの上部に表示される **「✨ AIで要約を実行」** ボタンをクリックします。
3. AIによる要約が生成され、表示されます。

## 開発

- `npm` 等のビルドツールは不要です。標準的な Web 技術（HTML/CSS/JS）のみで記述されています。
- `manifest.json` は Manifest V3 準拠です。
