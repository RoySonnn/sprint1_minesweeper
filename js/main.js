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

var gBoard
var gBoardSize = gLevel.SIZE

var gMineCount = gLevel.MINES       
var gRoundMineCount = 0             

var gHintsCount = 3
var gIsHintMode = false

var gIsFirstClick = true

var gTimerInterval
var gExterminatorUsed = false

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
  gRoundMineCount = gMineCount          
  gGame.secsPassed = 0
  gIsFirstClick = true
  gHintsCount = 3
  gIsHintMode = false
  gGame.markedCount = 0
  gGame.revealedCount = 0
  gExterminatorUsed = false

  renderHints()
  disableTools(true)
  setSmiley(USERLEY)
  clearInterval(gTimerInterval)
  document.querySelector('.timer').innerText = '00:00:00'
  updateLivesDisplay()
  renderBestScore()

  const elEx = document.querySelector('.exterminator-container')
  const elBtn = document.querySelector('.exterminator-btn')
  const elInd = document.querySelector('.exterminator-indicator')
  elEx.classList.remove('fade-out', 'used')
  elBtn.classList.remove('used', 'disabled')
  elBtn.disabled = true
  elBtn.style.pointerEvents = 'none'
  elInd.classList.remove('hidden', 'flick')

  gBoard = buildBoard(gBoardSize)
  renderBoard(gBoard)

  document
    .querySelector('.board')
    .style.setProperty('--board-size', gBoardSize)

  updateFlagCounter()
}


function buildBoard(size) {
  const board = []
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

function minesRandomizer(board, count, firstI, firstJ) {
  var placed = 0
  while (placed < count) {
    const i = getRandomInt(0, board.length)
    const j = getRandomInt(0, board[0].length)
    if (board[i][j].isMine) continue
    if (i === firstI && j === firstJ) continue
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

function countNeighbors(ci, cj, board) {
  var count = 0
  for (var i = ci - 1; i <= ci + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = cj - 1; j <= cj + 1; j++) {
      if (j < 0 || j >= board[0].length) continue
      if (i === ci && j === cj) continue
      if (board[i][j].isMine) count++
    }
  }
  return count
}


function renderBoard(board) {
  var strHTML = ''
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      strHTML += `<div class="cell" data-i="${i}" data-j="${j}"
        onclick="onCellClicked(${i},${j},this)"
        oncontextmenu="onCellMarked(${i},${j},this)"></div>`
    }
  }
  document.querySelector('.board').innerHTML = strHTML
}

function renderHints() {
  var strHTML = ''
  for (var i = 0; i < gHintsCount; i++) {
    strHTML += `<span class="hint" onclick="onHintClick(this)">🔍</span>`
  }
  document.querySelector('.hints').innerHTML = strHTML
}

function updateLivesDisplay() {
  const elLives = document.querySelector('.lives')
  var livesStr = ''
  for (var i = 0; i < gGame.lives; i++) livesStr += LIVES
  elLives.innerText = livesStr
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

function highlightActiveButton(activeIdx) {
  const buttons = document.querySelectorAll('.level-btn')
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].classList.toggle('active', i === activeIdx)
  }
}


function updateFlagCounter() {
  const elCounter = document.querySelector('.flags-counter')
  const remaining = gRoundMineCount - gGame.markedCount
  const sign = remaining < 0 ? '-' : ''
  const absVal = Math.abs(remaining)
  elCounter.innerText = '⚠️' + sign + String(absVal).padStart(2, '0')
}

function updateFlagCounterAtEnd() {
  const elCounter = document.querySelector('.flags-counter')
  const finalMinesLeft = Math.max(0, gRoundMineCount)
  elCounter.innerText = '⚠️' + String(finalMinesLeft).padStart(2, '0')
}


function disableTools(isDisabled) {
  const elHints = document.querySelector('.hints')
  const elMsg = document.querySelector('.hint-msg')
  const elBtn = document.querySelector('.exterminator-btn')

  if (isDisabled) {
    elHints.classList.add('disabled')
    elMsg.classList.remove('hidden')
    elBtn.disabled = true
    elBtn.classList.add('disabled')
    elBtn.style.pointerEvents = 'none'
  } else {
    elHints.classList.remove('disabled')
    elMsg.classList.add('hidden')
    elBtn.disabled = false
    elBtn.classList.remove('disabled')
    elBtn.style.pointerEvents = 'auto'
  }
}


