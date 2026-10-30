# STEP 01: 基本の1ターン

2ターン目から、双方の通常攻撃を処理して3ターン目へ進むところまでを実装した。特性も持ち物もひんしもない。ダメージは固定値で、技は必ず当たる。

最初の目的は、バトルのルールをイベントの購読で動かすことではない。何がどの順で起きるかを、ドメインの手順として残すことだ。出来事はその手順が積む結果ログである。

## このステップの範囲

対象は1対1の1ターンだけである。双方のポケモンはすでに場にいる。入力は2ターン目の状態と、双方の攻撃である。

CASE-01 の仮データは次のとおり。種族値でもダメージ計算でもない。ピカチュウが先に動く理由は、名前ではなく素早さ 90 が 45 より大きいことだ。

| 項目 | ピカチュウ | フシギダネ |
|---|---|---|
| 開始時 HP | 100 | 100 |
| 素早さ | 90 | 45 |
| 行動 | 攻撃 | 攻撃 |
| 与ダメージ | 20 | 15 |
| 終了時 HP | 85 | 80 |

終了時のターン番号は 3 になる。3ターン目の行動は、このステップでは実行しない。

## ドメインに置いたもの

ルールは `src/domain` に閉じている。`src/main.ts` は CASE-01 の状態を渡して `runTurn` を呼び、返ってきた出来事と HP を表示するだけである。

| 種類 | 名前 | 役割 |
|---|---|---|
| 集約 | `Battle` | ターン番号と、場にいるポケモン2体 |
| エンティティ | `Pokemon` | id、名前、HP、素早さ |
| 値オブジェクト | `AttackAction` | 攻撃であることと、固定ダメージ |
| 値オブジェクト | `BattleEvent` | 起きたことの1件 |
| ドメインサービス | `orderBySpeed` | 素早さが大きい方を先攻にする |
| ドメインサービス | `runTurn` | 1ターンの手順を持ち、出来事を順に積む |

`orderBySpeed` は `runTurn` から切り離してある。STEP 02 で優先度、同速、トリックルームを足すとき、変えるのはこの関数である。同速はこのステップでは未定義で、同じ素早さを渡すとエラーになる。

## 種類は enum にする

行動の種類と、出来事の種類は文字列の区別だった。名前の集合なので enum にした。値はこれまでログに出していた文字列のままである。

```ts
export enum ActionKind {
  Attack = "attack",
}

export enum BattleEventType {
  TurnStarted = "TurnStarted",
  ActionsSelected = "ActionsSelected",
  ActionOrderDetermined = "ActionOrderDetermined",
  MoveUsed = "MoveUsed",
  DamageApplied = "DamageApplied",
  TurnEnded = "TurnEnded",
}
```

`AttackAction.kind` は `ActionKind`、`BattleEvent.type` は `BattleEventType` である。手順も表示もテストも、この enum のメンバーを使う。新しい出来事を足すときは、enum と `BattleEvent` の形を一緒に足す。

`BattleEvent` は種類ごとのフィールドを持つ。

| 種類 | 記録するもの |
|---|---|
| `TurnStarted` | 開始したターン |
| `ActionsSelected` | 双方の攻撃とダメージ |
| `ActionOrderDetermined` | 先攻と後攻の id |
| `MoveUsed` | 技を使ったポケモンの id |
| `DamageApplied` | 対象、減少量、減少後 HP |
| `TurnEnded` | 終了したターン |

ポケモンの id はデータなので enum にはしていない。CASE-01 の `pikachu` と `bulbasaur` はサンプルの識別子である。

## 1ターンの手順

`runTurn` は入力の `Battle` をコピーしてから更新する。呼び出し元の状態は変えない。

1. `TurnStarted` に、いまのターンを載せる。
2. 双方の攻撃を受け取り、`ActionsSelected` を積む。
3. `orderBySpeed` で先攻を決める。
4. `ActionOrderDetermined` に先攻と後攻を載せる。
5. 先攻について `MoveUsed` を積み、相手の HP から固定ダメージを引き、`DamageApplied` を積む。
6. 後攻についても同じことを行う。
7. `TurnEnded` に、加算前のターンを載せる。
8. `turn` を 1 増やす。

`MoveUsed` は HP を変える前に積む。`DamageApplied` は減らしたあとに積み、減少後の HP を載せる。攻撃は必ず2回行う。残った行動の確認や中断は、この手順に書いていない。

## CASE-01 を見る

`npm start` を実行すると、次の順で表示される。

```text
開始  ターン 2
  ピカチュウ  HP 100  素早さ 90
  フシギダネ  HP 100  素早さ 45

1. TurnStarted  2ターン目開始
2. ActionsSelected  ピカチュウの攻撃 20、フシギダネの攻撃 15
3. ActionOrderDetermined  先攻 ピカチュウ、後攻 フシギダネ
4. MoveUsed  ピカチュウが技を使用
5. DamageApplied  フシギダネのHPが 20 減り、80
6. MoveUsed  フシギダネが技を使用
7. DamageApplied  ピカチュウのHPが 15 減り、85
8. TurnEnded  2ターン目終了

終了  ターン 3
  ピカチュウ  HP 85  素早さ 90
  フシギダネ  HP 80  素早さ 45
```

テストは `src/domain/runTurn.test.ts` に置いてある。CASE-01 では、終了時 HP が 85 と 80 であること、出来事が8件で上の順であること、ターンが 3 であることを確認する。もう1本は素早さだけを入れ替える。先攻がフシギダネになり、名前ではなく素早さで順が決まることを見る。終了時 HP は CASE-01 と同じ 85 と 80 である。

```sh
npm start
npm test
```

Node は TypeScript の型を取り除くだけで、enum は実行できない。起動とテストは tsx で enum を JavaScript に変換してから走らせる。

## まだやらないこと

本格的なダメージ計算、技の優先度、同速、命中と回避、急所、タイプ相性、状態異常、特性、持ち物、追加効果、ひんし、交代、天候は、このステップのモデルに置いていない。

購読やハンドラも作っていない。発動タイミングごとの処理は、特性と持ち物を扱う段階で足す。
