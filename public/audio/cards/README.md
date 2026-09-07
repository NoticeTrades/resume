# Nick's card recordings

These WAV derivatives come from Nick's supplied MP3s. Originals in Downloads were not modified. Mono, 48 kHz, 16-bit PCM avoids encoder padding at scheduled cue boundaries.

| Asset | Original | Source trim (seconds) | Tempo factor | Cue begins | Measured LUFS | True peak |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| fan.wav | Fan Cards.mp3 | 1.300–2.240 | 1.30 | 0.500s | -23.06 | -3.13 dBTP |
| riffle.wav | Shuffle.mp3 | 1.245–2.180 | 1.00 | 1.240s | -23.01 | -3.90 dBTP |
| hindu.wav | Count 4 cards.mp3 | 0.980–2.105 | 1.29 | 0.936s | -23.09 | -3.64 dBTP |

The fan cue accompanies the spreading cards. The riffle cue accompanies alternating releases. The Hindu cue's four main recorded impacts align with the four non-Joker card pulls (approximately 0.975, 1.230, 1.485 and 1.740 seconds). The Joker returns without an extra fabricated impact.

Processing: trim leading/trailing room silence, reset timestamps, pitch-preserving FFmpeg `atempo`, 3ms fade in / 12ms fade out, individual gain and a -4 dBFS sample-peak limiter with latency compensation. Measured the encoded output with FFmpeg loudnorm; all three integrated loudness values are within 0.1 LU of -23 LUFS. Limiting prevents short transients from clipping while matching perceived level. No runtime per-clip volume differences or playback-rate changes are needed.

Audio is unlocked by trusted input. The load intro is silent under autoplay policy. Decoded buffers are scheduled on Web Audio against the card animation start; failed or late loads are skipped. Cancellation, offscreen/hidden state and reduced motion stop pending and playing audio.
