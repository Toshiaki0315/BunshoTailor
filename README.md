# 文章仕立屋

macOSの `fm` コマンド（ローカルLLM）をGUIから快適に利用するためのチャットボットアプリケーションです。

## 技術スタック
- フロントエンド: TypeScript, React, Vite
- バックエンド: Rust, Tauri v2
- テスト: Vitest (フロントエンド), cargo test (バックエンド)

## 開発方針 (TDD)
本プロジェクトはテスト駆動開発（TDD）を採用しています。
ClaudeやCursorなどのAIエージェントに開発を依頼する際は、`.claude/` などのルールファイルを読み込ませてください。
