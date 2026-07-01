"use strict";

// Game scene names and fixed game settings.
const SCENE_LOADING = "loading";
const SCENE_INTRO = "intro";
const SCENE_MENU = "menu";
const SCENE_GAME = "game";
const SCENE_SHOP = "shop";
const SCENE_GAME_OVER = "gameOver";
const SCENE_WIN = "win";

const STARTING_MAX_LIVES = 3;
const FINAL_LEVEL = 5;

const USE_INTRO_VIDEO = true;

//Tracks the current scene and intro/loading timing.
let currentScene = USE_INTRO_VIDEO ? SCENE_INTRO : SCENE_LOADING;
let loadingStartTime = 0;
let introVideo;
let introLength = 8; // seconds

let loadingDuration = 14000;

let gameData;

let spaceshipSprite;
let enemies;
let bullets;
let enemyBullets;
let powerUps;
let itemDrops;

let spaceshipImage;
let meteorImage;
let alienImage;
let blackholeImage;
let menuShipImage;

let score = 0;
let lives = STARTING_MAX_LIVES;
let maxLives = STARTING_MAX_LIVES;
let level = 1;

let difficultyName = "normal";

// Object for difficulty settings
let difficultySettings = {
    easy: {
        enemySpeedMultiplier: 0.8,
        spawnIntervalMultiplier: 1.2
    },
    normal: {
        enemySpeedMultiplier: 1,
        spawnIntervalMultiplier: 1
    },
    hard: {
        enemySpeedMultiplier: 1.2,
        spawnIntervalMultiplier: 0.85
    }
};

let lastEnemySpawnTime = 0;
let lastPlayerShootTime = 0;

let shieldUntil = 0;
let shieldDuration = 5000;

let playerShootCooldown = 220;
let doubleShotUntil = 0;
let playerSpeed = 5;
let bulletDamage = 1;

let itemDropChance = 0.7;
let powerUpDropChance = 0.15;

let enemiesSpawnedThisLevel = 0;
let levelClearStarted = false;
let levelClearTime = 0;
let bossSpawned = false;

let spaceCredits = 0;

// Multiple objects for storing item properties. 
let inventory = {
    spaceJunk: 0,
    meteorite: 0,
    darkMatter: 0,
    laserCore: 0
};

let itemValues = {
    spaceJunk: 1,
    meteorite: 3,
    darkMatter: 8,
    laserCore: 5
};

let itemNames = {
    spaceJunk: "Space Junk",
    meteorite: "Meteorite",
    darkMatter: "Dark Matter",
    laserCore: "Laser Core"
};

let upgradeLevels = {
    rapidBlaster: 0,
    strongerBullets: 0,
    engineBoost: 0,
    reinforcedHull: 0,
    luckySalvage: 0
};

// Object for shop upgrades. 

let shopUpgrades = [
    {
        key: "rapidBlaster",
        name: "Illegal Fire-Rate Mod",
        description: "Shoot faster",
        maxLevel: 3,
        costs: [8, 8, 8]
    },
    {
        key: "strongerBullets",
        name: "Overcharged Ammo",
        description: "Bullets deal more damage",
        maxLevel: 3,
        costs: [10, 10, 10]
    },
    {
        key: "engineBoost",
        name: "Stolen Engine Core",
        description: "Move faster",
        maxLevel: 3,
        costs: [14, 14, 14]
    },
    {
        key: "reinforcedHull",
        name: "Scrap-Plated Hull",
        description: "Increase maximum hearts",
        maxLevel: 2,
        costs: [25, 25]
    },
    {
        key: "luckySalvage",
        name: "Magnetic Loot Scanner",
        description: "More item and power-up drops",
        maxLevel: 3,
        costs: [20, 20, 20]
    }
];

let shopMessage = "Press S to sell parts, or buy an upgrade.";
let stars = [];
let videoReady = false;

let shootOsc;
let shootEnv;
let hitOsc;
let hitEnv;
let boomOsc;
let boomEnv;

let shopKeeperImg;
let shopKeeperTalkImg;
let shopKeeperAngryImg;
let shopKeeperShockedImg;
let shopKeeperLaughImg;
let shopKeeperBlushImg;

let shopVisitCount = 0;
let currentShopKeeperImg;
let fullShopkeeperDialogue = "";
let displayedShopkeeperDialogue = "";
let dialogueStartTime = 0;
let dialogueSpeed = 35;

let lastTalkSoundTime = 0;
let talkSoundDelay = 70;

let traderTalkOsc;
let traderTalkEnv;

let greetingSound;
let whatCanIDoSound;
let lotsItemsSound;
let excellentChoiceSound;
let cantAffordSound;
let fineTasteSound;
let returnedSound;
let whatCanSound;
let loadingPageSound;
let gameBackgroundSound;
let wiseChoiceSound;
let businessRunSound;
let currentTraderVoiceSound = null;

let shopBackgroundImage;
let shopkeeperFaceHoldUntil = 0;

let fireItemImage;
let overchargedAmmoImage;
let displayedPurchasedUpgrade = "";

let stolenEngineCoreImage;
let scrapPlateImage;
let magneticScannerImage;

let bulletsImage;
let enemyBulletImage;
let jBlockImage;
let mBlockImage;
let dBlockImage;

let bossEyeImage; 


function preload() {
    gameData = loadJSON("gameData.json");

    spaceshipImage = loadImage("images/spaceship.png");
    meteorImage = loadImage("images/meteor.png");
    alienImage = loadImage("images/alien.png");
    blackholeImage = loadImage("images/blackhole.png");
    bossEyeImage = loadImage("images/boss_eye.png");

    shopKeeperImg = loadImage("assets/SAM_SHOPKEEPER_DARK_VEGETABLE/smilingsk.png");
    shopKeeperTalkImg = loadImage("assets/SAM_SHOPKEEPER_DARK_VEGETABLE/happytalksk.png");
    shopKeeperAngryImg = loadImage("assets/SAM_SHOPKEEPER_DARK_VEGETABLE/angrysk.png");
    shopKeeperShockedImg = loadImage("assets/SAM_SHOPKEEPER_DARK_VEGETABLE/shockedsk.png");
    shopKeeperLaughImg = loadImage("assets/SAM_SHOPKEEPER_DARK_VEGETABLE/blushingsk.png");

    menuShipImage = loadImage("images/menuship.png");
    bulletsImage = loadImage("images/fire_bullet.png");
    
    // This is the audio that plays automatically when entering the shop.
    greetingSound = loadSound("videos/audios/Oh_New_Customer.wav");
    shopBackgroundImage = loadImage("images/shop.png")
    whatCanIDoSound = loadSound("videos/audios/What_Can_I_Do.wav");

    lotsItemsSound = loadSound("videos/audios/Lots_Items.wav");
    fireItemImage = loadImage("images/fireitem.png");
    overchargedAmmoImage = loadImage("images/overchargedammo.png");
    excellentChoiceSound = loadSound("videos/audios/Excellent_Choice.wav");
    stolenEngineCoreImage = loadImage("images/stolenenginecore.png");
    cantAffordSound = loadSound("videos/audios/Can'tAfford.wav");
    scrapPlateImage = loadImage("images/scrap_plated_hull.png");
    magneticScannerImage = loadImage("images/magnetic_loot_scanner.png");
    fineTasteSound = loadSound("videos/audios/Fine_Taste.wav");
    returnedSound = loadSound("videos/audios/Returned.wav");
    whatCanSound = loadSound("videos/audios/WhatCanDo.wav");
    loadingPageSound = loadSound("videos/audios/loadingMusic.mp3");
    gameBackgroundSound = loadSound("videos/audios/gameMusic.mp3");
    wiseChoiceSound = loadSound("videos/audios/Wise_Choice.wav");
    businessRunSound = loadSound("videos/audios/Business_To_Run.wav");
    jBlockImage = loadImage("images/Jblueblock.png");
    mBlockImage = loadImage("images/Mblockm.png");
    dBlockImage = loadImage("images/Dblock.png");
    enemyBulletImage = loadImage("images/purple_bullet.png");
}


