"use strict";
let lives = 3;
let playerX = 350; //starting x: 300px long -> middle at 500px -> start with player centered
let playerY = 650; //starting y: 150px tall
let playerSpeed = 20;
let score = 0;
let objSpeed = 10; //speed of falling object
let prevObjSpeed = objSpeed;
let objSpawnRate = 2000; //every 2s
let lost = false;
let maxObjects = 5;
let powerChance = 15;
let objectCounter = 0;
let activeObjects = 0;

let spawnInterval;
let speedInterval;
let backgroundInterval;
// have a play button that starts a video intro, and then when the video is over the svg will be created and have the onload="start()"

async function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function onloadSetup() {
    document.addEventListener("keydown", function(event) {
    if (event.key.toLowerCase() === "a" || event.key === "ArrowLeft") {
        if (!(playerX <= 0)) {
            playerX -= playerSpeed;
            document.getElementById("player").setAttribute("x", playerX);
        }

    }
    else if (event.key.toLowerCase() === "d" || event.key === "ArrowRight") {
        if (!(playerX >= 700)) { //account for 300px playerWidth
            playerX += playerSpeed;
            document.getElementById("player").setAttribute("x", playerX);                
        }

    }
});
}

function setup() {
    loadBackground();
    drawPlayer();
     spawnInterval = setInterval(function() {
        objSpawnRate -= 100;
    }, 12000); //increase spawn rate every 12 seconds
    speedInterval = setInterval(function() {
        objSpeed += 4;
        objSpeed = Math.max(objSpeed, 1);
    }, 24000); //increase falling object speed every 24s
    beginFalling();
}

function reset() {
    clearInterval(spawnInterval);
    clearInterval(speedInterval);
    clearInterval(backgroundInterval);
    document.getElementById("lives").innerHTML = "Lives Left: 3";
    document.getElementById("score").innerHTML = "Score: 0";
    document.getElementById("mySVG").innerHTML = "";
    lost = false;
    lives = 3;
    score = 0;
    playerX = 350;
    playerY = 650;
    playerSpeed = 20;
    objSpeed = 10;
    prevObjSpeed = objSpeed;
    objSpawnRate = 2000;
    activeObjects = 0;
    objectCounter = 0;
    setup();
}

async function beginFalling() {
    while (!lost) {

        while (activeObjects >= maxObjects) {
            await sleep(100);
        }
        //after loop guarantees no more than 5 objects at once
        let img = getRandomObject();
        spawnObject(img, randomX(), createID(), objSpeed);

        if (powerUp()) {
            while (activeObjects >= maxObjects) {
                await sleep(100);
            }
            let powerImg = getRandomObject(true);
            spawnObject(powerImg, randomX(), createID(), objSpeed - (objSpeed/2));
        }

        if (lives <= 0) {
            lost = true;
        }

        await sleep(objSpawnRate);
    }

}

function getRandomObject(isPowerUp=false) {
    let randObj = "pictures/";

    let isDog = Math.round(Math.random());
    let num = 0;
    if (isDog && !isPowerUp) {
        num = Math.floor(Math.random() * 3 + 1);
        randObj += "dog" + num + ".png";
    }
    else if (!isDog && !isPowerUp){
        num = Math.floor(Math.random() * 4 + 1);
        randObj += "cat" + num + ".png";
    }
    else {
        num = Math.floor(Math.random() * 3 + 1);
        randObj += "powerUp" + num + ".png";
    }

    return randObj;
}

function powerUp() {
    return Math.round(Math.random() * 100) <= powerChance;
}

function randomX() {
    return Math.floor(Math.random() * 925 + 1); //account for 75px width
}

function createID() {
    return "obj" + (objectCounter++); //returns the initial value of objectCounter first then increments
}

