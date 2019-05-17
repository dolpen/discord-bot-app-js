## 導入

```
$ npm install
```

## ローカルで実行

```
$ export DISCORD_TOKEN="botから取って来たトークン。secretではなく画面下の方から取れるやつ"
$ npm start
```

## デプロイ

環境変数の設定をCLIでやりたくないなら Heroku のコンソールからやっても OK  
(正直 Github にリポジトリあるなら heroku CLI 使わなくていいと思います)

```
// 環境変数の追加
$ heroku config:add DISCORD_TOKEN="botから取って来たトークン。secretではなく画面下の方から取れるやつ"
// 環境変数の確認
$ heroku config
$ git push heroku master
// これを0にすると停止できます
$ heroku ps:scale worker=1
```