function setup() {
    createCanvas(1000, 600);


    // Sets the intro video at beginning. 
    introVideo = createVideo("videos/space.mp4");
    introVideo.hide();
    introVideo.elt.muted = true;
    introVideo.elt.playsInline = true;
    introVideo.volume(0);

    // Plays the video when ready.
    introVideo.elt.oncanplay = function () {
        videoReady = true;
        introVideo.play();
    };

    currentShopKeeperImg = shopKeeperImg;
    startShopkeeperDialogue("", shopKeeperImg);

    // Creates sprite groups for game objects.
    enemies = new Group();
    bullets = new Group();
    enemyBullets = new Group();
    powerUps = new Group();
    itemDrops = new Group();

    loadingStartTime = millis();

    createStars();
    setupSound();
}



function draw() {
    if (currentScene === SCENE_INTRO) {
        drawIntroScene();
    } else if (currentScene === SCENE_LOADING) {
        drawLoadingScene();
    } else if (currentScene === SCENE_MENU) {
        drawMenuScene();
    } else if (currentScene === SCENE_GAME) {
        drawGameScene();
    } else if (currentScene === SCENE_SHOP) {
        drawShopScene();
    } else if (currentScene === SCENE_GAME_OVER) {
        drawGameOverScene();
    } else if (currentScene === SCENE_WIN) {
        drawWinScene();
    }
}

function drawIntroScene() {
    background(0);

    imageMode(CORNER);
    image(introVideo, 0, 0, width, height);

    fill(255);
    noStroke();
    textAlign(CENTER);
    textSize(16);
    text("Press ENTER to skip", width / 2, height - 40);

    if (introVideo.time() >= introLength) {
        introVideo.stop();
        currentScene = SCENE_LOADING;
        loadingStartTime = millis();
    }
}


function drawLoadingScene() {
    background(5, 8, 25);

    // Loops the loading music and plays it.
    if (!loadingPageSound.isPlaying()) {
    loadingPageSound.loop();
}
    drawMovingStars();

    //Loading progress duration.
    let loadingProgress = constrain((millis() - loadingStartTime) / loadingDuration, 0, 1);

    fill(255);
    textAlign(CENTER, CENTER);
    textFont("Ethnocentric");
    textSize(42);
    text("LAST SHIP STANDING", width / 2, 80);

    rectMode(CORNER);
    stroke(80, 220, 255);
    strokeWeight(2);
    fill(5, 10, 25, 220);
    rect(width / 2 - 330, 150, 660, 280, 18);

    noStroke();
    fill(80, 220, 255);
    textSize(18);
    text("[ INTERSTELLAR MESSAGE RECEIVED ]", width / 2, 190);

    if (frameCount % 50 < 35) {
        fill(255, 80, 80);
        textSize(13);
        text("SIGNAL UNSTABLE...", width / 2, 220);
    }

    textAlign(LEFT, CENTER);
    textSize(17);

    if (loadingProgress > 0.15) {
        fill(255);
        text('"Keep your eyes open, pilot."', width / 2 - 270, 270);
    }

    if (loadingProgress > 0.35) {
        fill(220);
        text('"The Eye is closer than you think."', width / 2 - 270, 305);
    }

    if (loadingProgress > 0.55) {
        fill(220);
        text('"Too much destruction draws its attention."', width / 2 - 270, 340);
    }

    if (loadingProgress > 0.75) {
        fill(255, 220, 100);
        text('"Stay alive out there."', width / 2 - 270, 375);
    }

    rectMode(CORNER);
    noStroke();

    fill(40);
    rect(width / 2 - 220, 470, 440, 22, 8);

    fill(80, 220, 255);
    rect(width / 2 - 220, 470, 440 * loadingProgress, 22, 8);

    textAlign(CENTER, CENTER);
    fill(220);
    textSize(14);
    text("Connecting to the Last Ship network...", width / 2, 515);

    if (loadingProgress >= 1) {
        loadingPageSound.stop();
        currentScene = SCENE_MENU;
    }
}

// Draws the Menu screen

function drawMenuScene() {
    background(8, 12, 35);

    // Plays the background music once the audio is ready.
    if (getAudioContext().state === "running" && !gameBackgroundSound.isPlaying()) {
        gameBackgroundSound.loop();
    }

    drawMovingStars();

    fill(255);
    textAlign(CENTER, CENTER);
    textFont("Orbitron");

    textSize(42);
    text("LAST SHIP STANDING", width / 2, 70);

    drawMenuShip();

    textSize(20);
    fill(255);
    text("Press ENTER to Start", width / 2, 430);

    textSize(16);
    text("Press 1 = Easy    2 = Normal    3 = Hard", width / 2, 470);

    fill(80, 220, 255);
    text("Difficulty: " + difficultyName.toUpperCase(), width / 2, 505);

    fill(220);
    textSize(14);
    text("Controls: Arrow Keys / SPACE to shoot", width / 2, 545);
}

function drawMenuShip() {
    imageMode(CENTER);
    image(menuShipImage, width / 2, 250, 360, 230);
    imageMode(CORNER);
}

// Draws the game scene.

function drawGameScene() {
    // Updates gameplay, checks collisions, removes old sprites, and draws all game visuals.
    drawLevelBackground();

    handlePlayerMovement();
    handlePlayerShooting();

    spawnEnemies();
    updateEnemyMovement();
    updateEnemyFadeOuts();

    checkCollisions();
    removeOffscreenSprites();
    checkLevelProgress();

    drawSprites();
    drawFadingEnemies();
    drawFallingHeartPowerUps();
    drawItemDropLabels();
    drawPlayerShieldEffect();
    drawHUD();

    if (lives <= 0) {
        endGame();
    }
}

// Draws the moving stars when playing the game. 

function drawLevelBackground() {
    background(3, 6, 22);
    drawMovingStars();
}

// Draws the shop screen.

