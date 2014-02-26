soundbank-dipper
===

A global side-chain compressor for the Web Audio API. Modulate the amplitude of AudioNodes based on the amplitude of other AudioNodes.

A dipper is global to the current audioContext. If you need separate dipper contexts, use `var newContext = Object.create(audioContext)`.

Intended for use as a processor in [soundbank](https://github.com/mmckegg/soundbank), but it is compatible with any Web Audio API AudioNode set up.

## Install

```bash
$ npm install soundbank-dipper
```

## API

```js
var Dipper = require('soundbank-dipper')
```

### Dipper(audioContext)

Create an AudioNode instance. In `"source"` mode, audio flows straight through, but is used to modulate the amplitude of all dipper nodes in `"modulator"` mode.

### node.mode (get/set)

Either `'source'`, or `'modulator'`. 

### node.ratio ([AudioNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode))

Amount of dip effect to apply. Defaults to `1`.

## Example

Side-chain `background` oscillator against `source`:

```js
var Dipper = require('soundbank-dipper')

var audioContext = new webkitAudioContext()

var sourceDipper = Dipper(audioContext)
sourceDipper.mode = 'source'

var sidechainDipper = Dipper(audioContext)
sidechainDipper.mode = 'modulator'

sourceDipper.connect(audioContext.destination)
sidechainDipper.connect(audioContext.destination)

var background = audioContext.createOscillator()
background.type = 'sawtooth'
background.connect(sidechainDipper)
background.start()

setInterval(function(){
  var source = audioContext.createOscillator()
  source.type = 'square'
  source.detune.value = -2400
  source.connect(sourceDipper)
  source.start()
  source.stop(audioContext.currentTime + 0.5)
}, 2000)
```