async function spawnObject(imgURL, startX, id, speed) {
    activeObjects ++;
    let timeSlowActive = false;
    document.getElementById("mySVG").innerHTML += "<image id='" + id + "' x='" + startX + "' y='0' height='75' width='75' href='" + imgURL + "'/>";

    for (let i = 0; i <= 750; i+=speed) {
        speed = Math.max(speed, 1);
        if (document.getElementById(id)) {
            document.getElementById(id).setAttribute("y", i);
            await sleep(20);
            if (i >= 750 && ((startX + 38) <= playerX || (startX + 38) >= (playerX + 300)) && !document.getElementById(id).getAttribute("href").includes("powerUp")) {
                lives --;
                // console.log("lives: " + lives);
                document.getElementById("lives").innerHTML = "Lives Left: " + lives;
                document.getElementById(id).outerHTML = "";
                activeObjects --;            
            }
            else if (i >= 650 && (startX + 38) >= playerX && (startX + 38) <= (playerX + 300) && !document.getElementById(id).getAttribute("href").includes("powerUp")){
                score ++;
                // console.log("score: "+ score);
                document.getElementById("score").innerHTML = "Score: " + score;
                document.getElementById(id).outerHTML = "";
                activeObjects --;
            }
            else if (i >=650 && (startX + 38) >= playerX && (startX + 38) <= (playerX + 300) && document.getElementById(id).getAttribute("href").includes("powerUp")){
                if (document.getElementById(id).getAttribute("href").includes("powerUp1")) {
                    lives ++;
                    document.getElementById("lives").innerHTML = "Lives Left: " + lives;
                    document.getElementById(id).outerHTML = "";
                    activeObjects --;
                    // console.log("extra life: " + lives);                    
                }
                else if (document.getElementById(id).getAttribute("href").includes("powerUp2")) {
                    if (!timeSlowActive) {
                        timeSlowActive = true;
                        prevObjSpeed = objSpeed;
                        objSpeed -= (objSpeed/2);
                        objSpeed = Math.max(objSpeed, 1);
                        setTimeout(resetState, 5000);
                        document.getElementById(id).outerHTML = "";
                        activeObjects --;
                        console.log("slower objects: " + objSpeed);
                        timeSlowActive = false;                      
                    }
                   
                }
                else if (document.getElementById(id).getAttribute("href").includes("powerUp3")) {
                    playerSpeed += 30;
                    document.getElementById(id).outerHTML = "";
                    activeObjects --;
                    console.log("faster basket: " + playerSpeed);                
                    setTimeout(resetState, 5000);
                }
            }
            else if (i >= 750 && ((startX + 38) <= playerX || (startX + 38) >= (playerX + 300)) && document.getElementById(id).getAttribute("href").includes("powerUp")) {
                document.getElementById(id).outerHTML = "";
                activeObjects --;      
            }
        }

    }

}

function resetState() {
    playerSpeed = 20;
    objSpeed = prevObjSpeed;
    console.log("reset, playerSpeed= " + playerSpeed + "speed = "+ objSpeed);
}

function drawPlayer() {
    if (!document.getElementById("player")) {
        document.getElementById("mySVG").innerHTML += "<image id='player' x='" + playerX + "' y='" + playerY + "' height='150' width='300' href='pictures/basket.png'/>";
    }
}

function loadBackground() {
    let bgWidth = 2000;
    let visibleWidth = 1000;
    let scrollX = 0;
    let scrollSpeed = 2 //12px every second    
    document.getElementById("mySVG").innerHTML += "<image id='background1' x='0' y='0' height='800' width='2000' href='pictures/background.png'/>";
    document.getElementById("mySVG").innerHTML += "<image id='background2' x='" + bgWidth + "' y='0' height='800' width='2000' href='pictures/background.png'/>";

     backgroundInterval = setInterval(function() {
        scrollX -= scrollSpeed; //move in negative to go from right to left

        if (scrollX <= -bgWidth) {
            scrollX += bgWidth; //reset x
        }

        document.getElementById("background1").setAttribute("x", scrollX);
        document.getElementById("background2").setAttribute("x", scrollX + bgWidth);

    }, 20)

}