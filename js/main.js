'use strict'

const MINE = '💥'
const FLAG = '⚠️'
const LIVES = '🪖'
const USERLEY = '🐔'
const LOST = '🍗'
const WON = '🐣'
const WRONGFLAG = '❌'

var gLevels = [
  { name: 'Beginner', SIZE: 4, MINES: 2 },
  { name: 'Medium', SIZE: 8, MINES: 14 },
  { name: 'Expert', SIZE: 12, MINES: 32 },
  { name: 'Custom', SIZE: 10, MINES: 6 }
]

var gLevel = gLevels[0]
var gHintsCount = 3
var gIsHintMode = false
var gIsFirstClick
var gBoardSize = gLevel.SIZE
var gMineCount = gLevel.MINES
var gBoard
var gTimerInterval

var gGame = {
  isOn: false,
  revealedCount: 0,
  markedCount: 0,
  secsPassed: 0,
  lives: 0
}

function onPageLoad() {
  renderLevelButtons()
  highlightActiveButton(0)
  onInit()
}

function onInit() {
  gGame.isOn = true
  gGame.lives = 3
  gBoardSize = gLevel.SIZE
  gMineCount = gLevel.MINES
  gGame.secsPassed = 0
  gIsFirstClick = true
  gHintsCount = 3
  gIsHintMode = false
  renderHints()
  var elHints = document.querySelector('.hints')
  var elMsg = document.querySelector('.hint-msg')
  elHints.classList.add('disabled')
  elHints.classList.remove('enabled')
  elMsg.classList.remove('hidden')
  var elExterminator = document.querySelector('.exterminator-container')
  elExterminator.classList.remove('fade-out', 'used')
  var elIndicator = document.querySelector('.exterminator-indicator')
  elIndicator.classList.remove('flick')
  var elBtn = document.querySelector('.exterminator-btn')
  elBtn.disabled = false
  setSmiley(USERLEY)
  clearInterval(gTimerInterval)
  document.querySelector('.timer').innerText = '00:00:00'
  gBoard = buildBoard(gBoardSize)
  renderBoard(gBoard)
  document.querySelector('.board').style.setProperty('--board-size', gBoardSize)
  updateLivesDisplay()
  renderBestScore()
}

function buildBoard(size) {
  var board = []
  for (var i = 0; i < size; i++) {
    board[i] = []
    for (var j = 0; j < size; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isRevealed: false,
        isMine: false,
        isMarked: false
      }
    }
  }
  return board
}

function setSmiley(symbol) {
  document.querySelector('.smiley').innerText = symbol
}

function renderLevelButtons() {
  var strHTML = ''
  for (var i = 0; i < gLevels.length; i++) {
    strHTML += `<button class="level-btn" onclick="onLevelClick(${i})">${gLevels[i].name}</button>`
  }
  document.querySelector('.level-buttons').innerHTML = strHTML
}

function updateLivesDisplay() {
  var elLives = document.querySelector('.lives')
  var lives = ''
  for (var i = 0; i < gGame.lives; i++) lives += LIVES
  elLives.innerText = lives
}

function minesRandomizer(board, count, firstI, firstJ) {
  var placed = 0
  while (placed < count) {
    var i = getRandomInt(0, board.length)
    var j = getRandomInt(0, board[0].length)
    if (board[i][j].isMine || (i === firstI && j === firstJ)) continue
    board[i][j].isMine = true
    placed++
  }
}

function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      if (board[i][j].isMine) continue
      board[i][j].minesAroundCount = countNeighbors(i, j, board)
    }
  }
}

function countNeighbors(cellI, cellJ, board) {
  var count = 0
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j >= board[0].length || (i === cellI && j === cellJ)) continue
      if (board[i][j].isMine) count++
    }
  }
  return count
}

function onLevelClick(idx) {
  gLevel = gLevels[idx]
  gBoardSize = gLevel.SIZE
  gMineCount = gLevel.MINES
  highlightActiveButton(idx)
  onInit()
}

function highlightActiveButton(activeIdx) {
  var buttons = document.querySelectorAll('.level-btn')
  for (var i = 0; i < buttons.length; i++) {
    if (i === activeIdx) buttons[i].classList.add('active')
    else buttons[i].classList.remove('active')
  }
}

