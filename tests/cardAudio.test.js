import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
const code = (await readFile(new URL('../src/lib/cardAudio.js', import.meta.url), 'utf8')).replace('export function', 'function');
const flush = () => new Promise(resolve => setImmediate(resolve));
function setup({ failed = false, pending = false, audioSession } = {}) {
  const nodes = [];
  const requests = [];
  const waiting = [];
  const document = { timeline: { currentTime: 1000 } };
  let context;
  class AudioContext {
    state = 'suspended';
    currentTime = 5;
    destination = {};
    constructor() { context = this; }
    resume() { this.state = 'running'; return Promise.resolve(); }
    addEventListener(_name, fn) { this.change = fn; }
    decodeAudioData(bytes) { return Promise.resolve({ duration: 0.9, src: bytes }); }
    createBufferSource() {
      const node = { connect() {}, disconnect() { this.disconnected = true; }, start(when, offset) { this.when = when; this.offset = offset; }, stop() { this.stopped = true; } };
      nodes.push(node); return node;
    }
  }
  const sandbox = vm.createContext({ window: { AudioContext, navigator: { audioSession } }, document, fetch: (src) => {
    requests.push(src);
    const response = { ok: !failed, arrayBuffer: () => Promise.resolve(src) };
    return pending ? new Promise(resolve => waiting.push(() => resolve(response))) : Promise.resolve(response);
  } });
  vm.runInContext(code, sandbox);
  const audio = sandbox.createCardAudio();
  return { audio, nodes, requests, document, get context() { return context; }, load() { waiting.forEach(resolve => resolve()); } };
}

test('intro stays silent; mapped clips are scheduled at their choreography cues', async () => {
  const h = setup();
  await flush();
  assert.equal(h.audio.canPlay(), false);
  h.audio.play(0, 1000);
  await flush();
  assert.equal(h.nodes.length, 0);
  h.audio.unlock();
  assert.equal(h.audio.canPlay(), true);
  for (const [index, file, at] of [[0, 'fan', .5], [1, 'riffle', 1.24], [2, 'hindu', .936]]) {
    h.audio.play(index, 1000);
    await flush();
    const node = h.nodes.at(-1);
    assert.equal(node.buffer.src, `/audio/cards/${file}.wav`);
    assert.equal(node.when, 5 + at);
    assert.equal(node.offset, 0);
  }
  assert.ok(h.nodes.slice(0, -1).every(node => node.stopped));
});

test('gesture selects the iOS playback session; unsupported policies still unlock', async () => {
  const audioSession = { type: 'auto' };
  const h = setup({ audioSession });
  await flush();
  assert.equal(audioSession.type, 'auto');
  h.audio.unlock();
  assert.equal(audioSession.type, 'playback');
  assert.equal(h.nodes.length, 0);
  const blocked = setup({ audioSession: { set type(value) { throw new Error('Unsupported'); } } });
  await flush();
  blocked.audio.unlock();
  blocked.audio.play(0, 1000);
  await flush();
  assert.equal(blocked.nodes.length, 1);
});

test('scheduled and playing audio stop when the shuffle cancels', async () => {
  const h = setup(); await flush(); h.audio.unlock();
  h.audio.play(1, 1000); await flush(); h.audio.stop();
  assert.equal(h.nodes[0].stopped, true);
  assert.equal(h.nodes[0].disconnected, true);
});

test('a cancelled load cannot start audio later', async () => {
  const h = setup({ pending: true }); h.audio.unlock(); h.audio.play(0, 1000);
  h.audio.stop(); h.load(); await flush();
  assert.equal(h.nodes.length, 0);
});

test('late decode is skipped rather than playing out of sync', async () => {
  const h = setup({ pending: true }); h.audio.unlock(); h.audio.play(0, 1000);
  h.document.timeline.currentTime = 2000; h.load(); await flush();
  assert.equal(h.nodes.length, 0);
});

test('missing audio remains silent and interruption requires a new play request', async () => {
  const failed = setup({ failed: true }); failed.audio.unlock(); failed.audio.play(0, 1000); await flush();
  assert.equal(failed.nodes.length, 0);
  const h = setup(); await flush(); h.audio.unlock(); h.audio.play(0, 1000); await flush();
  h.context.state = 'interrupted'; h.context.change();
  assert.equal(h.audio.canPlay(), false);
  assert.equal(h.nodes[0].stopped, true);
  h.audio.unlock(); await flush();
  assert.equal(h.nodes.length, 1);
  h.audio.play(2, 1000); await flush();
  assert.equal(h.nodes.length, 2);
});
