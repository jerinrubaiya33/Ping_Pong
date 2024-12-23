const INITIAL_VELOCITY = 0.015;
const VELOCITY_INCREASE = 0.000005;

class Ball {
  constructor(ballElem) {
    this.ballElem = ballElem;
    this.reset();
  }

  get x() {
    return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--x"));
  }

  set x(value) {
    this.ballElem.style.setProperty("--x", value);
  }

  get y() {
    return parseFloat(getComputedStyle(this.ballElem).getPropertyValue("--y"));
  }

  set y(value) {
    this.ballElem.style.setProperty("--y", value);
  }

  rect() {
    return this.ballElem.getBoundingClientRect();
  }

  reset() {
    this.x = 50;
    this.y = 50;
    this.direction = { x: 0 };
    while (
      Math.abs(this.direction.x) <= 0.2 ||
      Math.abs(this.direction.x) >= 0.9
    ) {
      const heading = randomNumberBetween(0, 2 * Math.PI);
      this.direction = { x: Math.cos(heading), y: Math.sin(heading) };
    }
    this.velocity = INITIAL_VELOCITY;
  }

  update(delta, paddleRects) {
    this.x += this.direction.x * this.velocity * delta;
    this.y += this.direction.y * this.velocity * delta;
    this.velocity += VELOCITY_INCREASE * delta;

    const rect = this.rect();

    if (rect.bottom >= window.innerHeight || rect.top <= 0) {
      this.direction.y *= -1;
      changeColor();
    }

    if (paddleRects.some((r) => isCollision(r, rect))) {
      this.direction.x *= -1;
      changeColor();
    }
  }
}

class Paddle {
  constructor(paddleElem) {
    this.paddleElem = paddleElem;
    this.reset();
  }

  get position() {
    return parseFloat(
      getComputedStyle(this.paddleElem).getPropertyValue("--position")
    );
  }

  set position(value) {
    this.paddleElem.style.setProperty("--position", value);
  }

  rect() {
    return this.paddleElem.getBoundingClientRect();
  }

  reset() {
    this.position = 50;
  }

  update(delta, ballY) {
    const diff = ballY - this.position;
    this.position += Math.min(0.1 * delta, Math.max(-0.1 * delta, diff));
  }
}

function randomNumberBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function isCollision(rect1, rect2) {
  return (
    rect1.left <= rect2.right &&
    rect1.right >= rect2.left &&
    rect1.top <= rect2.bottom &&
    rect1.bottom >= rect2.top
  );
}

function changeColor() {
  const hue =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--hue")
    ) || 0;
  const newHue = (hue + 40) % 360;
  document.documentElement.style.setProperty("--hue", newHue);
}

// Game setup
const ball = new Ball(document.getElementById("ball"));
const playerPaddle = new Paddle(document.getElementById("player-paddle"));
const computerPaddle = new Paddle(document.getElementById("computer-paddle"));
const playerScoreElem = document.getElementById("player-score");
const computerScoreElem = document.getElementById("computer-score");

// Popup elements
const popup = document.getElementById("popup");
const popupMessage = document.getElementById("popup-message");
const startBtn = document.getElementById("start-btn");

const MAX_SCORE = 10; // Score limit for game over

let lastTime;
let isGameOver = false;

popup.classList.add("show");
popupMessage.textContent = "Welcome to Ping Pong Game!";

startBtn.addEventListener("click", () => {
  popup.classList.remove("show");
  startGame();
});

function startGame() {
  playerScoreElem.textContent = "0";
  computerScoreElem.textContent = "0";
  ball.reset();
  computerPaddle.reset();
  lastTime = null;
  isGameOver = false;
  window.requestAnimationFrame(update);
}

function update(time) {
  if (isGameOver) return;

  if (lastTime != null) {
    const delta = time - lastTime;
    ball.update(delta, [playerPaddle.rect(), computerPaddle.rect()]);
    computerPaddle.update(delta, ball.y);

    if (isLose()) handleLose();
  }

  lastTime = time;
  window.requestAnimationFrame(update);
}

function isLose() {
  const rect = ball.rect();
  return rect.right >= window.innerWidth || rect.left <= 0;
}

function handleLose() {
  const rect = ball.rect();
  if (rect.right >= window.innerWidth) {
    playerScoreElem.textContent = parseInt(playerScoreElem.textContent) + 1;
  } else {
    computerScoreElem.textContent = parseInt(computerScoreElem.textContent) + 1;
  }

  const playerScore = parseInt(playerScoreElem.textContent);
  const computerScore = parseInt(computerScoreElem.textContent);

  if (playerScore >= MAX_SCORE || computerScore >= MAX_SCORE) {
    showGameOver(playerScore, computerScore);
  } else {
    ball.reset();
    computerPaddle.reset();
  }
}

function showGameOver(playerScore, computerScore) {
  isGameOver = true;
  popup.classList.add("show");
  popupMessage.textContent = `Game Over! Player: ${playerScore}, Computer: ${computerScore}`;
  startBtn.textContent = "Restart";

  startBtn.onclick = () => {
    popup.classList.remove("show");
    startGame();
  };
}
// Mouse and touch event listeners for paddle movement
document.addEventListener("mousemove", (e) => {
  if (isGameOver) return;
  const yPosition = e.clientY; // Get the Y position of the mouse
  playerPaddle.position = (yPosition / window.innerHeight) * 100; // Map the Y position to the paddle position
});

let touchStartY = 0;

document.addEventListener("touchstart", (e) => {
  if (isGameOver) return;
  const yPosition = e.touches[0].clientY; // Get the Y position of the touch
  playerPaddle.position = (yPosition / window.innerHeight) * 100; // Map the Y position to the paddle position
});

document.addEventListener("touchmove", (e) => {
  if (isGameOver) return;
  const yPosition = e.touches[0].clientY; // Get the Y position of the touch
  playerPaddle.position = (yPosition / window.innerHeight) * 100; // Map the Y position to the paddle position

  e.preventDefault(); // Prevent scrolling when dragging on mobile
});

document.addEventListener("touchend", () => {
  touchStartY = 0;
});