function onCellClicked(i, j, elCell) {
  if (!gGame.isOn) return
  var cell = gBoard[i][j]
  if (gIsHintMode) {
    revealHintArea(i, j)
    gIsHintMode = false
    gHintsCount--
    document.querySelector('.hint.active').classList.add('used')
    document.querySelector('.hint.active').classList.remove('active')
    return
  }
  if (cell.isMarked) {
    cell.isMarked = false
    gGame.markedCount--
    elCell.innerText = ''
    elCell.classList.remove('life')
  }
  if (cell.isRevealed && !cell.isMine) return
  if (gIsFirstClick && !cell.isMarked) {
    minesRandomizer(gBoard, gMineCount, i, j)
    setMinesNegsCount(gBoard)
    gIsFirstClick = false
    startTimer()
    var elHints = document.querySelector('.hints')
    var elMsg = document.querySelector('.hint-msg')
    elHints.classList.remove('disabled')
    elHints.classList.add('enabled')
    elMsg.classList.add('hidden')
  }
  if (cell.isMine) {
    gGame.lives--
    updateLivesDisplay()
    if (gGame.lives === 0) {
      gGame.isOn = false
      elCell.innerText = MINE
      elCell.classList.add('mine', 'revealed')
      gameOver(false)
      return
    }
    elCell.innerText = LIVES
    elCell.classList.add('life')
    elCell.classList.remove('revealed')
    setTimeout(function () {
      if (!cell.isMarked && gGame.isOn) {
        elCell.innerText = ''
        elCell.classList.remove('life')
        cell.isRevealed = false
      }
    }, 800)
    return
  }
  if (cell.isRevealed) return
  cell.isRevealed = true
  gGame.revealedCount++
  elCell.classList.add('revealed')
  if (cell.minesAroundCount > 0) elCell.innerText = cell.minesAroundCount
  else {
    elCell.innerText = ''
    expandReveal(i, j, gBoard)
  }
  checkVictory()
}

function onCellMarked(i, j, elCell) {
  if (!gGame.isOn) return
  var cell = gBoard[i][j]
  if (cell.isRevealed) return
  elCell.classList.remove('life')
  if (elCell.innerText === LIVES) elCell.innerText = ''
  cell.isMarked = !cell.isMarked
  elCell.innerText = cell.isMarked ? FLAG : ''
  gGame.markedCount += cell.isMarked ? 1 : -1
  checkVictory()
}

function onHintClick(elHint) {
  if (gIsHintMode || gHintsCount === 0) return
  gIsHintMode = true
  elHint.classList.add('active')
}

function renderBoard(board) {
  var strHTML = ''
  for (var i = 0; i < gBoardSize; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var cell = board[i][j]
      var content = cell.isMine ? MINE : cell.minesAroundCount
      var showContent = cell.isRevealed ? content : ''
      strHTML += `<div class="cell" data-i="${i}" data-j="${j}"
                  onclick="onCellClicked(${i}, ${j}, this)"
                  oncontextmenu="onCellMarked(${i}, ${j}, this)">${showContent}</div>`
    }
  }
  document.querySelector('.board').innerHTML = strHTML
}

function expandReveal(cellI, cellJ, board) {
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j >= board[0].length || (i === cellI && j === cellJ)) continue
      var cell = board[i][j]
      if (cell.isRevealed || cell.isMarked || cell.isMine) continue
      cell.isRevealed = true
      gGame.revealedCount++
      var elNeighbor = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
      elNeighbor.classList.add('revealed')
      if (cell.minesAroundCount > 0) elNeighbor.innerText = cell.minesAroundCount
      else {
        elNeighbor.innerText = ''
        expandReveal(i, j, board)
      }
    }
  }
  checkVictory()
}

function renderHints() {
  var strHTML = ''
  for (var i = 0; i < gHintsCount; i++) strHTML += `<span class="hint" onclick="onHintClick(this)">🔍</span>`
  document.querySelector('.hints').innerHTML = strHTML
}

function revealHintArea(cellI, cellJ) {
  var revealed = []
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j >= gBoard[0].length) continue
      var cell = gBoard[i][j]
      var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
      var wasMarked = cell.isMarked
      if (!cell.isRevealed) {
        elCell.classList.add('revealed')
        if (cell.isMine) elCell.innerText = MINE
        else if (cell.minesAroundCount > 0) elCell.innerText = cell.minesAroundCount
        else elCell.innerText = ''
        revealed.push({ i, j, wasMarked })
      }
    }
  }
  setTimeout(function () {
    for (var k = 0; k < revealed.length; k++) {
      var pos = revealed[k]
      var cell = gBoard[pos.i][pos.j]
      var elCell = document.querySelector(`[data-i="${pos.i}"][data-j="${pos.j}"]`)
      if (!cell.isRevealed) {
        elCell.classList.remove('revealed')
        elCell.innerText = pos.wasMarked ? FLAG : ''
      }
    }
  }, 1500)
}

