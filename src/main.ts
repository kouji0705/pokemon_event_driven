import {
  ActionKind,
  BattleEventType,
  type Actions,
  type Battle,
  type BattleEvent,
} from "./domain/model.ts";
import { runTurn } from "./domain/runTurn.ts";

const battle: Battle = {
  turn: 2,
  pokemon: [
    { id: "pikachu", name: "ピカチュウ", hp: 100, speed: 90 },
    { id: "bulbasaur", name: "フシギダネ", hp: 100, speed: 45 },
  ],
};

const actions: Actions = {
  pikachu: { kind: ActionKind.Attack, damage: 20 },
  bulbasaur: { kind: ActionKind.Attack, damage: 15 },
};

const result = runTurn(battle, actions);

printBattle("開始", battle);
console.log("");
for (const [index, event] of result.events.entries()) {
  console.log(`${index + 1}. ${describe(event, battle)}`);
}
console.log("");
printBattle("終了", result.battle);

function printBattle(label: string, current: Battle): void {
  console.log(`${label}  ターン ${current.turn}`);
  for (const pokemon of current.pokemon) {
    console.log(`  ${pokemon.name}  HP ${pokemon.hp}  素早さ ${pokemon.speed}`);
  }
}

function describe(event: BattleEvent, current: Battle): string {
  switch (event.type) {
    case BattleEventType.TurnStarted:
      return `${event.type}  ${event.turn}ターン目開始`;
    case BattleEventType.ActionsSelected:
      return `${event.type}  ${Object.entries(event.actions)
        .map(([id, action]) => `${nameOf(current, id)}の攻撃 ${action.damage}`)
        .join("、")}`;
    case BattleEventType.ActionOrderDetermined:
      return `${event.type}  先攻 ${nameOf(current, event.first)}、後攻 ${nameOf(current, event.second)}`;
    case BattleEventType.MoveUsed:
      return `${event.type}  ${nameOf(current, event.actor)}が技を使用`;
    case BattleEventType.DamageApplied:
      return `${event.type}  ${nameOf(current, event.target)}のHPが ${event.damage} 減り、${event.hpAfter}`;
    case BattleEventType.TurnEnded:
      return `${event.type}  ${event.turn}ターン目終了`;
  }
}

function nameOf(current: Battle, id: string): string {
  return current.pokemon.find((pokemon) => pokemon.id === id)?.name ?? id;
}
