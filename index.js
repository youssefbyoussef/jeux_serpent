window.onload = function() {
    var canvasWidth = 900;
    var canvasHeight = 600;
    var blockSize = 30;
    var canvas, ctx;
    var delay = 100;
    var snake;
    var apple;
    var score = 0;
    var timeoutId;

    function init() {
        canvas = document.createElement("canvas");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border=" 10px solid  #000";
        document.body.appendChild(canvas);

        ctx = canvas.getContext("2d");
        snake = new Snake([[6, 4], [5, 4], [4, 4], [3, 4], [2, 4]], "down");
        apple = new Apple([10, 10]);
        refreshCanvas();
    }

    function refreshCanvas() {
        snake.advance();
        if (snake.checkCollision()) {
            gameOver();
        } else {
            if (snake.eatApple(apple)) {
                score++;
                apple.setNewPosition();
            }
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            snake.draw();
            apple.draw();
            drawScore();
            timeoutId = setTimeout(refreshCanvas, delay);
        }
    }

    function drawScore() {
        ctx.save();
        ctx.font = "30px  Arial";
        ctx.fontWeight="bold";
        ctx.fillStyle = "#ff0000";
        ctx.fillText(score.toString(), 5, canvasHeight - 5);
        ctx.restore();
    }

    function Apple(position) {
        this.position = position;
        this.draw = function() {
            ctx.save();
            ctx.fillStyle = "#33cc33";
            ctx.beginPath();
            var radius = blockSize / 2;
            var x = this.position[0] * blockSize + radius;
            var y = this.position[1] * blockSize + radius;
            ctx.arc(x, y, radius, 0, Math.PI * 2, true);
            ctx.fill();// yaatik ehses keyenou yetharek khtr il efface l etat precedent 
            ctx.restore();
        };
        this.setNewPosition = function() {
            var newX = Math.round(Math.random() * ((canvasWidth / blockSize) - 1));
            var newY = Math.round(Math.random() * ((canvasHeight / blockSize) - 1));
            this.position = [newX, newY];
        };
    }

    function Snake(body, direction) {
        this.body = body;
        this.direction = direction;
        this.draw = function() {
            ctx.save();
            ctx.fillStyle = "#ff0000";
            for (var i = 0; i < this.body.length; i++) {
                drawBlock(ctx, this.body[i]);
            }
            
            ctx.restore();
        };

        this.advance = function() {
            var nextPosition = this.body[0].slice();
            switch (this.direction) {
                case "left":
                    nextPosition[0] -= 1;
                    break;
                case "right":
                    nextPosition[0] += 1;
                    break;
                case "down":
                    nextPosition[1] += 1;
                    break;
                case "up":
                    nextPosition[1] -= 1;
                    break;
                default:
                    throw ("Invalid direction");
            }
            this.body.unshift(nextPosition);
            this.body.pop();
        };

        this.setDirection = function(newDirection) {
            var allowedDirections;
            switch (this.direction) {
                case "left":
                case "right":
                    allowedDirections = ["up", "down"];
                    break;
                case "down":
                case "up":
                    allowedDirections = ["left", "right"];
                    break;
                default:
                    throw ("Invalid direction");
            }
            if (allowedDirections.indexOf(newDirection) > -1) {
                this.direction = newDirection;
            }
        };

        this.checkCollision = function() {
            var wallCollision = false;
            var snakeCollision = false;
            var head = this.body[0];
            var rest = this.body.slice(1);
            var snakeX = head[0];
            var snakeY = head[1];

            var minX = 0;
            var minY = 0;
            var maxX = canvasWidth / blockSize - 1;
            var maxY = canvasHeight / blockSize - 1;

            var isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
            var isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;

            if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls) {
                wallCollision = true;
            }

            for (var i = 0; i < rest.length; i++) {
                if (snakeX === rest[i][0] && snakeY === rest[i][1]) {
                    snakeCollision = true;
                }
            }

            return wallCollision || snakeCollision;
        };

        this.eatApple = function(appleToEat) {
            var head = this.body[0];
            if (head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1]) {
                return true;
            } else {
                return false;
            }
        };
    }

    function gameOver() {
        clearTimeout(timeoutId);
        ctx.save();
        ctx.font = "50px Arial";
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Game Over", canvasWidth / 2, canvasHeight / 2);
        ctx.restore();
        document.onkeydown = function(e) {
            if (e.keyCode === 32) { // Espace pour redémarrer
                restart();
            }
        };
    }

    function restart() {
        score = 0;
        snake = new Snake([[6, 4], [5, 4], [4, 4], [3, 4], [2, 4]], "down");
        apple = new Apple([10, 10]);
        document.onkeydown = handleKeyDown;
        clearTimeout(timeoutId);
        refreshCanvas();
    }

    function drawBlock(ctx, position) {
        var x = position[0] * blockSize;
        var y = position[1] * blockSize;
        ctx.fillRect(x, y, blockSize, blockSize);
    }

    function handleKeyDown(e) {
        var key = e.keyCode;
        var newDirection;
        switch (key) {
            case 37:
                newDirection = "left";
                break;
            case 38:
                newDirection = "up";
                break;
            case 39:
                newDirection = "right";
                break;
            case 40:
                newDirection = "down";
                break;
            case 32: 
                restart();
                return;
            default:
                return;
        }
        snake.setDirection(newDirection);
    }

    document.onkeydown = handleKeyDown;
    init();

};
//ctx.save(); sauvgarde l'etat actuel du dessin 
 //Chaque fois que vous commencez à dessiner une nouvelle forme ou une nouvelle ligne, 
 //appelez ctx.beginPath() pour que le contexte de dessin sache que vous démarrez un nouveau chemin