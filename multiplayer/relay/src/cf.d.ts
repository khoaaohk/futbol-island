// Minimal Cloudflare Workers type shims (so Phase 0 needs no @cloudflare/workers-types install).
// Replace with `@cloudflare/workers-types` when the worker is first deployed (Phase 1).
export {};

declare global {
  interface DurableObjectStorage {
    get<T = unknown>(key: string): Promise<T | undefined>;
    put<T = unknown>(key: string, value: T): Promise<void>;
    delete(key: string): Promise<boolean>;
    setAlarm(scheduledTime: number): Promise<void>;
    deleteAlarm(): Promise<void>;
    getAlarm(): Promise<number | null>;
    deleteAll(): Promise<void>;
    list<T = unknown>(options?: { prefix?: string }): Promise<Map<string, T>>;
  }
  interface HibernatableWebSocket extends WebSocket {
    serializeAttachment(value: unknown): void;
    deserializeAttachment(): unknown;
  }
  interface DurableObjectState {
    readonly storage: DurableObjectStorage;
    acceptWebSocket(ws: WebSocket, tags?: string[]): void;
    getWebSockets(tag?: string): HibernatableWebSocket[];
    blockConcurrencyWhile<T>(fn: () => Promise<T>): Promise<T>;
  }
  interface DurableObjectId { toString(): string }
  interface DurableObjectStub { fetch(input: string | Request, init?: RequestInit): Promise<Response> }
  interface DurableObjectNamespace {
    idFromName(name: string): DurableObjectId;
    get(id: DurableObjectId): DurableObjectStub;
  }
  interface ExecutionContext { waitUntil(promise: Promise<unknown>): void }
  class WebSocketPair {
    0: WebSocket;
    1: WebSocket;
  }
}
