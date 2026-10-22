// parseClient / parseServer / encode. Never throw on bad input; return null.
import { C, S, LOOK_LEN, MAX_INBOUND_BYTES, PARTY_MAX, type ClientMsg, type ServerMsg, type MemberInfo, type NameIdx, type PoseBody } from './types';
import { normalizeCode } from './codes';
import { clampPose, WORLD_BOUNDS } from './limits';
import { NAME_ANIMALS, NAME_COLOURS, normalizeNick, validAnimal } from './names';

const TOKEN_RE = /^[A-Za-z0-9_-]{16,32}$/;
const MAX_SERVER_BYTES = 4096;
const MAX_INT = Number.MAX_SAFE_INTEGER;

const isInt = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n);
const inRange = (n: unknown, lo: number, hi: number): n is number => isInt(n) && n >= lo && n <= hi;
const isBit = (n: unknown): n is 0 | 1 => n === 0 || n === 1;
const isToken = (s: unknown): s is string => typeof s === 'string' && TOKEN_RE.test(s);
const isTokenOrNull = (s: unknown): boolean => s === null || isToken(s);

function utf8Len(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 0x80) n += 1;
    else if (c < 0x800) n += 2;
    else if (c >= 0xd800 && c <= 0xdbff) {
      n += 4;
      i++;
    } else n += 3;
  }
  return n;
}

function isLook(v: unknown): boolean {
  if (!Array.isArray(v) || v.length !== LOOK_LEN) return false;
  for (let i = 0; i < v.length; i++) if (!inRange(v[i], 0, 63)) return false;
  return true;
}

function isName(v: unknown): v is NameIdx {
  return Array.isArray(v) && v.length === 2 && inRange(v[0], 0, NAME_COLOURS.length - 1) && inRange(v[1], 0, NAME_ANIMALS.length - 1);
}

function isPose(v: unknown): boolean {
  return Array.isArray(v) && v.length === 8 && clampPose(v as PoseBody) !== null;
}

function isNickField(v: unknown): boolean {
  return v === null || (typeof v === 'string' && normalizeNick(v) === v);
}

function isMember(v: unknown): v is MemberInfo {
  return Array.isArray(v) && (v.length === 5 || (v.length === 6 && isNickField(v[5]))) && inRange(v[0], 0, 15) && isName(v[1]) && isLook(v[2]) && isBit(v[3]) &&
    (v[4] === null || isPose(v[4]));
}

function inBoundsXZ(x: unknown, z: unknown): boolean {
  return inRange(x, WORLD_BOUNDS.minX, WORLD_BOUNDS.maxX) && inRange(z, WORLD_BOUNDS.minZ, WORLD_BOUNDS.maxZ);
}

function parseJsonArray(raw: unknown): unknown[] | null {
  if (typeof raw !== 'string') return null;
  let v: unknown;
  try {
    v = JSON.parse(raw);
  } catch {
    return null;
  }
  return Array.isArray(v) && v.length > 0 ? v : null;
}

export function parseClient(raw: string): ClientMsg | null {
  if (typeof raw !== 'string' || raw.length > MAX_INBOUND_BYTES || utf8Len(raw) > MAX_INBOUND_BYTES) return null;
  const a = parseJsonArray(raw);
  if (!a) return null;
  switch (a[0]) {
    case C.Hello: {
      const animalOk = a.length < 6 || a[5] === null || validAnimal(a[5]);
      // nick (7th element): any string or null is accepted here and normalised; a bad name becomes null so a typo never blocks a join.
      const nickOk = a.length < 7 || a[6] === null || typeof a[6] === 'string';
      if (a.length >= 5 && a.length <= 7 && animalOk && nickOk && inRange(a[1], 0, 65535) && isLook(a[2]) &&
        isTokenOrNull(a[3]) && isTokenOrNull(a[4])) {
        if (a.length === 7) a[6] = normalizeNick(a[6]);
        return a as ClientMsg;
      }
      return null;
    }
    case C.Pose:
      if (a.length === 10 && inRange(a[1], 0, 0x7fffffff) && clampPose(a.slice(2) as PoseBody)) return a as ClientMsg;
      return null;
    case C.Emote:
      return a.length === 2 && inRange(a[1], 0, 9) ? (a as ClientMsg) : null;
    case C.Ping:
      return a.length === 4 && inRange(a[1], 0, 1) && inBoundsXZ(a[2], a[3]) ? (a as ClientMsg) : null;
    case C.Kick:
    case C.ResetName:
      return a.length === 2 && inRange(a[1], 0, 15) ? (a as ClientMsg) : null;
    case C.Lock:
      return a.length === 2 && isBit(a[1]) ? (a as ClientMsg) : null;
    case C.Rotate:
    case C.End:
    case C.Leave:
      return a.length === 1 ? (a as ClientMsg) : null;
    case C.Beat:
      return a.length === 2 && inRange(a[1], 0, MAX_INT) ? (a as ClientMsg) : null;
    default:
      return null;
  }
}

