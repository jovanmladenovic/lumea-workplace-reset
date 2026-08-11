// Ambient-layer engagement counter — three aggregate running totals
// (passersBy / approaches / engagements), persisted via IPC to a local JSON
// file in main.ts. No timestamps, no identity, no per-event log — matches the
// "anonymous, always" trust promise; an aggregate count is not the same thing
// as tracking a person.
//
// Deliberately NOT part of the @/services barrel — this file must stay safe to
// import statically from anywhere (it never touches window.electronAPI.env,
// unlike user-input.service.ts etc.), including the GitHub Pages preview build,
// where it simply no-ops.
export type EngagementCounter = 'passersBy' | 'approaches' | 'engagements';

export async function incrementEngagementCount(counter: EngagementCounter): Promise<void> {
  const incrementCount = window.electronAPI?.incrementCount;
  if (!incrementCount) return; // no-op outside Electron (no persistence layer to write to)

  const counts = await incrementCount(counter);
  console.log(`[engagement-counter] ${counter} ->`, counts);
}
