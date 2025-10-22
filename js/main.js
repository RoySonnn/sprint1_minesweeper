'use strict'

const MINE = '💥'
const FLAG = '⚠️'

var gBoardSize = 4
var gMineCount = 1
var gIsFirstClick
var gBoard

var gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0
}



// gBoard[0][0].isMine = true
// gBoard[0][1].isMine = true

function onInit() {
    gGame.isOn = true
    gGame.revealedCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gIsFirstClick = true
    gBoard = buildBoard(gBoardSize)
    renderBoard(gBoard)
    document.addEventListener('contextmenu', event => event.preventDefault())
    // console.table(gBoard)
}


function buildBoard(gBoardSize) {
    var board = []
    for (var i = 0; i < gBoardSize; i++) {
        board[i] = []
        for (var j = 0; j < gBoardSize; j++) {
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


function minesRandomizer(board, gMineCount, firstClickI, firstClickJ) {
    var placedMines = 0
    while (placedMines < gMineCount) {
        var i = getRandomInt(0, board.length)
        var j = getRandomInt(0, board[0].length)
        if (board[i][j].isMine || (i === firstClickI && j === firstClickJ)) continue

        board[i][j].isMine = true
        placedMines++
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
    var neighborsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[0].length) continue

            if (i === cellI && j === cellJ) continue

            if (board[i][j].isMine) neighborsCount++
        }
    }
    return neighborsCount
}


function onCellClicked(i, j, elCell) {
    if (!gGame.isOn) return

    var cell = gBoard[i][j]
    if (cell.isRevealed) return // maybe to add the condition || cell.isMarked...

    if (gIsFirstClick) {
        minesRandomizer(gBoard, gMineCount, i, j)
        setMinesNegsCount(gBoard)
        gIsFirstClick = false
    }

    cell.isRevealed = true
    gGame.revealedCount++
    elCell.classList.add('revealed')
    // var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)

    if (cell.isMine) {
        elCell.innerText = MINE
        elCell.classList.add('mine')//, 'revealed')
        revealAllMines()
        gameOver(false)
        return
    } else if (cell.minesAroundCount > 0) {
        elCell.innerText = cell.minesAroundCount
        // elCell.classList.add('revealed')
    } else {
        elCell.innerText = ''
        expandReveal(i, j, gBoard)
        // elCell.classList.add('revealed')
    }
    checkVictory()
    // console.table(gBoard)

}


function onCellMarked(i, j, elCell) {
    if (!gGame.isOn) return
    var cell = gBoard[i][j]

    if (cell.isRevealed) return
    cell.isMarked = !cell.isMarked
    // var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
    elCell.innerText = cell.isMarked ? FLAG : ''
    gGame.markedCount += cell.isMarked ? 1 : -1
    checkVictory()
}


function renderBoard(board) { // maybe move it to utils and create a gContent for this specific case...
    var strHTML = ''

    for (var i = 0; i < gBoardSize; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            var content = cell.isMine ? MINE : cell.minesAroundCount
            var showContent = cell.isRevealed ? content : ''

            strHTML += `<td class="cell" data-i="${i}" data-j="${j}"
                        onclick="onCellClicked(${i}, ${j}, this)"
                        oncontextmenu="onCellMarked(${i}, ${j}, this)">${showContent}</td>`
        }
        strHTML += '</tr>'
    }
    document.querySelector('.board').innerHTML = strHTML
}


function expandReveal(cellI, cellJ, board) {
    for (var rowIdx = cellI - 1; rowIdx <= cellI + 1; rowIdx++) {
        if (rowIdx < 0 || rowIdx >= board.length) continue
        for (var colIdx = cellJ - 1; colIdx <= cellJ + 1; colIdx++) {
            if (colIdx < 0 || colIdx >= board[0].length) continue
            if (rowIdx === cellI && colIdx === cellJ) continue

            var neighbor = board[rowIdx][colIdx]
            if (neighbor.isRevealed || neighbor.isMine || neighbor.isMarked) continue

            neighbor.isRevealed = true
            gGame.revealedCount++
            
            var elNeighbor = document.querySelector(`[data-i="${rowIdx}"][data-j="${colIdx}"]`)
            elNeighbor.classList.add('revealed')

            if (neighbor.minesAroundCount > 0) {
                elNeighbor.innerText = neighbor.minesAroundCount
            } else {
                elNeighbor.innerText = ''
            }
        }
    }
}

function revealAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (cell.isMine) {
                var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)
                elCell.innerText = MINE
                elCell.classList.add('mine', 'revealed')
            }
        }
    }
}

function checkVictory() {
    var totalCells = gBoardSize ** 2
    var safeCells = totalCells - gMineCount

    if (gGame.revealedCount === safeCells) gameOver(true)
}

function gameOver(isWin) {
    gGame.isOn = false
    setTimeout(function () {
        alert(isWin ? 'You Won!!' : 'You lost')
    }, 100)
}