export function parseServer(raw: string): ServerMsg | null {
  if (typeof raw !== 'string' || raw.length > MAX_SERVER_BYTES) return null;
  const a = parseJsonArray(raw);
  if (!a) return null;
  switch (a[0]) {
    case S.Welcome:
      if (a.length === 8 && inRange(a[1], 0, 65535) && inRange(a[2], 0, 15) && isToken(a[3]) && inRange(a[4], 0, MAX_INT) &&
        inRange(a[5], 0, MAX_INT) && isBit(a[6]) && Array.isArray(a[7]) && a[7].length <= PARTY_MAX && a[7].every(isMember)) {
        return a as ServerMsg;
      }
      return null;
    case S.Joined:
      return a.length === 2 && isMember(a[1]) ? (a as ServerMsg) : null;
    case S.Left:
      return a.length === 3 && inRange(a[1], 0, 15) && inRange(a[2], 0, 3) ? (a as ServerMsg) : null;
    case S.Poses: {
      if (a.length < 2 || !inRange(a[1], 0, MAX_INT) || (a.length - 2) % 9 !== 0 || (a.length - 2) / 9 > 16) return null;
      for (let i = 2; i < a.length; i += 9) {
        if (!inRange(a[i], 0, 15) || !isPose(a.slice(i + 1, i + 9))) return null;
      }
      return a as ServerMsg;
    }
    case S.Emote:
      return a.length === 3 && inRange(a[1], 0, 15) && inRange(a[2], 0, 9) ? (a as ServerMsg) : null;
    case S.Ping:
      return a.length === 5 && inRange(a[1], 0, 15) && inRange(a[2], 0, 1) && inBoundsXZ(a[3], a[4]) ? (a as ServerMsg) : null;
    case S.Host:
      return a.length === 2 && inRange(a[1], 0, 15) ? (a as ServerMsg) : null;
    case S.Code:
      return a.length === 3 && typeof a[1] === 'string' && normalizeCode(a[1]) === a[1] && inRange(a[2], 0, MAX_INT)
        ? (a as ServerMsg) : null;
    case S.Ended:
      return a.length === 2 && inRange(a[1], 0, 2) ? (a as ServerMsg) : null;
    case S.Error:
      return a.length === 2 && inRange(a[1], 0, 8) ? (a as ServerMsg) : null;
    case S.Beat:
      return a.length === 2 && inRange(a[1], 0, MAX_INT) ? (a as ServerMsg) : null;
    case S.Renamed:
      return a.length === 3 && inRange(a[1], 0, 15) && a[2] === null ? (a as ServerMsg) : null;
    default:
      return null;
  }
}

/** JSON.stringify; throws if the frame is over the size cap (client messages 512 B, server messages 4 KB). */
export function encode(msg: ClientMsg | ServerMsg): string {
  const s = JSON.stringify(msg);
  const cap = (msg[0] as number) < 20 ? MAX_INBOUND_BYTES : MAX_SERVER_BYTES;
  if (utf8Len(s) > cap) throw new Error('multiplayer frame too large');
  return s;
}