function drawShopScene() {
    imageMode(CORNER);
    image(shopBackgroundImage, 0, 0, width, height);

    noStroke();
    fill(5, 0, 20, 120);
    rect(0, 0, width, height);

    updateShopkeeperDialogue();

    textAlign(CENTER, CENTER);
    textFont("Orbitron");
    textSize(42);
    fill(255);
    text("SPACE SHOP", width / 2, 55);

    rectMode(CORNER);
    stroke(110, 220, 255, 120);
    strokeWeight(2);
    fill(15, 12, 30, 210);
    rect(55, 105, 890, 285, 18);

    noStroke();
    textAlign(LEFT, CENTER);

    fill(255, 220, 100);
    textSize(18);
    text("Credits: " + spaceCredits, 90, 340);

    if (displayedPurchasedUpgrade !== "") {
        fill(255, 190, 80);
        textSize(14);
        text("OWNED UPGRADE", 90, 180);
    }
    // Displays the Rapidfire Trigger Chip
    if (displayedPurchasedUpgrade === "rapidBlaster") {
        imageMode(CENTER);
        image(fireItemImage, 130, 240, 72, 72);
        imageMode(CORNER);

        fill(255);
        textSize(13);
        text("Rapidfire", 175, 225);
        text("Trigger Chip", 175, 245);

        fill(255, 190, 80);
        text("Upgrade Level " + upgradeLevels.rapidBlaster, 175, 270);
    }
    // Displays the Overcharged Ammo
    if (displayedPurchasedUpgrade === "strongerBullets") {
        imageMode(CENTER);
        image(overchargedAmmoImage, 130, 240, 90, 72);
        imageMode(CORNER);

        fill(255);
        textSize(13);
        text("Overcharged", 185, 225);
        text("Ammo", 185, 245);

        fill(100, 210, 255);
        text("Upgrade Level " + upgradeLevels.strongerBullets, 185, 270);
    }

    // Displays the Stolen Engine Core
    if (displayedPurchasedUpgrade === "engineBoost") {
        imageMode(CENTER);
        image(stolenEngineCoreImage, 130, 240, 100, 78);
        imageMode(CORNER);

        fill(255);
        textSize(13);
        text("Stolen Engine", 190, 225);
        text("Core", 190, 245);

        fill(190, 120, 255);
        text("Upgrade Level " + upgradeLevels.engineBoost, 190, 270);
    }

    // Displays the Scraped Plate 
    if (displayedPurchasedUpgrade === "reinforcedHull") {
        imageMode(CENTER);
        image(scrapPlateImage, 130, 240, 100, 82);
        imageMode(CORNER);

        fill(255);
        textSize(13);
        text("Scrap-Plated", 190, 225);
        text("Hull", 190, 245);

        fill(120, 230, 120);
        text("Upgrade Level " + upgradeLevels.reinforcedHull, 190, 270);
    }

    // Displays the Magnetic Loot Scanner
    if (displayedPurchasedUpgrade === "luckySalvage") {
        imageMode(CENTER);
        image(magneticScannerImage, 130, 240, 100, 82);
        imageMode(CORNER);

        fill(255);
        textSize(13);
        text("Magnetic Loot", 190, 225);
        text("Scanner", 190, 245);

        fill(120, 220, 255);
        text("Level " + upgradeLevels.luckySalvage, 190, 270);
    }

    if (currentShopKeeperImg) {
        imageMode(CENTER);
        image(currentShopKeeperImg, 430, 255, 230, 310);
        imageMode(CORNER);
    }

    textFont("Orbitron");
    drawUpgradeRow(0, 585, 145);
    drawUpgradeRow(1, 585, 190);
    drawUpgradeRow(2, 585, 235);
    drawUpgradeRow(3, 585, 280);
    drawUpgradeRow(4, 585, 325);

    //Sets the positioning of the dialogue box for the shop keeper. 
    let boxX = 60;
    let boxY = 420;
    let boxW = width - 120;
    let boxH = 145;

    rectMode(CORNER);
    stroke(255);
    strokeWeight(2);
    fill(0, 0, 0, 230);
    rect(boxX, boxY, boxW, boxH, 14);

    noStroke();
    fill(255);
    textAlign(LEFT, TOP);
    textFont("Orbitron");
    textSize(20);
    text("Bruno:", boxX + 25, boxY + 22);

    textFont("Arial");
    textSize(18);
    fill(240);
    text(displayedShopkeeperDialogue, boxX + 25, boxY + 58, boxW - 50, 40);

    textFont("Orbitron");
    textSize(16);
    fill(255, 220, 100);
    text("[S] Sell items", boxX + 25, boxY + 105);

    fill(120, 220, 255);
    text("[1-5] Buy upgrades", boxX + 230, boxY + 105);

    fill(255);
    text("[ENTER] Continue", boxX + 500, boxY + 105);

    textFont("Arial");
    textSize(14);
    fill(80, 220, 255);
    text(shopMessage, boxX + 25, boxY + 126, boxW - 50, 20);
}


function drawUpgradeRow(index, x, y) {
    // Shows the selected upgrade and its current level.
    let upgrade = shopUpgrades[index];
    let currentLevel = upgradeLevels[upgrade.key];

    let costText = "";

    // Shows MAX if fully upgraded.
    if (currentLevel >= upgrade.maxLevel) {
        costText = "MAX";
    } else {
        costText = upgrade.costs[currentLevel] + " credits";
    }

    // Creates upgrade properties in the text.
    textAlign(LEFT, CENTER);

    fill(255);
    textSize(15);
    text(
        (index + 1) + ". " + upgrade.name +
        "  Lv " + currentLevel + "/" + upgrade.maxLevel +
        "  [" + costText + "]",
        x + 35,
        y
    );

    fill(190);
    textSize(12);
    text(upgrade.description, x + 35, y + 22);
}


// Draws the GAME OVER screen. 
function drawGameOverScene() {
    background(10, 5, 20);
    drawMovingStars();

    textFont("Orbitron");
    textAlign(CENTER, CENTER);

    fill(255);
    textSize(44);
    text("GAME OVER", width / 2, 110);

    textSize(24);
    text("Your Score: " + score, width / 2, 190);

    textSize(28);
    fill(80, 220, 255);
    text("Leaderboard", width / 2, 285);

    textSize(20);
    fill(255);

    let rankX = width / 2 - 210;
    let nameX = width / 2 - 150;
    let scoreX = width / 2 + 130;

    let row1Y = 350;
    let row2Y = 395;
    let row3Y = 440;
    let row4Y = 485;

    textAlign(RIGHT, CENTER);
    text("1.", rankX, row1Y);
    text("2.", rankX, row2Y);
    text("3.", rankX, row3Y);
    text("4.", rankX, row4Y);

    textAlign(LEFT, CENTER);
    text("NovaRift", nameX, row1Y);
    text("StarBandit", nameX, row2Y);
    text("VoidRunner", nameX, row3Y);
    text("You", nameX, row4Y);

    text("2840 pts", scoreX, row1Y);
    text("1975 pts", scoreX, row2Y);
    text("1260 pts", scoreX, row3Y);
    text(score + " pts", scoreX, row4Y);
}

// Draws the winning screen

function drawWinScene() {
    background(5, 20, 12);
    drawMovingStars();

    fill(255);
    textAlign(CENTER, CENTER);
    textFont("Orbitron");
    textSize(40);
    text("THE ALL-SEEING EYE HAS BEEN DESTROYED", width / 2, 110);

    textSize(22);
    text("Final Score: " + score, width / 2, 180);

    textSize(18);
    fill(220);
    text("The eye closes for the final time.", width / 2, 240);
}

function updateLeaderboard() {
  if (score > topScore) {
    topScore = score;
  }

  if (previousScore === 0 || score < previousScore) {
    previousScore = score;
  }
}

// Draws the Starting screen of game.

