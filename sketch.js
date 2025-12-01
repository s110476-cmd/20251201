// 圖片精靈的總寬高
const SPRITE_W_TOTAL = 459;
const SPRITE_H = 70;
// 幀數
const FRAMES = 8;
let walkSheet, runSheet, attackSheet;
let currentSheet;
let currentFrames = FRAMES;
let frameW, frameH;
let frameIndex = 0;
let frameDelay = 6; // 調整此值改變動畫速度
let frameTimer = 0;

let posX, posY;
let speed = 4; // 移動速度（可調）
let scaleFactor = 3; // 等比例放大倍數
let facing = 1; // 1 = 右, -1 = 左

// 揮刀設定
const ATTACK_FRAMES = 16; // 1/揮刀/all 2.png 16 幀
let attacking = false;
let prevSheet = null;
let prevFrames = FRAMES;

function preload() {
  // 走路精靈 (8 幀，459x70)
  walkSheet = loadImage('1/走路/all 1.png');
  // 跑步精靈 (8 幀，635x51)
  runSheet = loadImage('1/跑步/all 2.png');
  // 揮刀精靈 (16 幀，1307x97)
  attackSheet = loadImage('1/揮刀/all 2.png');
}

function setup() {
  // 創建全視窗畫布
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  noSmooth();

  // 初始使用走路精靈
  currentSheet = walkSheet;
  currentFrames = FRAMES;
  frameW = currentSheet.width / currentFrames;
  frameH = currentSheet.height;

  posX = width / 2;
  posY = height / 2;
}

function draw() {
  // 設置背景顏色
  background('#bde0fe');

  // 若正在攻擊，優先處理攻擊動畫（不處理移動）
  if (attacking) {
    // 確保使用揮刀精靈設定
    if (currentSheet !== attackSheet) {
      currentSheet = attackSheet;
      currentFrames = ATTACK_FRAMES;
      frameIndex = 0;
      frameTimer = 0;
      frameW = currentSheet.width / currentFrames;
      frameH = currentSheet.height;
    }

    // 顯示攻擊幀
    const sxA = frameIndex * frameW;
    image(currentSheet, posX, posY, frameW * scaleFactor, frameH * scaleFactor, sxA, 0, frameW, frameH);

    // 更新攻擊幀（播放一次）
    frameTimer++;
    if (frameTimer >= frameDelay) {
      frameTimer = 0;
      frameIndex++;
      if (frameIndex >= currentFrames) {
        // 攻擊結束，還原到先前精靈
        attacking = false;
        currentSheet = prevSheet || walkSheet;
        currentFrames = prevFrames;
        frameIndex = 0;
        frameTimer = 0;
        frameW = currentSheet.width / currentFrames;
        frameH = currentSheet.height;
      }
    }

    return; // 攻擊期間不處理其他動作
  }

  // 判斷按鍵狀態並切換精靈與方向、移動
  let moving = false;
  if (keyIsDown(RIGHT_ARROW)) {
    // 使用跑步精靈並向右移動
    if (currentSheet !== runSheet) {
      currentSheet = runSheet;
      currentFrames = FRAMES;
      frameIndex = 0;
      frameTimer = 0;
      frameW = currentSheet.width / currentFrames;
      frameH = currentSheet.height;
    }
    facing = 1;
    posX += speed;
    moving = true;
  } else if (keyIsDown(LEFT_ARROW)) {
    // 使用走路精靈並向左移動（翻轉顯示）
    if (currentSheet !== walkSheet) {
      currentSheet = walkSheet;
      currentFrames = FRAMES;
      frameIndex = 0;
      frameTimer = 0;
      frameW = currentSheet.width / currentFrames;
      frameH = currentSheet.height;
    }
    facing = -1;
    posX -= speed;
    moving = true;
  } else {
    // 若沒有按鍵，可保留最後一張幀（不移動）或維持動畫停止在第一幀
    // 這裡讓角色停在當前幀（不自動前進），不切換精靈
  }

  // 限制角色不要跑出畫布
  const dw = frameW * scaleFactor;
  const halfW = dw / 2;
  posX = constrain(posX, halfW, width - halfW);

  // 計算來源矩形 (sx, sy, sw, sh)
  const sx = frameIndex * frameW;
  const sy = 0;
  const sw = frameW;
  const sh = frameH;

  // 顯示在畫布上的位置（使用 push/pop 以便翻轉）
  push();
  translate(posX, posY);
  scale(facing, 1); // facing = 1 或 -1，水平翻轉
  // 畫面元件在 translate 後以 (0,0) 為中心，若翻轉為 -1 時仍以中心顯示正確
  image(currentSheet, 0, 0, sw * scaleFactor, sh * scaleFactor, sx, sy, sw, sh);
  pop();

  // 更新幀（當角色在移動時進行動畫）
  if (moving) {
    frameTimer++;
    if (frameTimer >= frameDelay) {
      frameTimer = 0;
      frameIndex = (frameIndex + 1) % currentFrames;
    }
  } else {
    // 若不移動，保留第一幀（可改為讓動畫慢慢停下）
    frameIndex = 0;
    frameTimer = 0;
  }
}

function keyPressed() {
  // 空白鍵（32）啟動揮刀動畫
  if (keyCode === 32 && !attacking) {
    attacking = true;
    prevSheet = currentSheet;
    prevFrames = currentFrames;
    currentSheet = attackSheet;
    currentFrames = ATTACK_FRAMES;
    frameW = currentSheet.width / currentFrames;
    frameH = currentSheet.height;
    frameIndex = 0;
    frameTimer = 0;
  }
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小以保持全視窗
  resizeCanvas(windowWidth, windowHeight);
  posY = height / 2; // 保持垂直置中
}