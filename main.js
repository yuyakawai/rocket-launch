const containerWidth = 320;
const containerHeight = 480;

const canvasWidth = containerWidth;
const canvasHeight = containerHeight;

const imagePaths = {
  rocketNormalImage: "image/rocket_normal.png",
  rocketRiseImage: "image/rocket_rise.png",
  planetImage: "image/planet.png"
};

let images = {
  rocketNormalImage: null,
  rocketRiseImage: null,
  planetImage: null
};

let imageLoadNum = 0;

let containerElement = null;
let canvasElement = null;

let ctx = null;

let playerX = 0;
let playerY = 0;
let isRise = false;
let playerAcceleration = 0;
const maxAcceleration = 4;

let planetInfoList = [];
const maxPlanet = 10;
const planetWaitInterval = 100;

const initialRemainingTime = 1500;
let remainingTime = initialRemainingTime;
let isLoaded = false;
let isGameStart = false;
let isGameClear = false;
let isGameOver = false;

const init = () => {
  containerElement = document.getElementById("container");
  containerElement.style.width = containerWidth + "px";
  containerElement.style.height = containerHeight + "px";
  containerElement.style.padding = "5px";
  containerElement.style.fontFamily = "sans-serif";
  containerElement.style.backgroundColor = "white";
  containerElement.style.webkitUserSelect = "none";

  containerElement.onpointerdown = (e) => {
    e.preventDefault();
    isRise = true;
    if (isLoaded) {
      isGameStart = true;
    }

    if (isGameOver) {
      restartGame();
    }
  };

  containerElement.onpointerup = (e) => {
    e.preventDefault();
    isRise = false;
  };

  containerElement.ondblclick = (e) => {
    e.preventDefault();
  };

  canvasElement = document.createElement("canvas");
  canvasElement.width = canvasWidth;
  canvasElement.height = canvasHeight;
  containerElement.appendChild(canvasElement);

  ctx = canvasElement.getContext("2d");

  for (const index in images) {
    images[index] = new Image();
    images[index].src = imagePaths[index];
    images[index].onload = () => {
      imageLoadNum++;
      if (imageLoadNum === Object.keys(images).length) {
        isLoaded = true;
      }
    };
  }

  for (let i = 0; i < maxPlanet; i++) {
    planetInfoList.push({
      x: canvasWidth,
      y: canvasHeight,
      radians: 0,
      acceleration: 0,
      available: false,
      wait: i * planetWaitInterval
    });
  }

  draw();

  return 0;
};

const move = () => {
  if (isGameStart === false) {
    drawTitle();
    requestAnimationFrame(move);
    return 0;
  }

  isRise ? playerAcceleration-- : playerAcceleration++;

  if (playerAcceleration > maxAcceleration) {
    playerAcceleration = maxAcceleration;
  }

  if (playerAcceleration < -maxAcceleration) {
    playerAcceleration = -maxAcceleration;
  }

  playerY += playerAcceleration;

  if (
    playerY < 0 - images.rocketNormalImage.height ||
    playerY > containerHeight
  ) {
    isGameOver = true;
  }

  for (const planetInfo of planetInfoList) {
    if (planetInfo.available) {
      planetInfo.x -= planetInfo.acceleration;
      planetInfo.radians += Math.random() / 10;
      planetInfo.y += Math.sin(planetInfo.radians);
      if (planetInfo.x < -images.planetImage.width) {
        planetInfo.wait = 0;
        planetInfo.available = false;
      }
    } else {
      planetInfo.wait--;
      if (planetInfo.wait < 0) {
        planetInfo.x = canvasWidth;
        planetInfo.y = Math.floor(Math.random() * canvasHeight);
        planetInfo.radians = 0;
        planetInfo.acceleration = Math.floor(Math.random() * 4);
        planetInfo.available = true;
      }
    }
  }

  remainingTime--;
  if (remainingTime <= 0) {
    isGameClear = true;
  }

  draw();

  if (isGameOver) {
    drawGameOverMessage();
  } else if (isGameClear) {
    drawGameClearMessage();
  } else {
    requestAnimationFrame(move);
  }

  return 0;
};

const draw = () => {
  ctx.beginPath();
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);

  ctx.drawImage(
    isRise ? images.rocketRiseImage : images.rocketNormalImage,
    playerX,
    playerY
  );

  for (const planetInfo of planetInfoList) {
    ctx.drawImage(images.planetImage, planetInfo.x, planetInfo.y);
  }

  checkCollision();
  drawRemainingTime();

  return 0;
};