function startGame() {
    // Resets the game values when playing again.
    score = 0;
    level = 1;

    // Resets credits and inventory.
    spaceCredits = 0;
    inventory = createEmptyInventory();

    upgradeLevels = {
        rapidBlaster: 0,
        strongerBullets: 0,
        engineBoost: 0,
        reinforcedHull: 0,
        luckySalvage: 0
    };

    applyUpgradeStats();
    
    // Resets player lives.
    maxLives = STARTING_MAX_LIVES;
    lives = maxLives;

    startLevel();
}

function startLevel() {
    //Clears old sprites.
    clearGameSprites();

    // Resets shooting and enemy spawn durations.
    lastEnemySpawnTime = millis();
    lastPlayerShootTime = millis();

    // Removes power-up effects.
    doubleShotUntil = 0;
    shieldUntil = 0;

    // Resets level progress values.
    enemiesSpawnedThisLevel = 0;
    levelClearStarted = false;
    levelClearTime = 0;
    bossSpawned = false;

    // Creates the player spaceship sprite.
    spaceshipSprite = createSprite(width / 2, height - 70);
    spaceshipSprite.addImage(spaceshipImage);
    spaceshipSprite.scale = 0.085;
    spaceshipSprite.hitRadius = 15;

    currentScene = SCENE_GAME;
}

function startNextLevel() {
    // Allows player to go to the next level.
    level = level + 1;

    // When final level is reached it ends the game.
    if (level > FINAL_LEVEL) {
        winGame();
    } else {
        startLevel();
    }
}

// Terminates the game. 
function endGame() {
    playBoomSound();
    clearGameSprites();

    currentScene = SCENE_GAME_OVER;
}

function winGame() {
    playBoomSound();
    clearGameSprites();
    currentScene = SCENE_WIN;
}

function clearGameSprites() {
    // Removes the player sprite.
    if (spaceshipSprite) {
        spaceshipSprite.remove();
        spaceshipSprite = null;
    }

    // Clears all sprite groups from the game if it exists.
    enemies.removeSprites();
    bullets.removeSprites();
    enemyBullets.removeSprites();
    powerUps.removeSprites();
    itemDrops.removeSprites();
}

//Controlls the player's movement with key arrows.

function handlePlayerMovement() {
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
        spaceshipSprite.position.x = spaceshipSprite.position.x - playerSpeed;
    }

    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
        spaceshipSprite.position.x = spaceshipSprite.position.x + playerSpeed;
    }

    if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
        spaceshipSprite.position.y = spaceshipSprite.position.y - playerSpeed;
    }

    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
        spaceshipSprite.position.y = spaceshipSprite.position.y + playerSpeed;
    }

    spaceshipSprite.position.x = constrain(spaceshipSprite.position.x, 30, width - 30);
    spaceshipSprite.position.y = constrain(spaceshipSprite.position.y, 30, height - 30);
}


//Handles player shooting.

function handlePlayerShooting() {
    if (keyIsDown(32)) {
        if (millis() - lastPlayerShootTime > playerShootCooldown) {
            shootPlayerBullet();
            lastPlayerShootTime = millis();
        }
    }
}

//Allows the spaceship to shoot bullets and creates sounds.
function shootPlayerBullet() {
    if (millis() < doubleShotUntil) {
        createPlayerBullet(spaceshipSprite.position.x - 16, spaceshipSprite.position.y - 45);
        createPlayerBullet(spaceshipSprite.position.x + 16, spaceshipSprite.position.y - 45);
        // Allows double shot ability.
    } else {
        createPlayerBullet(spaceshipSprite.position.x, spaceshipSprite.position.y - 45);
    }

    playShootSound();
}

// Creates the fire bullets from the spaceship. 
function createPlayerBullet(x, y) {
    let bullet = createSprite(x, y, 12, 28);

    bullet.addImage(bulletsImage);
    bullet.scale = 0.08;

    // Controls the speed of the bullet.
    bullet.velocity.y = -10;
    // Bullets last for 80 frames.
    bullet.life = 80;

    //Sets bullet collsion size.
    bullet.hitRadius = 14;
    //Sets how much damage occurs when attacking enemies. 
    bullet.damage = bulletDamage;

    //Helps to detect when the bullet hits the enemy.
    bullet.setCollider("circle", 0, 0, 8);

    bullets.add(bullet);
}

// Returns the enemy settings for each level, including enemy count, spawn speed, and enemy types.

function getLevelConfig(levelNumber) {
    if (levelNumber === 1) {
        return {
            enemyCount: 8,
            spawnInterval: 1100,
            allowedEnemies: ["Alien"]
        };
    } else if (levelNumber === 2) {
        return {
            enemyCount: 12,
            spawnInterval: 950,
            allowedEnemies: ["Alien", "Meteor"]
        };
    } else if (levelNumber === 3) {
        return {
            enemyCount: 14,
            spawnInterval: 850,
            allowedEnemies: ["Alien", "Meteor", "ShooterAlien"]
        };
    } else if (levelNumber === 4) {
        return {
            enemyCount: 18,
            spawnInterval: 750,
            allowedEnemies: ["Alien", "Meteor", "ShooterAlien", "BlackHole"]
        };
    } else {
        return {
            bossLevel: true
        };
    }
}

// Spawns enemies based on the current level and difficulty settings.
function spawnEnemies() {
    let config = getLevelConfig(level);

    if (!config) {
        return;
    }

    let settings = difficultySettings[difficultyName] || difficultySettings.normal;

    if (config.bossLevel) {
        if (!bossSpawned) {
            spawnBoss();
            bossSpawned = true;
        }

        return;
    }

    if (enemiesSpawnedThisLevel >= config.enemyCount) {
        return;
    }

    let adjustedSpawnInterval = config.spawnInterval * settings.spawnIntervalMultiplier;

    if (millis() - lastEnemySpawnTime > adjustedSpawnInterval) {
        let enemyName = random(config.allowedEnemies);
        let enemyInfo = getEnemyInfoByName(enemyName);

        spawnEnemy(enemyInfo);

        enemiesSpawnedThisLevel = enemiesSpawnedThisLevel + 1;
        lastEnemySpawnTime = millis();
    }
}

// Finds and returns enemy data from the JSON file using the enemy name.
function getEnemyInfoByName(enemyName) {
    for (let i = 0; i < gameData.enemyTypes.length; i++) {
        if (gameData.enemyTypes[i].name === enemyName) {
            return gameData.enemyTypes[i];
        }
    }

    return gameData.enemyTypes[0];
}


