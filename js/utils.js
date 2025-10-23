
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}


function getRandomIntInclusive(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}


/////////////////////////////////////////////////////

var gStartTime
var gTimerInterval
var ms = 31

function startTimer() {
  gStartTime = Date.now()
  gTimerInterval = setInterval(updateTimer, ms)
}

function updateTimer() {
  var elapsed = Date.now() - gStartTime

  var minutes = Math.floor(elapsed / 60000)
  var seconds = Math.floor((elapsed % 60000) / 1000)
  var hundredths = Math.floor((elapsed % 1000) / 10) 

  var formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(hundredths).padStart(2, '0')}`
  document.querySelector('.timer').innerText = formatted

  gGame.secsPassed = elapsed / 1000
}

function stopTimer() {
  clearInterval(gTimerInterval)
}


////////////////////////////////////////////////////////