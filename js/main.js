'use strict'

const MINE = '💥'

var boardSize = 4
var gBoard = buildBoard(boardSize)

console.table(gBoard)

gBoard[0][0].isMine = true
gBoard[0][boardSize - 1].isMine = true

setMinesNegsCount(gBoard)
renderBoard(gBoard)

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
        for (var j = 0; j < board.length; j++) {
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

function renderBoard(board) { // maybe move it to utils and create a gContent for this specific case...
    var strHTML = ''
    for (var i = 0; i < boardSize; i++) {
        strHTML += '<tr>'

        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]

            var content = ''
            if (cell.isMine) {
                content = MINE
            } else if (cell.minesAroundCount > 0) {
                content = cell.minesAroundCount
            }
            strHTML += `<td class="cell">${content}</td>`
        }
        strHTML += '</tr>'
    }
    document.querySelector('.board').innerHTML = strHTML
}