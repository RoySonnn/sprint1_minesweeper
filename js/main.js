'use strict'

const MINE = '💥'

var boardSize = 4
var gBoard = buildBoard(boardSize)

console.table(gBoard)

function onInit() {
    gBoard = buildBoard(boardSize)
    gBoard[0][0].isMine = true
    gBoard[0][1].isMine = true

    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
}

function buildBoard(boardSize) {
    var board = []
    for (var i = 0; i < boardSize; i++) {
        board[i] = []
        for (var j = 0; j < boardSize; j++) {
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

function onCellClicked(ev) {

    var elClicked = ev.target
    if (!elClicked.classList.contains('cell')) return
    var i = +elClicked.dataset.i
    var j = +elClicked.dataset.j
    var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`)

    var cell = gBoard[i][j]
    if (cell.isRevealed) return
    cell.isRevealed = true

    if (cell.isMine) {
        elCell.innerText = MINE
        elCell.classList.add('mine', 'revealed')
    } else if (cell.minesAroundCount > 0) {
        elCell.innerText = cell.minesAroundCount
        elCell.classList.add('revealed')
    } else {
        elCell.innerText = ''
        elCell.classList.add('revealed')
    }

}

function renderBoard(board) { // maybe move it to utils and create a gContent for this specific case...
    var strHTML = ''
    for (var i = 0; i < boardSize; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            strHTML += `<td class="cell" data-i="${i}" data-j="${j}"></td>`

        }
        strHTML += '</tr>'
    }
    document.querySelector('.board').innerHTML = strHTML
}