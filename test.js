var Dipper = require('./index')

var audioContext = new webkitAudioContext()


var sourceDipper = Dipper(audioContext)
sourceDipper.mode = 'source'
sourceDipper.gain.value = 0.2

var sidechainDipper = Dipper(audioContext)
sidechainDipper.mode = 'modulate'
sidechainDipper.gain.value = 0.2

sourceDipper.connect(audioContext.destination)
sidechainDipper.connect(audioContext.destination)

var up = null

var background = audioContext.createOscillator()
background.type = 'sawtooth'
background.connect(sidechainDipper)
background.start()

addSlider(sidechainDipper.ratio, 0.01, 0, 10)
addSlider(sourceDipper.ratio, 0.01, 0, 10)

addButton('trigger source', function(){
  var source = audioContext.createOscillator()
  source.type = 'square'
  source.detune.value = -2400
  source.connect(sourceDipper)
  source.start()

  up = function(){
    source.stop()
  }

}, function(){
  up&&up()
})

function addButton(name, down, up){
  var button = document.createElement('button')
  button.onmousedown = down
  button.onmouseup = up
  button.textContent = name
  document.body.appendChild(button)
}

function addSlider(param, step, min, max){
  var container = document.createElement('div')
  container.appendChild(document.createTextNode(param.name))
  var label = document.createTextNode(param.defaultValue)
  var slider = document.createElement('input')
  slider.type = 'range'
  slider.min = min != null ? min : (param.min || 0)
  slider.max = max != null ? max : (param.max || 100)
  slider.value = param.defaultValue

  slider.style.width = '300px'

  if (step){
    slider.step = step
  }

  slider.onchange = function(){
    label.data = this.value
    param.value = parseFloat(this.value)
  }
  container.appendChild(slider)
  container.appendChild(label)
  document.body.appendChild(container)
}