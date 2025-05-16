# AssessHub Client

AssessHub クライアントアプリケーション - ケース管理システム

## 開発環境のセットアップ

### 必要条件

- Node.js 16以上
- npm または pnpm

### Windows環境でのインストール

```bash
# 依存関係のインストール
npm install

# 開発モードでの起動
npm run electron:start
```

または、Windows専用のスクリプトを使用:

```bash
npm run electron:windows
```

### トラブルシューティング

#### インストール時の問題

インストール中に問題が発生した場合は、以下を試してください:

```bash
# 依存関係の再インストール
npm run postinstall

# または
npm install --force
```

#### 起動時の問題

アプリケーションが起動しない場合:

1. ポート3000が利用可能であることを確認してください
2. 別のターミナルで `npm start` を実行し、その後 `electron .` を実行してください

## ビルド

Windows用のインストーラーを作成するには:

```bash
npm run electron:build
```

ビルドされたアプリケーションは `release` ディレクトリに生成されます。

## 技術スタック

- Electron
- React
- TypeScript
- Material-UI
- i18next (日本語サポート)