function spawnEnemy(enemyInfo) {

    // Creates an enemy sprite, applies its properties. 
    let settings = difficultySettings[difficultyName] || difficultySettings.normal;
    let enemy = createSprite(random(60, width - 60), -70);

    enemy.enemyName = enemyInfo.name;
    enemy.health = enemyInfo.health;
    enemy.maxHealth = enemyInfo.health;
    enemy.points = enemyInfo.points;
    enemy.pattern = enemyInfo.pattern;
    enemy.dropItem = enemyInfo.dropItem;

    enemy.baseX = enemy.position.x;
    enemy.spawnTime = millis();

    enemy.lastShotTime = millis();
    enemy.shootInterval = enemyInfo.shootInterval || 1600;

    if (enemyInfo.name === "Alien") {
        enemy.addImage(alienImage);
        enemy.scale = 0.02;
        enemy.hitRadius = 15;

        enemy.enemyImage = alienImage;
        enemy.enemyScale = 0.02;

    } else if (enemyInfo.name === "Meteor") {
        enemy.addImage(meteorImage);
        enemy.scale = 0.07;
        enemy.hitRadius = 18;

        enemy.enemyImage = meteorImage;
        enemy.enemyScale = 0.07;

        enemy.velocity.x = random([-1, 1]) * random(0.4, 1.1);

    } else if (enemyInfo.name === "ShooterAlien") {
        enemy.addImage(alienImage);
        enemy.scale = 0.025;
        enemy.hitRadius = 18;

        enemy.enemyImage = alienImage;
        enemy.enemyScale = 0.025;

    } else if (enemyInfo.name === "BlackHole") {
        enemy.addImage(blackholeImage);
        enemy.scale = 0.07;
        enemy.hitRadius = 22;

        enemy.enemyImage = blackholeImage;
        enemy.enemyScale = 0.07;

    } else {
        enemy.shapeColor = color(255, 0, 0);
        enemy.hitRadius = 30;
    }

    enemy.velocity.y = enemyInfo.speed * settings.enemySpeedMultiplier;
    enemy.fadingOut = false;
    enemy.fadeAlpha = 255;

    enemies.add(enemy);
}

function spawnBoss() {
    // Creates the final boss with all of its properties. 
    let boss = createSprite(width / 2, 110);

    boss.enemyName = "VoidBoss";
    boss.health = 35;
    boss.maxHealth = 35;
    boss.points = 1000;
    boss.pattern = "boss";
    boss.dropItem = "darkMatter";

    boss.addImage(bossEyeImage);
    boss.scale = 0.18;
    boss.hitRadius = 85;

    boss.enemyImage = bossEyeImage;
    boss.enemyScale = 0.18;

    boss.baseX = width / 2;
    boss.spawnTime = millis();
    boss.lastShotTime = millis();
    boss.shootInterval = 1200;

    boss.fadingOut = false;
    boss.fadeAlpha = 255;

    enemies.add(boss);
}

function updateEnemyMovement() {
    // Updates each enemy's movement based on its pattern and keeps it within the canvas.
    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];

        if (enemy && !enemy.fadingOut) {
            let timeAlive = millis() - enemy.spawnTime;

            if (enemy.pattern === "zigzag") {
                enemy.position.x = enemy.baseX + sin(timeAlive / 300) * 60;
            } else if (enemy.pattern === "drift") {
                if (enemy.position.x < 40 || enemy.position.x > width - 40) {
                    enemy.velocity.x = enemy.velocity.x * -1;
                }
            } else if (enemy.pattern === "shooter") {
                enemy.position.x = enemy.baseX + sin(timeAlive / 350) * 75;
                enemyTryShoot(enemy);
            } else if (enemy.pattern === "blackhole") {
                enemy.position.x = enemy.baseX + sin(timeAlive / 500) * 35;
            } else if (enemy.pattern === "boss") {
                enemy.position.x = width / 2 + sin(timeAlive / 700) * 260;
                enemy.position.y = 110 + sin(timeAlive / 500) * 20;
                enemyTryBossShoot(enemy);
            }

            enemy.position.x = constrain(enemy.position.x, 40, width - 40);
        }
    }
}

function enemyTryShoot(enemy) {
    if (millis() - enemy.lastShotTime > enemy.shootInterval) {
        createEnemyBullet(enemy.position.x, enemy.position.y + 25, 0, 4);
        enemy.lastShotTime = millis();
    }
}

function enemyTryBossShoot(enemy) {
    if (millis() - enemy.lastShotTime > enemy.shootInterval) {
        createEnemyBullet(enemy.position.x, enemy.position.y + 50, 0, 4);
        createEnemyBullet(enemy.position.x - 35, enemy.position.y + 45, -1.5, 4);
        createEnemyBullet(enemy.position.x + 35, enemy.position.y + 45, 1.5, 4);

        enemy.lastShotTime = millis();
    }
}

function createEnemyBullet(x, y, xSpeed, ySpeed) {
    let bullet = createSprite(x, y, 8, 18);

    bullet.addImage(enemyBulletImage);
    bullet.scale = 0.07;

    // Controls the x speed of the bullet and y speed of the same bullet. 
    bullet.velocity.x = xSpeed;
    bullet.velocity.y = ySpeed;
    bullet.life = 160;
    bullet.hitRadius = 10;

    bullet.setCollider("circle", 0, 0, 8);

    enemyBullets.add(bullet);
}

// Handles the power ups.

function spawnPowerUp(x, y) {
    let powerUp = createSprite(x, y, 24, 24);

    let powerUpType = random(["doubleShot", "heart", "shield"]);

    powerUp.kind = powerUpType;
    powerUp.velocity.y = 2;
    powerUp.life = 250;
    powerUp.hitRadius = 18;

    if (powerUp.kind === "doubleShot") {
        powerUp.visible = false;
    } else if (powerUp.kind === "heart") {
        powerUp.visible = false;
    } else if (powerUp.kind === "shield") {
        powerUp.visible = false;
    }

    powerUps.add(powerUp);
}

function collectPowerUp(powerUp) {
    // Applies the collected power-up effect.
    if (powerUp.kind === "doubleShot") {
        doubleShotUntil = millis() + 6000;
        playHitSound();
    } else if (powerUp.kind === "heart") {
        if (lives < maxLives) {
            lives = lives + 1;
            playHitSound();
        }
    } else if (powerUp.kind === "shield") {
        shieldUntil = millis() + shieldDuration;
        playHitSound();
    }

    powerUp.remove();
}


function spawnItemDrop(x, y, enemy) {
    // Creates a collectible item drop from a killed enemy, randomly.
    if (random() > itemDropChance) {
        return;
    }

    let item = createSprite(x, y, 18, 18);

    item.kind = enemy.dropItem || "spaceJunk";
    item.velocity.y = 2.3;
    item.life = 260;
    item.hitRadius = 18;

    if (item.kind === "spaceJunk") {
        item.visible = false;
    } else if (item.kind === "meteorite") {
        item.visible = false;
    } else if (item.kind === "darkMatter") {
        item.visible = false;
    } else if (item.kind === "laserCore") {
        item.visible = false;
    }

    itemDrops.add(item);
}

function collectItemDrop(item) {
    // Adds the collected item to the inventory, removes it, and plays a sound.
    inventory[item.kind] = inventory[item.kind] + 1;
    item.remove();
    playHitSound();
}

// Calls on these functions and checks for collisions.

function checkCollisions() {
    checkBulletEnemyHits();
    checkEnemyBulletPlayerHits();
    checkEnemyPlayerHits();
    checkPowerUpPlayerHits();
    checkItemDropPlayerHits();
}

function updateEnemyFadeOuts() {
    // Fades out enemies that pass the player off the screen. 
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];

        if (enemy && spaceshipSprite && enemy.enemyName !== "VoidBoss") {
            if (!enemy.fadingOut && enemy.position.y > spaceshipSprite.position.y + 40) {
                enemy.fadingOut = true;
                enemy.fadeAlpha = 255;

                enemy.hitRadius = 0;
                enemy.visible = false;
            }

            if (enemy.fadingOut) {
                enemy.fadeAlpha = enemy.fadeAlpha - 10;

                if (enemy.fadeAlpha <= 0) {
                    enemy.remove();
                }
            }
        }
    }
}

