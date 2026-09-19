// Shared singleton for phone-controller input. The desktop's WebSocket (in BroadcastApp)
// writes into this; BabylonStage's render loop reads it each frame and merges it with the
// keyboard. A plain module object avoids prop-drilling a high-frequency input stream
// through React (which would re-render 30×/sec).
export const remoteInput = {
  connected: false, // a phone controller is paired
  active: false, // the stick is currently pushed (vs resting)
  mx: 0, // stick x, -1..1 (right positive)
  my: 0, // stick y, -1..1 (up positive)
  shootEdge: false, // one-shot: shoot pressed since last frame
  shootPower: 1, // 0..1 power of that shot (from hold duration)
  passEdge: false, // one-shot: pass/tackle pressed since last frame
  sprint: false, // held: sprint boost while true
  jockey: false, // held: contain/jockey while defending
  throughEdge: false, // one-shot: driven through-ball
  switchEdge: false, // one-shot: switch controlled player
};

export function resetRemoteInput() {
  remoteInput.active = false;
  remoteInput.mx = 0;
  remoteInput.my = 0;
  remoteInput.shootEdge = false;
  remoteInput.passEdge = false;
  remoteInput.sprint = false;
  remoteInput.jockey = false;
  remoteInput.throughEdge = false;
  remoteInput.switchEdge = false;
}
