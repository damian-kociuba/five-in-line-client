function Board(width, height) {
    this.width = width;
    this.height = height;
    this.fields = [];
    this.lastMove = {x:-1, y:-1};
    
    for (var i = 0; i < height; i++) {
        this.fields[i] = [];
        for (var j = 0; j < width; j++) {
            this.fields[i][j] = {type: 'empty'};
        }
    }

    this.getByXY = function (x, y) {
        return this.fields[y][x];
    };
    this.setByXY = function (x, y, value) {
        this.fields[y][x] = value;
        this.lastMove = {x: x, y:y};
    };
    
    this.isLastMove = function(x,y) {
        if(this.lastMove.x == x && this.lastMove.y == y) {
            return true;
        } else {
            return false;
        }
    }
    
}