const drawTitle = () => {
  ctx.beginPath();
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);

  playerX = canvasWidth / 2 - images.rocketNormalImage.width / 2;
  playerY = canvasHeight / 4;

  ctx.drawImage(images.rocketRiseImage, playerX, playerY);

  ctx.fillStyle = "white";
  let fontSize = 32;
  let text = "ロケット発射ゲーム";
  ctx.font = fontSize + "px sans-serif";
  let x = (canvasWidth - ctx.measureText(text).width) / 2;
  let y = (canvasHeight + fontSize) / 2;
  ctx.fillText(text, x, y);

  fontSize = 16;
  isLoaded
    ? (text = "クリックまたはタップしてスタート！！")
    : (text = "ロード中...");
  ctx.font = fontSize + "px sans-serif";
  x = (canvasWidth - ctx.measureText(text).width) / 2;
  y = ((canvasHeight + fontSize) / 3) * 2;
  ctx.fillText(text, x, y);

  fontSize = 12;
  text = "【ルール説明】";
  ctx.font = fontSize + "px sans-serif";
  x = (canvasWidth - ctx.measureText(text).width) / 2;
  y = ((canvasHeight + fontSize) / 6) * 4.8;
  ctx.fillText(text, x, y);

  text = "クリックまたはタップでロケットが上昇";
  ctx.font = fontSize + "px sans-serif";
  x = (canvasWidth - ctx.measureText(text).width) / 2;
  y = ((canvasHeight + fontSize) / 6) * 5;
  ctx.fillText(text, x, y);

  text = "星にぶつかったり画面外に出たらゲームオーバー";
  ctx.font = fontSize + "px sans-serif";
  x = (canvasWidth - ctx.measureText(text).width) / 2;
  y = ((canvasHeight + fontSize) / 6) * 5.2;
  ctx.fillText(text, x, y);

  return 0;
};

const drawRemainingTime = () => {
  ctx.fillStyle = "yellow";
  ctx.font = "12px sans-serif";
  ctx.fillText("残り時間", 10, 15);
  ctx.fillRect(10, 20, remainingTime / 5, 10);

  return 0;
};

const drawGameOverMessage = () => {
  ctx.fillStyle = "red";
  let fontSize = 48;
  let text = "Game Over";
  ctx.font = fontSize + "px sans-serif";
  let x = (canvasWidth - ctx.measureText(text).width) / 2;
  let y = (canvasHeight + fontSize) / 2;
  ctx.fillText(text, x, y);

  ctx.fillStyle = "white";
  fontSize = 16;
  text = "クリックまたはタップしてリトライ";
  ctx.font = fontSize + "px sans-serif";
  x = (canvasWidth - ctx.measureText(text).width) / 2;
  y = ((canvasHeight + fontSize) / 3) * 2;
  ctx.fillText(text, x, y);
  return 0;
};

const drawGameClearMessage = () => {
  ctx.fillStyle = "blue";
  let fontSize = 48;
  let text = "Game Clear";
  ctx.font = fontSize + "px sans-serif";
  let x = (canvasWidth - ctx.measureText(text).width) / 2;
  let y = (canvasHeight + fontSize) / 2;
  ctx.fillText(text, x, y);

  return 0;
};

const checkCollision = () => {
  for (const planetInfo of planetInfoList) {
    let distanceX = playerX - planetInfo.x;
    let distanceY = playerY - planetInfo.y;
    let distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

    const hitDistance =
      images.planetImage.width / 2 + images.rocketNormalImage.width / 6;

    if (distance <= hitDistance) {
      isGameOver = true;
    }
  }

  return 0;
};

const restartGame = () => {
  isGameOver = false;
  isGameStart = false;
  remainingTime = initialRemainingTime;

  let i = 0;
  for (const planetInfo of planetInfoList) {
    planetInfo.available = false;
    planetInfo.x = canvasWidth;
    planetInfo.y = Math.floor(Math.random() * canvasHeight);
    planetInfo.radians = 0;
    planetInfo.acceleration = Math.floor(Math.random() * 4);
    planetInfo.wait = i * planetWaitInterval;
    i++;
  }

  requestAnimationFrame(move);
  return 0;
};

window.onload = () => {
  init();
  requestAnimationFrame(move);
};
