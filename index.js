audio.Map.play();
/* Setting up the canvas  */
//get the canvas element from html
const canvas = document.querySelector('canvas');

//get the 2D context object
const context = canvas.getContext('2d');

//set the dimensions of the canvas
canvas.width = 1024;
canvas.height = 576;

/* Setting up the map */

//create an img element of the map
const mapImage = new Image();
mapImage.src = './Assets/Images/Pellet Town.png';
const tilesPerWidth = 70; //the map has 70 tiles as width

//create the foreground image
//create an img element of the map
const foregroundImage = new Image();
foregroundImage.src = './Assets/Images/foreground.png';

//create the images of the player
const playerDownImage = new Image();
playerDownImage.src = './Assets/Images/playerDown.png';

const playerUpImage = new Image();
playerUpImage.src = './Assets/Images/playerUp.png';

const playerLeftImage = new Image();
playerLeftImage.src = './Assets/Images/playerLeft.png';

const playerRightImage = new Image();
playerRightImage.src = './Assets/Images/playerRight.png';

//offset the map to get into the middle
const offset = {
    x:  -740,
    y: -645,
}

//create a background object
const background = new Sprite({
    position: offset,
    image: mapImage
});

//create a foreground object
const foreground = new Sprite({
    position: offset,
    image: foregroundImage,
});

//create the player object
const playerImageWidth = 192;
const playerImageHeight = 68;
const player = new Sprite({
    position: {
        x: canvas.width / 2 - playerImageWidth /8, 
        y: canvas.height / 2 - playerImageHeight /2,
    },
    image: playerDownImage,
    frames: {
        max: 4,
        hold: 10,
    },
    velocity: 5,
    sprites: {
        up: playerUpImage,
        down: playerDownImage,
        left: playerLeftImage,
        right: playerRightImage,
    }
})

//set up the collisions map
collisionsMap = [];
for(let i = 0; i < collisions.length; i+=tilesPerWidth) {
    collisionsMap.push(collisions.slice(i, i+tilesPerWidth));
}

const boundaries = [];
collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if(symbol === 1025) boundaries.push( new Boundary({
            position: {
                x: j * Boundary.width + offset.x,
                y: i * Boundary.height + offset.y,
            }
        }))
    });
});

//set up the battle zones map
const battleZonesMap = [];
for(let i = 0; i < battleZonesData.length; i+=tilesPerWidth) {
    battleZonesMap.push(battleZonesData.slice(i, i+tilesPerWidth));
}

const battleZones = [];
battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if(symbol === 1025) battleZones.push( new Boundary({
            position: {
                x: j * Boundary.width + offset.x,
                y: i * Boundary.height + offset.y,
            }
        }))
    });
});

//setup the keys object
const keys =  {
    w: {
        pressed: false,
    },
    a: {
        pressed: false,
    },
    s: {
        pressed: false,
    },
    d: {
        pressed: false,
    },
    lastKey: ''
}

//group movable objects in one array
const movables = [background, ...boundaries, ...battleZones];

//setup the collision detection function
const rectangularCollision = (player, boundary) => {
    return player.position.x + player.width >= boundary.position.x
    && player.position.x <= boundary.position.x + Boundary.width
    && player.position.y <= boundary.position.y + Boundary.width
    && player.position.y + player.height >= boundary.position.y
}

const battle = {
    initiated: false,
}

