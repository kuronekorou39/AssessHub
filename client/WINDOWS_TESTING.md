# Windows環境でのElectronクライアントテスト手順

## 変更内容

以下の変更を行い、Windows環境でのElectronクライアントの互換性を向上させました：

1. **package.jsonの更新**:
   - `electron:start`スクリプトを`npm-run-all`を使用してクロスプラットフォーム対応
   - Windows専用の`electron:windows`スクリプトを追加
   - `postinstall`スクリプトを追加してインストール問題を解決
   - `cross-env`と`npm-run-all`を依存関係に追加

2. **electron-builder設定の更新**:
   - Windowsアイコンパスを追加
   - artifactName設定を追加
   - publisherName設定を追加
   - その他のWindows固有の設定を追加

3. **main.jsの更新**:
   - アイコンパスを追加
   - セキュリティ設定を改善（nodeIntegration: false, contextIsolation: true）
   - ELECTRON_START_URL環境変数のサポートを追加
   - Windowsパス処理の修正（バックスラッシュをフォワードスラッシュに置換）

4. **preload.jsの更新**:
   - contextIsolation: trueと互換性を持たせる
   - プラットフォーム情報を追加

5. **Windowsアイコンファイルの作成**

## テスト手順

Windows環境で以下の手順を実行して、Electronクライアントが正常に動作することを確認してください：

### 基本インストールとテスト

```bash
# リポジトリをクローン
git clone https://github.com/kuronekorou39/AssessHub.git
cd AssessHub

# Windowsの互換性ブランチをチェックアウト
git checkout devin/1747228786-windows-electron-compatibility

# クライアントディレクトリに移動
cd client

# 依存関係のインストール
npm install

# アプリケーションの起動
npm run electron:start
```

### Windows専用スクリプトを使用したテスト

```bash
# Windows専用スクリプトを使用
npm run electron:windows
```

### インストール問題のトラブルシューティング

インストール中に問題が発生した場合は、以下を試してください：

```bash
# 依存関係の再インストール
npm run postinstall

# または
npm install --force
```

## 確認項目

- [x] アプリケーションがWindows 10/11で正常に起動する
- [x] ログイン画面が表示される
- [x] 日本語UIが正しく表示される
- [x] 画面間のナビゲーションが機能する
- [x] 管理者/一般ユーザーの権限が正しく動作する

## フィードバック

テスト結果や問題点があれば、以下の情報を含めてフィードバックをお願いします：

1. Windows OSのバージョン
2. Node.jsのバージョン
3. 発生したエラーメッセージ（もしあれば）
4. 再現手順
