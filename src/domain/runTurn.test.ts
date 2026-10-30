import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ActionKind,
  BattleEventType,
  type Actions,
  type Battle,
  type BattleEvent,
} from "./model.ts";
import { runTurn } from "./runTurn.ts";

const case01Actions: Actions = {
  pikachu: { kind: ActionKind.Attack, damage: 20 },
  bulbasaur: { kind: ActionKind.Attack, damage: 15 },
};

function case01Battle(): Battle {
  return {
    turn: 2,
    pokemon: [
      { id: "pikachu", name: "ピカチュウ", hp: 100, speed: 90 },
      { id: "bulbasaur", name: "フシギダネ", hp: 100, speed: 45 },
    ],
  };
}

test("CASE-01: 双方の通常攻撃でターンが終了する", () => {
  const battle = case01Battle();
  const { battle: next, events } = runTurn(battle, case01Actions);

  assert.deepEqual(battle, case01Battle());
  assert.deepEqual(next, {
    turn: 3,
    pokemon: [
      { id: "pikachu", name: "ピカチュウ", hp: 85, speed: 90 },
      { id: "bulbasaur", name: "フシギダネ", hp: 80, speed: 45 },
    ],
  });
  assert.deepEqual(events, case01Events());
});

test("素早さを入れ替えると先攻が入れ替わる", () => {
  const battle = case01Battle();
  battle.pokemon[0].speed = 45;
  battle.pokemon[1].speed = 90;

  const { battle: next, events } = runTurn(battle, case01Actions);

  assert.equal(next.turn, 3);
  assert.equal(next.pokemon[0].hp, 85);
  assert.equal(next.pokemon[1].hp, 80);
  assert.deepEqual(
    events.map((event) => event.type),
    [
      BattleEventType.TurnStarted,
      BattleEventType.ActionsSelected,
      BattleEventType.ActionOrderDetermined,
      BattleEventType.MoveUsed,
      BattleEventType.DamageApplied,
      BattleEventType.MoveUsed,
      BattleEventType.DamageApplied,
      BattleEventType.TurnEnded,
    ],
  );
  assert.deepEqual(events[2], {
    type: BattleEventType.ActionOrderDetermined,
    first: "bulbasaur",
    second: "pikachu",
  });
  assert.deepEqual(events[3], { type: BattleEventType.MoveUsed, actor: "bulbasaur" });
  assert.deepEqual(events[4], {
    type: BattleEventType.DamageApplied,
    target: "pikachu",
    damage: 15,
    hpAfter: 85,
  });
  assert.deepEqual(events[5], { type: BattleEventType.MoveUsed, actor: "pikachu" });
  assert.deepEqual(events[6], {
    type: BattleEventType.DamageApplied,
    target: "bulbasaur",
    damage: 20,
    hpAfter: 80,
  });
  assert.deepEqual(events[7], { type: BattleEventType.TurnEnded, turn: 2 });
});

function case01Events(): BattleEvent[] {
  return [
    { type: BattleEventType.TurnStarted, turn: 2 },
    { type: BattleEventType.ActionsSelected, actions: case01Actions },
    {
      type: BattleEventType.ActionOrderDetermined,
      first: "pikachu",
      second: "bulbasaur",
    },
    { type: BattleEventType.MoveUsed, actor: "pikachu" },
    {
      type: BattleEventType.DamageApplied,
      target: "bulbasaur",
      damage: 20,
      hpAfter: 80,
    },
    { type: BattleEventType.MoveUsed, actor: "bulbasaur" },
    {
      type: BattleEventType.DamageApplied,
      target: "pikachu",
      damage: 15,
      hpAfter: 85,
    },
    { type: BattleEventType.TurnEnded, turn: 2 },
  ];
}