function checkBulletEnemyHits() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];

        if (bullet) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                let enemy = enemies[j];

                if (enemy && !enemy.fadingOut) {
                    let distanceToEnemy = dist(
                        bullet.position.x,
                        bullet.position.y,
                        enemy.position.x,
                        enemy.position.y
                    );

                    if (distanceToEnemy < bullet.hitRadius + enemy.hitRadius) {
                        damageEnemy(bullet, enemy);
                        break;
                    }
                }
            }
        }
    }
}

function damageEnemy(bullet, enemy) {
    // Checks if player bullets hit enemies and applies damage when they collide.
    bullet.remove();

    enemy.health = enemy.health - bullet.damage;

    if (enemy.health <= 0) {
        score = score + enemy.points;

        // Applies credits when an enemy is killed.
        let earnedCredits = getEnemyCreditReward(enemy.enemyName);
        spaceCredits = spaceCredits + earnedCredits;

        spawnItemDrop(enemy.position.x, enemy.position.y, enemy);

        if (random() < powerUpDropChance && enemy.enemyName !== "VoidBoss") {
            spawnPowerUp(enemy.position.x, enemy.position.y);
        }

        if (enemy.enemyName === "VoidBoss") {
            enemy.remove();
            winGame();
            return;
        }

        enemy.remove();
        playHitSound();
    }
}

function getEnemyCreditReward(enemyName) {
    // Displays how many credits each enemy gives when killed.
    if (enemyName === "Alien") {
        return 1;
    } else if (enemyName === "Meteor") {
        return 2;
    } else if (enemyName === "ShooterAlien") {
        return 3;
    } else if (enemyName === "BlackHole") {
        return 4;
    } else if (enemyName === "VoidBoss") {
        return 25;
    }

    return 1;
}

function checkEnemyBulletPlayerHits() {
    // Checks if enemy bullets hit the player and decreases lives.
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let bullet = enemyBullets[i];

        if (bullet && spaceshipSprite) {
            let distanceToPlayer = dist(
                bullet.position.x,
                bullet.position.y,
                spaceshipSprite.position.x,
                spaceshipSprite.position.y
            );

            if (distanceToPlayer < bullet.hitRadius + spaceshipSprite.hitRadius) {
                bullet.remove();
                loseLife();
            }
        }
    }
}

function checkEnemyPlayerHits() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];

        if (enemy && spaceshipSprite && !enemy.fadingOut) {
            let distanceToPlayer = dist(
                enemy.position.x,
                enemy.position.y,
                spaceshipSprite.position.x,
                spaceshipSprite.position.y
            );

            if (distanceToPlayer < enemy.hitRadius + spaceshipSprite.hitRadius) {
                if (enemy.enemyName !== "VoidBoss") {
                    enemy.remove();
                }

                loseLife();
            }
        }
    }
}

function checkPowerUpPlayerHits() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        let powerUp = powerUps[i];

        if (powerUp && spaceshipSprite) {
            let distanceToPlayer = dist(
                powerUp.position.x,
                powerUp.position.y,
                spaceshipSprite.position.x,
                spaceshipSprite.position.y
            );

            if (distanceToPlayer < powerUp.hitRadius + spaceshipSprite.hitRadius) {
                collectPowerUp(powerUp);
            }
        }
    }
}

function checkItemDropPlayerHits() {
    for (let i = itemDrops.length - 1; i >= 0; i--) {
        let item = itemDrops[i];

        if (item && spaceshipSprite) {
            let distanceToPlayer = dist(
                item.position.x,
                item.position.y,
                spaceshipSprite.position.x,
                spaceshipSprite.position.y
            );

            if (distanceToPlayer < item.hitRadius + spaceshipSprite.hitRadius) {
                collectItemDrop(item);
            }
        }
    }
}

function loseLife() {
    // Removes one life unless the shield is active.
    if (millis() < shieldUntil) {
        return;
    }

    lives = lives - 1;
    lives = max(lives, 0);
    playHitSound();
}

// Handles the level progress of the game. 

function checkLevelProgress() {
    let config = getLevelConfig(level);

    if (config.bossLevel) {
        return;
    }

    if (
        !levelClearStarted &&
        enemiesSpawnedThisLevel >= config.enemyCount &&
        enemies.length === 0
    ) {
        levelClearStarted = true;
        levelClearTime = millis();
    }

    if (levelClearStarted && millis() - levelClearTime > 1000) {
    let levelBonus = level * 5;

    spaceCredits = spaceCredits + levelBonus;

    clearGameSprites();

    shopMessage =
        "Level " + level + " cleared! Bonus: +" +
        levelBonus + " credits.";

    enterShopScene();
}
}


function enterShopScene() {
    currentScene = SCENE_SHOP;
    displayedPurchasedUpgrade = "";
    shopVisitCount = shopVisitCount + 1;

    if (shopVisitCount === 1) {
        greetingSound.onended(function () {
            startShopkeeperDialogue(
                "What can I do for you today?",
                shopKeeperTalkImg,
                whatCanIDoSound
            );
        });

        whatCanIDoSound.onended(function () {
            startShopkeeperDialogue(
                "We have lots of great items.",
                shopKeeperTalkImg,
                lotsItemsSound
            );
        });

        startShopkeeperDialogue(
            "Oh, new customer.",
            shopKeeperTalkImg,
            greetingSound
        );

    } else {
        returnedSound.onended(function () {
            startShopkeeperDialogue(
                "What can I do for you?",
                shopKeeperBlushImg,
                whatCanSound
            );
        });

        startShopkeeperDialogue(
            "So you've returned.",
            shopKeeperBlushImg,
            returnedSound
        );
    }
}




// Cleans up all unwanted sprites.

function removeOffscreenSprites() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];

        if (enemy && enemy.position.y > height + 80) {
            enemy.remove();
        }
    }

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let bullet = enemyBullets[i];

        if (bullet && bullet.position.y > height + 40) {
            bullet.remove();
        }
    }

    for (let i = powerUps.length - 1; i >= 0; i--) {
        let powerUp = powerUps[i];

        if (powerUp && powerUp.position.y > height + 40) {
            powerUp.remove();
        }
    }

    for (let i = itemDrops.length - 1; i >= 0; i--) {
        let item = itemDrops[i];

        if (item && item.position.y > height + 40) {
            item.remove();
        }
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];

        if (bullet && bullet.position.y < -40) {
            bullet.remove();
        }
    }
}


//Empties the Inventory.

function createEmptyInventory() {
    return {
        spaceJunk: 0,
        meteorite: 0,
        darkMatter: 0,
        laserCore: 0
    };
}

