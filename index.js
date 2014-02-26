var createAudioNode = require('custom-audio-node')

module.exports = Dipper

function Dipper(audioContext){
  var dipper = initializeMasterDipper(audioContext)
  var input = audioContext.createGain()

  var to = audioContext.createGain()
  var from = audioContext.createGain()

  input.connect(to)
  dipper.connect(from)

  var node = createAudioNode(input, input, {
    ratio: {
      defaultValue: 1, min: 0,
      targets: [from.gain, to.gain]
    }
  })

  var mode = null
  var ratio = null

  Object.defineProperty(node, 'mode', {
    get: function(){ return mode },
    set: function(value){
      if (value !== mode){
        if (value === 'source'){
          from.disconnect()
          to.connect(dipper)
        } else {
          to.disconnect()
          from.connect(input.gain)
        }
        mode = value
      }
    }
  })

  node.mode = 'source'

  return node
}

function initializeMasterDipper(context){
  if (!context.globalDipperProcessor){
    context.globalDipperProcessor = context.createScriptProcessor(1024*2, 2, 1)
    var lastValue = 0
    var targetValue = 0

    context.globalDipperProcessor.onaudioprocess = function(e){

      var inputLength = e.inputBuffer.length
      var outputLength = e.inputBuffer.length
      var inputL = e.inputBuffer.getChannelData(0)
      var inputR = e.inputBuffer.getChannelData(1)
      var output = e.outputBuffer.getChannelData(0)

      var rms = 0;
      targetValue = 0

      for (var i=0;i<inputLength;i++){
        targetValue += (Math.abs(inputL[i]) + Math.abs(inputR[i])) / 2
      }

      targetValue = (targetValue / inputLength) * 2

      for (var i=0;i<outputLength;i++){
        var difference = lastValue - targetValue
        if (difference > 0){
          lastValue = lastValue - difference * 0.001 // release
        } else {
          lastValue = lastValue - difference * 0.001 // attack
        }
        output[i] = Math.max(-1, -lastValue)
      }

    }

    var pump = context.createGain()
    pump.gain.value = 0
    pump.connect(context.destination)
    context.globalDipperProcessor.connect(pump)

  }
  return context.globalDipperProcessor
}