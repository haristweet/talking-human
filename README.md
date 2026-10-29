# TALKING HUMAN

ポリゴンの顔が、[talking-sam](https://haristweet.github.io/talking-sam/) の声（1982年の音声合成 SAM）で、入れた文章を延々としゃべり続けるのを眺めるアプリ。そのまま MP4 に書き出せる。
クラフトワークの「Musique Non Stop」のような、合成の声でくり返ししゃべる顔をねらった。
顔・カメラ・描き方・書き出しは [ENDLESS HUMAN](https://haristweet.github.io/endless-human/)（v1.12.0）と同じ。曲と歌詞の代わりに、しゃべる文章を入れる。
`index.html` と同梱の `mp4-muxer.js`・`vendor/`（SAM・MediaPipe）だけで動く（ビルド不要）。

## できること

- しゃべる文章：英語・ひらがな/カタカナ・SAM の発音記号。「しゃべる → 間（0.3〜4秒） → しゃべる」をくり返す。画面の下に字幕（出さないこともできる）
- 声：SAM・妖精・小さなロボット・鼻づまり・おばあさん・宇宙人（talking-sam と同じ）と、つまみ（速さ・高さ・のど・口）
- 口：SAM がしゃべる音（発音記号）の並びと時刻から、あいうえお の形・M B P で唇を閉じる・F V で下唇を歯に当てる。声が止まれば閉じる
- 顔：作りものの顔4人と、写真から作る顔（4枚まで。目は形が作りもので色が写真から、顔だけ暗闇に浮かぶか頭まで）。目の動き（きょろきょろ・カメラを見る・ゆっくり）、まばたき
- カメラは「動き」のカットの間隔で、2〜8秒ごとのカット・回り続ける・正面固定（カメラを動かさない）から選ぶ
- カメラ・描き方（線画・ポリゴン・時間で切り替え）・走査線・画面の比率・MP4 書き出し（声付き。長さははじめ30秒）は ENDLESS HUMAN と同じ

## しくみのメモ

- **声**：`vendor/samjs.min.js`（[discordier/sam](https://github.com/discordier/sam) の SamJs。talking-sam に入れていたもの）で文章を 22050Hz の声にし、48kHz に直して「声＋間」1 回分の音にする（`buildSpeech`）。この音を ENDLESS HUMAN の曲と同じように扱うので、再生のくり返しも書き出しもそのまま使える。文章・読み方・声を変えると 0.5 秒後に作り直す。
- **かな**：ひらがな・カタカナは talking-sam と同じ表で SAM の発音記号にする（`kanaToPhonemes`。SAM は英語の声なので近い音に置きかえる）。英語は SAM の `convert` で発音記号にする。
- **口の形**：発音記号を音ごとに分け（`samTokens`）、頭からその音の手前までをしゃべらせた長さで、音ごとの始まりの時刻を測る（`samTimeline`。SAM は音の長さを足していくので、ほぼ合う）。母音は あいうえお の形（`PH_MOUTH`・`VOWELS`）、M B P は閉じる、F V は少しだけ開く、ほかの子音は前の母音の形を半分閉じたもの。0.06 秒（閉じる音は 0.03 秒）で次の形へ移る（`phonemeMouth`）。開く大きさは声の大きさ（`voiceEnv`）で、声が止まれば閉じる。
- **最初の音**：ブラウザは画面に触れるまで音を鳴らさないので、最初に触れたときに鳴らし始める。
- そのほか（顔・写真の顔・目・カメラ・描き方・書き出し）は ENDLESS HUMAN の README を見る。
- ローカル確認：`python3 -m http.server 8805`
- しゃべる確認：`node test/talk.cjs 出力.png 顔写真.png`（あいうえお・まみむめも の音ごとの時刻と、音ごとの口）。顔写真はリポジトリに入れない。ほかの試験（`test/look.cjs` など）は ENDLESS HUMAN と同じ

## ライセンスについて

SAM は 1982 年の商用ソフト（Don't Ask Software / SoftVoice, Inc.）を解析して移したもの。詳しくは [discordier/sam](https://github.com/discordier/sam) と talking-sam の README を見る。
MediaPipe（`vendor/mediapipe/`）は Apache License 2.0。

## 更新履歴（Changelog）

- v1.2.0（2026-10-29）写真の目がまだらに汚く見えるのを直す：目玉の形は作りもの、色（白目と黒目）だけ写真から取る（ENDLESS HUMAN v1.15.0 と同じ）
- v1.1.0（2026-10-29）カットの間隔に「正面固定（カメラを動かさない）」を追加
- v1.0.0（2026-10-29）最初の版（ENDLESS HUMAN v1.12.0 と talking-sam から）
