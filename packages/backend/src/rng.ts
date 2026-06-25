/**
 * Linear Congruential Generator (LCG) with Numerical Recipes parameters.
 * Produces uniformly-distributed floats in [0, 1). When no seed is provided a
 * random starting state is chosen so the sequence is non-deterministic.
 *
 * Modulus 2^31, multiplier 1_664_525, increment 1_013_904_223 (Knuth / NR).
 * Full-period per the Hull-Dobell theorem: increment is odd, multiplier-1
 * is divisible by 4 and by every prime factor of the modulus.
 */

const MODULUS = 2_147_483_648; // 2^31
const MULTIPLIER = 1_664_525;
const INCREMENT = 1_013_904_223;

export function makeRng(seed?: number): () => number {
  let s = (seed ?? Math.floor(Math.random() * MODULUS)) % MODULUS;
  return (): number => {
    s = (s * MULTIPLIER + INCREMENT) % MODULUS;
    return s / MODULUS;
  };
}
