'use strict'

const MINE = '💥'

var boardSize = 4
var gBoard = buildBoard(boardSize)

console.table(gBoard)

gBoard[0][0].isMine = true
gBoard[0][boardSize - 1].isMine = true

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

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < boardSize; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++){
            var cell = board[i][j]
            var content = cell.isMine ? MINE : ''
            strHTML += `<td class="cell">${content}</td>`
        }
        strHTML += '</tr>'

    }
    document.querySelector('.board').innerHTML = strHTML
}