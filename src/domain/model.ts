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

export type Pokemon = {
  id: string;
  name: string;
  hp: number;
  speed: number;
};

export type Battle = {
  turn: number;
  pokemon: [Pokemon, Pokemon];
};

export type AttackAction = {
  kind: ActionKind;
  damage: number;
};

export type Actions = Record<string, AttackAction>;

export type BattleEvent =
  | { type: BattleEventType.TurnStarted; turn: number }
  | { type: BattleEventType.ActionsSelected; actions: Actions }
  | { type: BattleEventType.ActionOrderDetermined; first: string; second: string }
  | { type: BattleEventType.MoveUsed; actor: string }
  | {
      type: BattleEventType.DamageApplied;
      target: string;
      damage: number;
      hpAfter: number;
    }
  | { type: BattleEventType.TurnEnded; turn: number };

export type TurnResult = {
  battle: Battle;
  events: BattleEvent[];
};
