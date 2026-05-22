// Canvas and context setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    speedX: 5,
    speedY: 5,
    maxSpeed: 7
};

const paddleWidth = 10;
const paddleHeight = 80;

const playerPaddle = {
    x: 15,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    speed: 6,
    dy: 0,
    mouseY: null
};

const computerPaddle = {
    x: canvas.width - paddleWidth - 15,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    speed: 5
};

let playerScore = 0;
let computerScore = 0;

// Event listeners
const upKey = { pressed: false };
const downKey = { pressed: false };

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') upKey.pressed = true;
    if (e.key === 'ArrowDown') downKey.pressed = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') upKey.pressed = false;
    if (e.key === 'ArrowDown') downKey.pressed = false;
});

document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    playerPaddle.mouseY = mouseY;
});

document.getElementById('resetBtn').addEventListener('click', resetGame);

// Draw functions
function drawRectangle(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    drawCenterLine();

    // Draw paddles
    drawRectangle(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height, '#00ff88');
    drawRectangle(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height, '#ff00ff');

    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, '#00ffff');
}

// Update functions
function updatePlayerPaddle() {
    // Arrow key control
    if (upKey.pressed) {
        playerPaddle.y = Math.max(0, playerPaddle.y - playerPaddle.speed);
    }
    if (downKey.pressed) {
        playerPaddle.y = Math.min(canvas.height - playerPaddle.height, playerPaddle.y + playerPaddle.speed);
    }

    // Mouse control
    if (playerPaddle.mouseY !== null) {
        const paddleCenter = playerPaddle.y + playerPaddle.height / 2;
        const distance = playerPaddle.mouseY - paddleCenter;
        
        if (Math.abs(distance) > 5) {
            playerPaddle.y += distance * 0.15;
            playerPaddle.y = Math.max(0, Math.min(canvas.height - playerPaddle.height, playerPaddle.y));
        }
    }
}

function updateComputerPaddle() {
    const computerPaddleCenter = computerPaddle.y + computerPaddle.height / 2;
    const ballCenter = ball.y;
    const speed = computerPaddle.speed;

    if (computerPaddleCenter < ballCenter - 35) {
        computerPaddle.y = Math.min(canvas.height - computerPaddle.height, computerPaddle.y + speed);
    } else if (computerPaddleCenter > ballCenter + 35) {
        computerPaddle.y = Math.max(0, computerPaddle.y - speed);
    }
}

function updateBall() {
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.speedY = -ball.speedY;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Ball collision with paddles
    checkPaddleCollision(playerPaddle);
    checkPaddleCollision(computerPaddle);

    // Ball out of bounds
    if (ball.x < 0) {
        computerScore++;
        updateScore();
        resetBall();
    }
    if (ball.x > canvas.width) {
        playerScore++;
        updateScore();
        resetBall();
    }
}

function checkPaddleCollision(paddle) {
    if (
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.x + ball.radius > paddle.x &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.y + ball.radius > paddle.y
    ) {
        ball.speedX = -ball.speedX;

        // Add spin based on where the ball hits the paddle
        const hitPos = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
        ball.speedY = hitPos * ball.maxSpeed;

        // Ensure ball moves away from paddle
        if (paddle === playerPaddle) {
            ball.x = paddle.x + paddle.width + ball.radius;
        } else {
            ball.x = paddle.x - ball.radius;
        }

        // Increase speed slightly on each hit (cap at maxSpeed)
        const currentSpeed = Math.sqrt(ball.speedX ** 2 + ball.speedY ** 2);
        if (currentSpeed < ball.maxSpeed) {
            const speedIncrease = 1.05;
            ball.speedX *= speedIncrease;
            ball.speedY *= speedIncrease;
        }
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.speedY = (Math.random() > 0.5 ? 1 : -1) * 5;
}

function resetGame() {
    playerScore = 0;
    computerScore = 0;
    updateScore();
    resetBall();
}

function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Game loop
function gameLoop() {
    updatePlayerPaddle();
    updateComputerPaddle();
    updateBall();
    drawGame();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();