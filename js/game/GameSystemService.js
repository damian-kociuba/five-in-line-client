FiveInRowGameApp.service('GameSystem', [function () {
        
        this.isPlayerTurn = false;
        this.isGameStarted = false;
        this.isGameFinished = false;
        this.isWaitingForSecondPlayer = false;
        this.isWaitingForSecondPublicPlayer = false;
        this.playerColor;
        this.playerName;
        this.opponentName;
    }]);