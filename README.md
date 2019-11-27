## 導入

```
$ npm install
```

## Discord API

* https://discordapp.com/developers/applications からアプリケーション作成
* アプリケーションの `BOT` タブから BOT アカウント追加
  * PUBLIC を オフ
* `OAuth2` タブから bot 権限と bot が行使するパーミッション入れてURL生成して踏む


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

