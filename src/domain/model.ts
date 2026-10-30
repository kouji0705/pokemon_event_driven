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
  kind: "attack";
  damage: number;
};

export type Actions = Record<string, AttackAction>;

export type BattleEvent =
  | { type: "TurnStarted"; turn: number }
  | { type: "ActionsSelected"; actions: Actions }
  | { type: "ActionOrderDetermined"; first: string; second: string }
  | { type: "MoveUsed"; actor: string }
  | {
      type: "DamageApplied";
      target: string;
      damage: number;
      hpAfter: number;
    }
  | { type: "TurnEnded"; turn: number };

export type TurnResult = {
  battle: Battle;
  events: BattleEvent[];
};