function sellAllParts() {
    // Start with 0 credits.
    let earnedCredits = 0;

    // Based on how many credits the player has add the value of each item. 
    earnedCredits = earnedCredits + inventory.spaceJunk * itemValues.spaceJunk;
    earnedCredits = earnedCredits + inventory.meteorite * itemValues.meteorite;
    earnedCredits = earnedCredits + inventory.darkMatter * itemValues.darkMatter;
    earnedCredits = earnedCredits + inventory.laserCore * itemValues.laserCore;

    //Shows this message if there is nothing worth buying.
    if (earnedCredits <= 0) {
        shopMessage = "You have nothing worth buying. Come back with better junk.";
        return;
    }

    spaceCredits = spaceCredits + earnedCredits;

    // After selling all items, empty the inventory.
    inventory = createEmptyInventory();

    // Display this message. 
    shopMessage = "Sold parts for " + earnedCredits + " space credits.";
}

function buyUpgradeByNumber(number) {
    let index = number - 1;

    if (index < 0 || index >= shopUpgrades.length) {
        return;
    }

    let upgrade = shopUpgrades[index];
    let currentLevel = upgradeLevels[upgrade.key];

    if (currentLevel >= upgrade.maxLevel) {
        shopMessage = upgrade.name + " is already maxed.";
        return;
    }

    let cost = upgrade.costs[currentLevel];

    if (spaceCredits < cost) {
        shopMessage = "Not enough credits for " + upgrade.name + ".";
        return;
    }

    let oldMaxLives = maxLives;

    spaceCredits = spaceCredits - cost;
    upgradeLevels[upgrade.key] = upgradeLevels[upgrade.key] + 1;

    applyUpgradeStats();

    if (upgrade.key === "reinforcedHull" && maxLives > oldMaxLives) {
        lives = min(lives + 1, maxLives);
    }

    shopMessage = "Bought: " + upgrade.name + ".";
}

function applyUpgradeStats() {
    playerShootCooldown = max(110, 220 - upgradeLevels.rapidBlaster * 30);
    bulletDamage = 1 + upgradeLevels.strongerBullets;
    playerSpeed = 5 + upgradeLevels.engineBoost;

    maxLives = STARTING_MAX_LIVES + upgradeLevels.reinforcedHull;
    lives = min(lives, maxLives);

    itemDropChance = min(0.95, 0.7 + upgradeLevels.luckySalvage * 0.1);
    powerUpDropChance = min(0.3, 0.15 + upgradeLevels.luckySalvage * 0.04);
}

// Code for Head-Up-Display and other visuals. 

function drawHUD() {
    textAlign(LEFT, TOP);
    textSize(18);
    fill(255);

    text("Score: " + score, 20, 20);

    drawHearts();

    fill(255);
    text("Level: " + level, 20, 95);
    text("Difficulty: " + difficultyName, 20, 120);
    text("Credits: " + spaceCredits, 20, 145);

    if (millis() < doubleShotUntil) {
        fill(80, 255, 120);
        textSize(16);
        text("Power-up: Double Shot", 20, 195);
    }

    if (millis() < shieldUntil) {
        fill(80, 200, 255);
        textSize(16);
        text("Shield: Active", 20, 172);
    }

    drawBossHealthBar();
}

function drawBossHealthBar() {
    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];

        if (enemy && enemy.enemyName === "VoidBoss") {
            let barWidth = 420;
            let barHeight = 18;
            let x = width / 2 - barWidth / 2;
            let y = 25;

            rectMode(CORNER);
            noStroke();

            fill(70);
            rect(x, y, barWidth, barHeight);

            fill(180, 80, 255);
            rect(x, y, barWidth * (enemy.health / enemy.maxHealth), barHeight);

            fill(255);
            textAlign(CENTER, TOP);
            textSize(14);
            text("VOID BOSS", width / 2, y + 24);
        }
    }
}

function drawFadingEnemies() {
    imageMode(CENTER);

    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];

        if (enemy && enemy.fadingOut && enemy.enemyImage) {
            tint(255, enemy.fadeAlpha);

            image(
                enemy.enemyImage,
                enemy.position.x,
                enemy.position.y,
                enemy.enemyImage.width * enemy.enemyScale,
                enemy.enemyImage.height * enemy.enemyScale
            );

            noTint();
        }
    }
}

function drawPlayerShieldEffect() {
    if (millis() < shieldUntil && spaceshipSprite) {
        noFill();
        stroke(80, 200, 255);
        strokeWeight(3);

        circle(
            spaceshipSprite.position.x,
            spaceshipSprite.position.y,
            90
        );

        noStroke();
    }
}

function drawFallingHeartPowerUps() {
    for (let i = 0; i < powerUps.length; i++) {
        let powerUp = powerUps[i];

        if (powerUp && powerUp.kind === "heart") {
            fill(255, 40, 80);
            noStroke();
            drawHeart(powerUp.position.x, powerUp.position.y, 0.45);
        }
    }
}

function drawItemDropLabels() {
    textAlign(CENTER, CENTER);
    textSize(11);

    for (let i = 0; i < itemDrops.length; i++) {
        let item = itemDrops[i];

        if (item) {
            if (item.kind === "spaceJunk") {
                imageMode(CENTER);
                image(jBlockImage, item.position.x, item.position.y, 36, 24);
                imageMode(CORNER);
            } else if (item.kind === "meteorite") {
                imageMode(CENTER);
                image(mBlockImage, item.position.x, item.position.y, 36, 24);
                imageMode(CORNER);
            } else if (item.kind === "darkMatter") {
                imageMode(CENTER);
                image(dBlockImage, item.position.x, item.position.y, 36, 24);
                imageMode(CORNER);
            }
        }
    }
}

function drawHearts() {
    for (let i = 0; i < maxLives; i++) {
        if (i < lives) {
            fill(255, 40, 80);
        } else {
            fill(70);
        }

        noStroke();
        drawHeart(32 + i * 30, 63, 0.45);
    }
}

function drawHeart(x, y, size) {
    push();
    translate(x, y);
    scale(size);

    beginShape();
    vertex(0, -10);
    bezierVertex(-25, -35, -55, -5, 0, 35);
    bezierVertex(55, -5, 25, -35, 0, -10);
    endShape(CLOSE);

    pop();
}

// -------------------------
// Star background
// -------------------------

function createStars() {
    stars = [];

    for (let i = 0; i < 90; i++) {
        stars.push({
            x: random(width),
            y: random(height),
            size: random(1, 3),
            speed: random(0.5, 3)
        });
    }
}

function drawMovingStars() {
    noStroke();

    for (let i = 0; i < stars.length; i++) {
        let star = stars[i];

        fill(180);
        circle(star.x, star.y, star.size);

        star.y = star.y + star.speed;

        if (star.y > height) {
            star.y = 0;
            star.x = random(width);
        }
    }
}

// Allows for sound to be played or certain situations. 

function setupSound() {
    if (typeof p5.Oscillator === "undefined") {
        return;
    }

    shootOsc = new p5.Oscillator("triangle");
    shootOsc.start();
    shootOsc.amp(0);

    shootEnv = new p5.Envelope();
    shootEnv.setADSR(0.001, 0.05, 0, 0.03);
    shootEnv.setRange(0.2, 0);

    hitOsc = new p5.Oscillator("square");
    hitOsc.start();
    hitOsc.amp(0);

    hitEnv = new p5.Envelope();
    hitEnv.setADSR(0.001, 0.08, 0, 0.05);
    hitEnv.setRange(0.25, 0);

    boomOsc = new p5.Oscillator("sawtooth");
    boomOsc.start();
    boomOsc.amp(0);

    boomEnv = new p5.Envelope();
    boomEnv.setADSR(0.01, 0.2, 0, 0.2);
    boomEnv.setRange(0.3, 0);

    traderTalkOsc = new p5.Oscillator("triangle");
    traderTalkOsc.start();
    traderTalkOsc.amp(0);

    traderTalkEnv = new p5.Envelope();
    traderTalkEnv.setADSR(0.001, 0.03, 0, 0.02);
    traderTalkEnv.setRange(0.12, 0);
}

