// Minimal RFC 6455 server side for the dev relay (text frames only, no extensions, no `ws` dependency).
import { createHash } from 'node:crypto';

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const MAX_PAYLOAD = 2048; // protocol frames are <= 512 B inbound; anything bigger is closed with 1009

/** Completes the upgrade on `socket`. Returns { send(text), close(code), onMessage(fn), onClose(fn) } or null if refused. */
export function acceptUpgrade(req, socket) {
  const key = req.headers['sec-websocket-key'];
  if (req.headers.upgrade?.toLowerCase() !== 'websocket' || typeof key !== 'string' || req.headers['sec-websocket-version'] !== '13') {
    socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
    return null;
  }
  const accept = createHash('sha1').update(key + GUID).digest('base64');
  socket.write(['HTTP/1.1 101 Switching Protocols', 'Upgrade: websocket', 'Connection: Upgrade', 'Sec-WebSocket-Accept: ' + accept, '', ''].join('\r\n'));
  socket.setNoDelay(true);

  let msgFn = () => {};
  let closeFn = () => {};
  let closed = false;
  let buf = Buffer.alloc(0);
  let frag = null; // { opcode, parts, size }

  const frame = (opcode, payload) => {
    const n = payload.length;
    const head = n < 126 ? Buffer.from([0x80 | opcode, n]) : Buffer.from([0x80 | opcode, 126, n >> 8, n & 255]);
    return Buffer.concat([head, payload]);
  };
  const finish = () => {
    if (closed) return;
    closed = true;
    try { closeFn(); } catch { /* ignore */ }
    socket.destroy();
  };
  const sendClose = (code) => {
    if (socket.destroyed || socket.writableEnded) return;
    const p = Buffer.alloc(2);
    p.writeUInt16BE(code, 0);
    socket.end(frame(8, p));
  };

  const conn = {
    send(text) {
      if (closed || socket.destroyed || socket.writableEnded) return;
      socket.write(frame(1, Buffer.from(text, 'utf8')));
    },
    close(code = 1000) {
      sendClose(code);
      setTimeout(finish, 200).unref();
    },
    onMessage(fn) { msgFn = fn; },
    onClose(fn) { closeFn = fn; },
  };

  const fail = (code) => { sendClose(code); setTimeout(finish, 50).unref(); };

  socket.on('data', (chunk) => {
    if (closed) return;
    buf = buf.length ? Buffer.concat([buf, chunk]) : chunk;
    for (;;) {
      if (buf.length < 2) return;
      const fin = (buf[0] & 0x80) !== 0;
      const opcode = buf[0] & 0x0f;
      const masked = (buf[1] & 0x80) !== 0;
      let len = buf[1] & 0x7f;
      let off = 2;
      if (len === 126) {
        if (buf.length < 4) return;
        len = buf.readUInt16BE(2); off = 4;
      } else if (len === 127) return fail(1009);
      if (!masked) return fail(1002); // clients must mask
      if (len > MAX_PAYLOAD) return fail(1009);
      if (buf.length < off + 4 + len) return;
      const mask = buf.subarray(off, off + 4);
      const data = Buffer.from(buf.subarray(off + 4, off + 4 + len));
      for (let i = 0; i < data.length; i++) data[i] ^= mask[i & 3];
      buf = buf.subarray(off + 4 + len);

      if (opcode === 8) { sendClose(1000); setTimeout(finish, 50).unref(); return; }
      if (opcode === 9) { socket.write(frame(10, data)); continue; }
      if (opcode === 10) continue;
      if (opcode === 1 || opcode === 2) {
        if (opcode === 2) return fail(1003);
        frag = { parts: [data], size: data.length };
      } else if (opcode === 0 && frag) {
        frag.parts.push(data); frag.size += data.length;
        if (frag.size > MAX_PAYLOAD) return fail(1009);
      } else return fail(1002);
      if (fin) {
        const text = Buffer.concat(frag.parts).toString('utf8');
        frag = null;
        try { msgFn(text); } catch { /* a bad handler must not kill the socket loop */ }
      }
    }
  });
  socket.on('close', finish);
  socket.on('error', finish);
  return conn;
}
