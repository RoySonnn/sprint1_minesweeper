
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
var ms = 1000

function startTimer() {
  gStartTime = Date.now()
  gTimerInterval = setInterval(updateTimer, ms)
}

function updateTimer() {
  var seconds = Math.floor((Date.now() - gStartTime) / 1000)
  document.querySelector('.timer').innerText = seconds
  gGame.secsPassed = seconds
}

function stopTimer() {
  clearInterval(gTimerInterval)
}

////////////////////////////////////////////////////////