function startShopkeeperDialogue(line, faceImage, voiceSound) {
    fullShopkeeperDialogue = line;
    displayedShopkeeperDialogue = "";
    dialogueStartTime = millis();

    if (faceImage) {
        currentShopKeeperImg = faceImage;
    }

    // Keep the chosen face visible for at least 2 seconds
    shopkeeperFaceHoldUntil = millis() + 2000;

    if (voiceSound) {
        playTraderVoice(voiceSound);
    }
}

function playTraderVoice(voiceSound) {
    if (!voiceSound) {
        return;
    }

    if (typeof userStartAudio === "function") {
        userStartAudio();
    }

    if (currentTraderVoiceSound && currentTraderVoiceSound.isPlaying()) {
        currentTraderVoiceSound.stop();
    }

    currentTraderVoiceSound = voiceSound;
    currentTraderVoiceSound.play();
}

function updateShopkeeperDialogue() {
    let lettersToShow = floor((millis() - dialogueStartTime) / dialogueSpeed);

    lettersToShow = constrain(lettersToShow, 0, fullShopkeeperDialogue.length);

    displayedShopkeeperDialogue = fullShopkeeperDialogue.substring(0, lettersToShow);

    if (lettersToShow < fullShopkeeperDialogue.length) {
        if (millis() - lastTalkSoundTime > talkSoundDelay) {
            playTraderTalkSound();
            lastTalkSoundTime = millis();
        }
    } else {
        // Do not return to normal face until the hold time has passed
        if (millis() > shopkeeperFaceHoldUntil) {
            if (!currentTraderVoiceSound || !currentTraderVoiceSound.isPlaying()) {
                currentShopKeeperImg = shopKeeperImg;
            }
        }
    }
}

function playTraderTalkSound() {
    if (!traderTalkOsc || getAudioContext().state !== "running") {
        return;
    }

    traderTalkOsc.freq(random(180, 280));
    traderTalkEnv.play(traderTalkOsc);
}

function playShootSound() {
    if (!shootOsc || getAudioContext().state !== "running") {
        return;
    }

    shootOsc.freq(650);
    shootEnv.play(shootOsc);
}

function playHitSound() {
    if (!hitOsc || getAudioContext().state !== "running") {
        return;
    }

    hitOsc.freq(180);
    hitEnv.play(hitOsc);
}

function playBoomSound() {
    if (!boomOsc || getAudioContext().state !== "running") {
        return;
    }

    boomOsc.freq(80);
    boomEnv.play(boomOsc);
}

// Spaceship is controlled here with pressing arrows
// Can move left -> right & up and down

function keyPressed() {
    if (typeof userStartAudio === "function") {
        userStartAudio();
    }

    if (currentScene === SCENE_INTRO) {
        if (keyCode === ENTER) {
            introVideo.stop();
            currentScene = SCENE_LOADING;
            loadingStartTime = millis();
        }

        return false;
    }

    if (currentScene === SCENE_MENU) {
        if (key === "1") {
            difficultyName = "easy";
        }

        if (key === "2") {
            difficultyName = "normal";
        }

        if (key === "3") {
            difficultyName = "hard";
        }

        if (keyCode === ENTER) {
            startGame();
        }

    } else if (currentScene === SCENE_SHOP) {

    if (key === "g" || key === "G") {
        startShopkeeperDialogue(
            "Oh, new customer.",
            shopKeeperTalkImg,
            greetingSound
        );
    }

    if (key === "s" || key === "S") {
        sellAllParts();

        startShopkeeperDialogue(
            "Oh come now, I have a business to run.",
            shopKeeperAngryImg,
            businessRunSound
        );
    }

    if (key === "1") {
    let oldLevel = upgradeLevels.rapidBlaster;

    buyUpgradeByNumber(1);

    if (upgradeLevels.rapidBlaster > oldLevel) {
        displayedPurchasedUpgrade = "rapidBlaster";

        startShopkeeperDialogue(
            "An excellent choice!",
            shopKeeperTalkImg,
            excellentChoiceSound
        );
    } else {
        startShopkeeperDialogue(
            "Can't afford that right now.",
            shopKeeperAngryImg,
            cantAffordSound
        );
    }
}

    if (key === "2") {
    let oldLevel = upgradeLevels.strongerBullets;

    buyUpgradeByNumber(2);

    if (upgradeLevels.strongerBullets > oldLevel) {
        displayedPurchasedUpgrade = "strongerBullets";

        startShopkeeperDialogue(
            "An excellent choice!",
            shopKeeperTalkImg,
            excellentChoiceSound
        );
    } else {
        startShopkeeperDialogue(
            "Can't afford that right now.",
            shopKeeperAngryImg,
            cantAffordSound
        );
    }
}

    if (key === "3") {
    let oldLevel = upgradeLevels.engineBoost;

    buyUpgradeByNumber(3);

    if (upgradeLevels.engineBoost > oldLevel) {
        displayedPurchasedUpgrade = "engineBoost";

        startShopkeeperDialogue(
            "You have fine taste.",
            shopKeeperBlushImg,
            fineTasteSound
        );
    } else {
        startShopkeeperDialogue(
            "Can't afford that right now.",
            shopKeeperAngryImg,
            cantAffordSound
        );
    }
}

    if (key === "4") {
    let oldLevel = upgradeLevels.reinforcedHull;

    buyUpgradeByNumber(4);

    // Purchase succeeded
    if (upgradeLevels.reinforcedHull > oldLevel) {
        displayedPurchasedUpgrade = "reinforcedHull";

        startShopkeeperDialogue(
            "A wise choice!",
            shopKeeperLaughImg,
            wiseChoiceSound

        );
    }

    else {
        startShopkeeperDialogue(
            "Can't afford that right now.",
            shopKeeperAngryImg,
            cantAffordSound
        );
    }
}

   if (key === "5") {
    let oldLevel = upgradeLevels.luckySalvage;

    buyUpgradeByNumber(5);

    // Purchase succeeded
    if (upgradeLevels.luckySalvage > oldLevel) {
        displayedPurchasedUpgrade = "luckySalvage";
        startShopkeeperDialogue(
            "You have fine taste.",
            shopKeeperBlushImg,
            fineTasteSound
);
    }

    // Item is already fully upgraded
    else if (upgradeLevels.luckySalvage >= shopUpgrades[4].maxLevel) {
        startShopkeeperDialogue(
            "That scanner is already operating at maximum range.",
            shopKeeperTalkImg
        );
    }

    // Player does not have enough credits
    else {
        startShopkeeperDialogue(
            "Can't afford that right now.",
            shopKeeperAngryImg,
            cantAffordSound
        );
    }
}

    if (keyCode === ENTER) {
        startShopkeeperDialogue(
            "Leaving already? Risky choice.",
            shopKeeperShockedImg
        );

        startNextLevel();
    }
}
}

        