# obsidian-chatwork-plugin

Chatwork に投稿したチャットを Obsidian に取り込むプラグインです。

## 使われ方: ユースケース

- Chatwork → Obsidian 方向に同期をすることができます。
  - Chatwork にメッセージを投稿すると、同期した際に Obsidian にメモが作成されます。
  - Chatwork にメッセージを更新すると、同期した際に Obsidian のメモも更新されます。
  - Chatwork にメッセージを削除すると、同期した際に Obsidian のメモも削除されます。
- Obsidian → Chatwork 方向の同期はできません。

## 使い方

まだ Community Plugin として登録していないので、手動でインストールする必要があります。

1. このリポジトリをクローンする
2. `npm install` で依存関係をインストールする
3. `npm run build` でビルドする
4. Obsidian のプラグインフォルダにコピーする
5. Obsidian を起動する
6. 設定画面から Chatwork の API トークン, 同期するルームID, 同期先のフォルダを設定する
7. リボンアイコンの Chatwork ボタンをクリックするか、コマンドパレットから `Sync Chatwork` を実行する
