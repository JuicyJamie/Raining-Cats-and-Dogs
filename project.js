"use strict";
let lives = 3;
let playerX = 350; //starting x: 300px long -> middle at 500px -> start with player centered
let playerY = 650; //starting y: 150px tall
let playerSpeed = 20;
let score = 0;
let objSpeed = 10; //speed of falling object
let prevObjSpeed = objSpeed;
let objSpawnRate = 1500; //every 1.5s
let lost = false;
let maxObjects = 5;
let powerChance = 15;
let objectCounter = 0;
let activeObjects = 0;
// the spawn rate of objects will increase every 12 seconds
// the speed of the falling objects will increase every 24 seconds
// the background will move from A to B in 12 seconds

// have a play button that starts a video intro, and then when the video is over the svg will be created and have the onload="start()"

async function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function setup() {
    drawPlayer();
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
    beginFalling();
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

    document.getElementById("mySVG").innerHTML += "<image id='" + id + "' x='" + startX + "' y='0' height='75' width='75' href='" + imgURL + "'/>";

    for (let i = 0; i < 750; i+=speed) {
        if (document.getElementById(id)) {
            document.getElementById(id).setAttribute("y", i);
            await sleep(20);
            if (i >= 700 && ((startX + 38) <= playerX || (startX + 38) >= (playerX + 300)) && !document.getElementById(id).getAttribute("href").includes("powerUp")) {
                lives --;
                console.log("lives: " + lives);
                document.getElementById(id).outerHTML = "";
                activeObjects --;            
            }
            else if (i >= 700 && (startX + 38) >= playerX && (startX + 38) <= (playerX + 300) && !document.getElementById(id).getAttribute("href").includes("powerUp")){
                score ++;
                console.log("score: "+ score);
                document.getElementById(id).outerHTML = "";
                activeObjects --;
            }
            else if (i >= 700 && (startX + 38) >= playerX && (startX + 38) <= (playerX + 300) && document.getElementById(id).getAttribute("href").includes("powerUp")){
                if (document.getElementById(id).getAttribute("href").includes("powerUp1")) {
                    lives ++;
                    document.getElementById(id).outerHTML = "";
                    activeObjects --;
                    console.log("extra life: " + lives);                    
                }
                else if (document.getElementById(id).getAttribute("href").includes("powerUp2")) {
                    prevObjSpeed = objSpeed;
                    objSpeed -= (objSpeed/2);
                    setTimeout(resetState, 5000);
                    document.getElementById(id).outerHTML = "";
                    activeObjects --;
                    console.log("slower objects: " + objSpeed);                    
                }
                else if (document.getElementById(id).getAttribute("href").includes("powerUp3")) {
                    playerSpeed += 30;
                    console.log("faster basket: " + playerSpeed);                    
                    setTimeout(resetState, 5000);
                }
            }
            else if (i >= 700 && ((startX + 38) <= playerX || (startX + 38) >= (playerX + 300)) && document.getElementById(id).getAttribute("href").includes("powerUp")) {
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