function onCellClicked(i, j, elCell) {
  if (!gGame.isOn) return
  const cell = gBoard[i][j]

  if (gIsHintMode) {
    revealHintArea(i, j)
    gIsHintMode = false
    gHintsCount--
    const activeHint = document.querySelector('.hint.active')
    if (activeHint) {
      activeHint.classList.add('used')
      activeHint.classList.remove('active')
    }
    return
  }

  if (gIsFirstClick) {
    if (cell.isMarked) {
      cell.isMarked = false
      gGame.markedCount--
      elCell.innerText = ''
      updateFlagCounter()
    }

    minesRandomizer(gBoard, gMineCount, i, j)
    setMinesNegsCount(gBoard)

    gIsFirstClick = false
    disableTools(false)
    startTimer()

    const elBtn = document.querySelector('.exterminator-btn')
    elBtn.disabled = false
    elBtn.style.pointerEvents = 'auto'
  } else {
    if (cell.isMarked) {
      cell.isMarked = false
      gGame.markedCount--
      elCell.innerText = ''
      updateFlagCounter()
    }
  }

  if (cell.isMine) {
    gGame.lives--
    updateLivesDisplay()

    if (gGame.lives <= 0) {
      elCell.innerText = MINE
      elCell.classList.add('mine', 'revealed')
      gameOver(false)
    } else {
      elCell.innerText = LIVES
      elCell.classList.add('life')
      elCell.classList.remove('revealed')
      setTimeout(() => {
        if (!cell.isMarked && gGame.isOn) {
          elCell.innerText = ''
          elCell.classList.remove('life')
          cell.isRevealed = false
        }
      }, 800)
    }
    return
  }

  if (cell.isRevealed) return

  cell.isRevealed = true
  gGame.revealedCount++
  elCell.classList.add('revealed')
  elCell.innerText = cell.minesAroundCount > 0 ? cell.minesAroundCount : ''

  if (cell.minesAroundCount === 0) {
    expandReveal(i, j, gBoard)
  }

  checkVictory()
}

function onCellMarked(i, j, elCell) {
  if (!gGame.isOn) return
  const cell = gBoard[i][j]
  if (cell.isRevealed) return

  cell.isMarked = !cell.isMarked
  if (cell.isMarked) {
    gGame.markedCount++
    elCell.innerText = FLAG
  } else {
    gGame.markedCount--
    elCell.innerText = ''
  }

  updateFlagCounter()
  checkVictory()
}


function expandReveal(ci, cj, board) {
  for (var i = ci - 1; i <= ci + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = cj - 1; j <= cj + 1; j++) {
      if (j < 0 || j >= board[0].length) continue
      if (i === ci && j === cj) continue

      const cell = board[i][j]
      if (cell.isRevealed || cell.isMarked || cell.isMine) continue

      cell.isRevealed = true
      gGame.revealedCount++

      const elN = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
      elN.classList.add('revealed')
      elN.innerText = cell.minesAroundCount > 0 ? cell.minesAroundCount : ''

      if (cell.minesAroundCount === 0) {
        expandReveal(i, j, board)
      }
    }
  }
}


function onHintClick(elHint) {
  if (gIsHintMode || gHintsCount === 0) return
  gIsHintMode = true
  elHint.classList.add('active')
}

function revealHintArea(cellI, cellJ) {
  const revealedTemp = []

  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j >= gBoard[0].length) continue

      const cell = gBoard[i][j]
      const elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)

      const wasMarked = cell.isMarked
      if (!cell.isRevealed) {
        elCell.classList.add('revealed')
        if (cell.isMine) elCell.innerText = MINE
        else if (cell.minesAroundCount > 0) elCell.innerText = cell.minesAroundCount
        else elCell.innerText = ''
        revealedTemp.push({ i, j, wasMarked })
      }
    }
  }

  setTimeout(() => {
    for (var k = 0; k < revealedTemp.length; k++) {
      const pos = revealedTemp[k]
      const cell = gBoard[pos.i][pos.j]
      const elCell = document.querySelector(`[data-i="${pos.i}"][data-j="${pos.j}"]`)
      if (!cell.isRevealed) {
        elCell.classList.remove('revealed')
        elCell.innerText = pos.wasMarked ? FLAG : ''
      }
    }
  }, 1500)
}


function checkVictory() {
  if (!gGame.isOn || gIsFirstClick) return

  const totalCells = gBoardSize ** 2
  const safeCellsToReveal = totalCells - gRoundMineCount

  if (gGame.revealedCount >= safeCellsToReveal) {
    revealAllSafeCells()
    gameOver(true)
  }
}