//set up the animation function
function animate(){
    const animationID = window.requestAnimationFrame(animate);
    //draw the map on the canvas
    background.draw();

    //draw the boundaries
    boundaries.forEach(boundary => {
        boundary.draw();
    })

    //draw the battlezones
    battleZones.forEach(battleZone => {
        battleZone.draw();
    })

    //draw the player image cropped
    player.draw();
    foreground.draw();
    player.animate = false;

    if(battle.initiated) return;

    //check if the player is moving in a battle zone
    if(keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed){
        let overlapingArea = 0;
        for(let i = 0; i < battleZones.length; i++){

            const battleZone = battleZones[i];

            //calculate the area of the intersection between the player and the battle zone
            overlapingArea = (Math.min(player.position.x + player.width, battleZone.position.x + Boundary.width) - Math.max(player.position.x, battleZone.position.x))
                * (Math.min(player.position.y + player.height, battleZone.position.y + Boundary.height) - Math.max(player.position.y, battleZone.position.y));
            
            if(rectangularCollision(player, battleZone)
                && overlapingArea > (player.width * player.height) / 2
                && Math.random() < 0.05){

                //deactivate the current animatino loop
                window.cancelAnimationFrame(animationID);
                    
                ///Activate a battle
                battle.initiated = true;
                audio.Map.stop();
                audio.initBattle.play();
                audio.Battle.play();

                gsap.to('#overlappingDiv', {
                    opacity: 1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.4,
                    onComplete(){
                        gsap.to('#overlappingDiv', {
                            opacity: 1,
                            duration: 0.4,
                            onComplete(){

                                //activate a new animation loop
                                initBattle();
                                animateBattle();
                                gsap.to('#overlappingDiv', {
                                    opacity: 0,
                                    duration: 0.4,
                                })
                            }
                        })

                    }

                })
                
                break;
            }
        }
    }

    //move the movables according to the keys
    if(keys.w.pressed && keys.lastKey === 'w'){
        
        player.animate = true;
        player.image = player.sprites.up;

        for(let i = 0; i < boundaries.length; i++){

            const boundary = boundaries[i];
            if(rectangularCollision(player, { ...boundary, position: {
                x: boundary.position.x,
                y: boundary.position.y + player.velocity,
            }})
            ){
                player.animate = false;
                break;
            }
        }

        if(player.animate){
            movables.forEach( movable => movable.position.y += player.velocity);
        }
    }
    else if(keys.a.pressed && keys.lastKey === 'a') {
            
        player.animate = true;
        player.image = player.sprites.left;

        for(let i = 0; i < boundaries.length; i++){

            const boundary = boundaries[i];
            if(rectangularCollision(player, { ...boundary, position: {
                x: boundary.position.x + player.velocity,
                y: boundary.position.y,
            }})
            ){
                player.animate = false;
                break;
            }
        }

        if(player.animate){
            movables.forEach( movable => movable.position.x += player.velocity);
        }
    }
    else if(keys.s.pressed && keys.lastKey === 's'){
            
        player.animate = true;
        player.image = player.sprites.down;

        for(let i = 0; i < boundaries.length; i++){

            const boundary = boundaries[i];
            if(rectangularCollision(player, { ...boundary, position: {
                x: boundary.position.x,
                y: boundary.position.y - player.velocity,
            }})
            ){
                player.animate = false;
                break;
            }
        }

        if(player.animate){
            movables.forEach( movable => movable.position.y -= player.velocity);
        }
    }
    else if(keys.d.pressed && keys.lastKey === 'd'){
            
        player.animate = true;
        player.image = player.sprites.right;

        for(let i = 0; i < boundaries.length; i++){

            const boundary = boundaries[i];
            if(rectangularCollision(player, { ...boundary, position: {
                x: boundary.position.x - player.velocity,
                y: boundary.position.y,
            }})
            ){
                player.animate = false;
                break;
            }
        }

        if(player.animate){
            movables.forEach( movable => movable.position.x -= player.velocity);
        }
    }
}

animate();

/* Setting up the move controls */
addEventListener('keydown', ( { key } )=>{
    switch (key) {
        case 'w':
            keys.w.pressed = true;
            keys.lastKey = key;
            break;
        case 'a':
            keys.a.pressed = true;
            keys.lastKey = key;
            break;
        case 's':
            keys.s.pressed = true;
            keys.lastKey = key;
            break;
        case 'd':
            keys.d.pressed = true;
            keys.lastKey = key;
            break;
    } 
})

addEventListener('keyup', ( { key}) => {
    keys[key] ? keys[key].pressed = false : '';
})