function revealAllMines() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      var cell = gBoard[i][j]
      var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
      if (cell.isMine) {
        elCell.innerText = MINE
        elCell.classList.add('mine', 'revealed')
      } else if (cell.isMarked && !cell.isMine) {
        elCell.innerText = WRONGFLAG
        elCell.classList.add('revealed', 'wrong-flag')
      }
    }
  }
}

function revealAllSafeCells() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      var cell = gBoard[i][j]
      var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
      if (!cell.isMine) {
        if (!cell.isRevealed) gGame.revealedCount++
        cell.isRevealed = true
        elCell.classList.add('revealed')
        elCell.innerText = cell.minesAroundCount > 0 ? cell.minesAroundCount : ''
      } else {
        elCell.innerText = FLAG
        elCell.classList.add('revealed', 'flagged-win')
      }
    }
  }
}

function checkVictory() {
  if (!gGame.isOn || gIsFirstClick) return
  var totalCells = gBoardSize ** 2
  var mines = 0
  var revealed = 0
  var marked = 0
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      var cell = gBoard[i][j]
      if (cell.isMine) mines++
      if (cell.isRevealed) revealed++
      if (cell.isMarked) marked++
    }
  }
  var safeCells = totalCells - mines
  if (revealed >= safeCells) {
    revealAllSafeCells()
    gameOver(true)
  }
}

function gameOver(isWin) {
  gGame.isOn = false
  stopTimer()
  setSmiley(isWin ? WON : LOST)
  updateBestScore(isWin)
  renderBestScore()
  if (isWin) {
    for (var i = 0; i < gBoard.length; i++) {
      for (var j = 0; j < gBoard[0].length; j++) {
        var cell = gBoard[i][j]
        var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
        if (cell.isMine && cell.isMarked) elCell.classList.add('flagged-win')
        else if (cell.isMine && !cell.isMarked) {
          elCell.innerText = FLAG
          elCell.classList.add('revealed', 'flagged-win')
        }
      }
    }
  } else revealAllMines()
}

function onUserleyClick() {
  onInit()
}

function updateBestScore(isWin) {
  if (!isWin) return
  var key = `bestScore_${gLevel.name}`
  var best = localStorage.getItem(key)
  var current = Math.floor(gGame.secsPassed * 1000)
  if (!current || current <= 0 || !isFinite(current)) return
  if (!best || current < Number(best)) localStorage.setItem(key, String(current))
}

function renderBestScore() {
  var key = `bestScore_${gLevel.name}`
  var best = localStorage.getItem(key)
  var elBest = document.querySelector('.best-score')
  if (!best || Number(best) <= 0 || !isFinite(Number(best))) {
    elBest.innerText = 'Best: 00:00:00'
    return
  }
  var t = Number(best)
  var m = Math.floor(t / 60000)
  var s = Math.floor((t % 60000) / 1000)
  var h = Math.floor((t % 1000) / 10)
  elBest.innerText = `Best: ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(h).padStart(2, '0')}`
}

function onExterminateClick() {
  if (!gGame.isOn || gIsFirstClick) return
  var elIndicator = document.querySelector('.exterminator-indicator')
  var elContainer = document.querySelector('.exterminator-container')
  var elBtn = document.querySelector('.exterminator-btn')
  elBtn.disabled = true
  elIndicator.classList.add('flick')
  setTimeout(function () {
    var mines = []
    for (var i = 0; i < gBoard.length; i++) {
      for (var j = 0; j < gBoard[0].length; j++) {
        var cell = gBoard[i][j]
        if (cell.isMine && !cell.isRevealed) mines.push({ i, j })
      }
    }
    var toRemove = Math.min(3, mines.length)
    for (var k = 0; k < toRemove; k++) {
      var idx = getRandomInt(0, mines.length)
      var pos = mines.splice(idx, 1)[0]
      gBoard[pos.i][pos.j].isMine = false
    }
    gMineCount = Math.max(0, gMineCount - toRemove)
    setMinesNegsCount(gBoard)
    for (var i = 0; i < gBoard.length; i++) {
      for (var j = 0; j < gBoard[0].length; j++) {
        var cell = gBoard[i][j]
        if (cell.isRevealed && !cell.isMine) {
          var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
          elCell.innerText = cell.minesAroundCount > 0 ? cell.minesAroundCount : ''
        }
      }
    }
    if (gMineCount === 0) {
      revealAllSafeCells()
      gameOver(true)
      return
    }
    elContainer.classList.add('fade-out')
    setTimeout(() => elContainer.classList.add('used'), 600)
  }, 1500)
}

document.addEventListener('contextmenu', event => event.preventDefault())