function revealAllSafeCells() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      const cell = gBoard[i][j]
      const elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
      if (!cell.isMine) {
        if (!cell.isRevealed) {
          gGame.revealedCount++
          cell.isRevealed = true
        }
        elCell.classList.add('revealed')
        elCell.innerText = cell.minesAroundCount > 0 ? cell.minesAroundCount : ''
      } else {
        elCell.innerText = FLAG
        elCell.classList.add('revealed', 'flagged-win')
      }
    }
  }
}

function revealAllMines() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      const cell = gBoard[i][j]
      const elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
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

function gameOver(isWin) {
  gGame.isOn = false
  stopTimer()
  updateFlagCounterAtEnd()
  setSmiley(isWin ? WON : LOST)

  if (isWin) {
    updateBestScore(true)
    renderBestScore()
  } else {
    revealAllMines()
  }
}


function updateBestScore(isWin) {
  if (!isWin) return
  const key = `bestScore_${gLevel.name}`
  const best = localStorage.getItem(key)
  const current = Math.floor(gGame.secsPassed * 1000)
  if (!current || current <= 0 || !isFinite(current)) return
  if (!best || current < Number(best)) {
    localStorage.setItem(key, String(current))
  }
}

function renderBestScore() {
  const key = `bestScore_${gLevel.name}`
  const best = localStorage.getItem(key)
  const elBest = document.querySelector('.best-score')

  if (!best || Number(best) <= 0 || !isFinite(Number(best))) {
    elBest.innerText = 'Best: 00:00:00'
    return
  }

  const t = Number(best)
  const m = Math.floor(t / 60000)
  const s = Math.floor((t % 60000) / 1000)
  const h = Math.floor((t % 1000) / 10)

  elBest.innerText = `Best: ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(h).padStart(2, '0')}`
}


function onLevelClick(idx) {
  gLevel = gLevels[idx]
  gBoardSize = gLevel.SIZE
  gMineCount = gLevel.MINES
  highlightActiveButton(idx)
  onInit()
}

function onUserleyClick() {
  onInit()
}


function onExterminateClick() {
  if (!gGame.isOn || gIsFirstClick || gExterminatorUsed) return
  gExterminatorUsed = true

  const elIndicator = document.querySelector('.exterminator-indicator')
  const elContainer = document.querySelector('.exterminator-container')
  const elBtn = document.querySelector('.exterminator-btn')

  elBtn.disabled = true
  elBtn.classList.add('used')
  elBtn.style.pointerEvents = 'none'

  elIndicator.classList.remove('hidden')
  elIndicator.classList.add('flick')

  setTimeout(() => {
    elIndicator.classList.remove('flick')
    elIndicator.classList.add('hidden')
  }, 1500)

  setTimeout(() => {
    const stillHiddenMines = []
    for (var i = 0; i < gBoard.length; i++) {
      for (var j = 0; j < gBoard[0].length; j++) {
        const cell = gBoard[i][j]
        if (cell.isMine && !cell.isRevealed) stillHiddenMines.push({ i, j })
      }
    }

    const toRemove = Math.min(3, stillHiddenMines.length)
    for (var k = 0; k < toRemove; k++) {
      const idx = getRandomInt(0, stillHiddenMines.length)
      const pos = stillHiddenMines.splice(idx, 1)[0]
      gBoard[pos.i][pos.j].isMine = false
    }

    gMineCount = Math.max(0, gMineCount - toRemove)
    gRoundMineCount = gMineCount
    setMinesNegsCount(gBoard)
    updateFlagCounter()

    for (var i = 0; i < gBoard.length; i++) {
      for (var j = 0; j < gBoard[0].length; j++) {
        const cell = gBoard[i][j]
        if (cell.isRevealed && !cell.isMine) {
          const elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
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
    setTimeout(() => {
      elContainer.classList.add('used')
    }, 600)
  }, 1500)
}


function startTimer() {
  const start = Date.now()
  gTimerInterval = setInterval(() => {
    gGame.secsPassed = (Date.now() - start) / 1000
    const total = Math.floor(gGame.secsPassed * 1000)

    const m = Math.floor(total / 60000)
    const s = Math.floor((total % 60000) / 1000)
    const h = Math.floor((total % 1000) / 10)

    document.querySelector('.timer').innerText =
      `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(h).padStart(2, '0')}`
  }, 100)
}

function stopTimer() {
  clearInterval(gTimerInterval)
}


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

document.addEventListener('contextmenu', ev => ev.preventDefault())
