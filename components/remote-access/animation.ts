/*
 * Animation timeline for the RemoteAccess diagram.
 *
 * Total cycle: 9s. All SMIL animations share this cycle and loop forever.
 * Inside the cycle each element fades in/out at its own keyTimes so the
 * two phases read as a sequence rather than overlapping noise. Phase 2
 * is intentionally long (5s of 9s) — that's the steady-state of the real
 * system, and we want the viewer to feel the continuous P2P traffic.
 *
 *   t = 0.0 → 0.2 : intro — everything starts dim
 *   t = 0.2 → 2.5 : PHASE 1 active — signaling paths bright, packets
 *                   flow B → C → H (offer/forward) then H → C → B
 *                   (answer/forward), mirroring an SDP+ICE exchange
 *   t = 2.5 → 3.0 : transition — signaling dims to "passive"
 *   t = 3.0 → 8.0 : PHASE 2 active — data channel bright, eight packets
 *                   stream both directions between B and H in overlapping
 *                   waves
 *   t = 8.0 → 9.0 : outro — data channel dims, ready to repeat
 *
 * All keyTimes below are normalized to this 9s window.
 */

const CYCLE_S = 9;
export const CYCLE = `${CYCLE_S}s`;

/* Phase windows expressed as normalized keyTimes for opacity tweens. */
// Signaling: bright 0.2–2.5s, passive 2.5–9s
export const SIG_KT = '0; 0.022; 0.044; 0.278; 0.333; 1';
export const SIG_OPACITY = '0.18; 0.18; 1; 1; 0.18; 0.18';
// Data channel: passive 0–2.8s, bright 3.0–8.0s, dim again
export const DATA_KT = '0; 0.311; 0.378; 0.889; 0.944; 1';
export const DATA_OPACITY = '0.2; 0.2; 1; 1; 0.2; 0.2';
// Step 1 badge: visible 0.2–2.6s
export const STEP1_KT = '0; 0.022; 0.067; 0.289; 0.333; 1';
export const STEP1_OPACITY = '0; 0; 1; 1; 0; 0';
// Step 2 badge: visible 3.0–8.1s
export const STEP2_KT = '0; 0.333; 0.378; 0.9; 0.944; 1';
export const STEP2_OPACITY = '0; 0; 1; 1; 0; 0';
