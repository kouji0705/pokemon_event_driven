import type { Actions, Battle, BattleEvent, Pokemon, TurnResult } from "./model.ts";
import { orderBySpeed } from "./orderBySpeed.ts";

export function runTurn(battle: Battle, actions: Actions): TurnResult {
  const next = copyBattle(battle);
  const events: BattleEvent[] = [];

  events.push({ type: "TurnStarted", turn: next.turn });
  events.push({ type: "ActionsSelected", actions: copyActions(actions) });

  const [first, second] = orderBySpeed(next.pokemon[0], next.pokemon[1]);
  events.push({
    type: "ActionOrderDetermined",
    first: first.id,
    second: second.id,
  });

  executeAttack(first, second, actions[first.id].damage, events);
  executeAttack(second, first, actions[second.id].damage, events);

  events.push({ type: "TurnEnded", turn: next.turn });
  next.turn += 1;

  return { battle: next, events };
}

function executeAttack(
  actor: Pokemon,
  target: Pokemon,
  damage: number,
  events: BattleEvent[],
): void {
  events.push({ type: "MoveUsed", actor: actor.id });
  target.hp -= damage;
  events.push({
    type: "DamageApplied",
    target: target.id,
    damage,
    hpAfter: target.hp,
  });
}

function copyBattle(battle: Battle): Battle {
  return {
    turn: battle.turn,
    pokemon: [{ ...battle.pokemon[0] }, { ...battle.pokemon[1] }],
  };
}

function copyActions(actions: Actions): Actions {
  return Object.fromEntries(
    Object.entries(actions).map(([id, action]) => [
      id,
      { kind: action.kind, damage: action.damage },
    ]),
  );
}
