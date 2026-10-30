import type { Pokemon } from "./model.ts";

export function orderBySpeed(a: Pokemon, b: Pokemon): [Pokemon, Pokemon] {
  if (a.speed > b.speed) {
    return [a, b];
  }
  if (b.speed > a.speed) {
    return [b, a];
  }
  throw new Error("Speed ties are not defined in STEP 01");
}
