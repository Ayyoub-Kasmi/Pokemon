//create a battle background object
const battleBackgroundImage = new Image();
battleBackgroundImage.src = './Assets/Images/battleBackground.png';

const battleBackground = new Sprite({
    position: {
        x: 0,
        y: 0,
    },
    image: battleBackgroundImage,
})

//create monsters
let emby;
let  draggle;
let renderedSprites;
let queue;


function initBattle(){

    document.querySelector('#userInterface').style.display = 'block';
    document.querySelector('#dialogueBox').style.display = 'none';
    document.querySelector('#playerHealthBar').style.width = '100%';
    document.querySelector('#enemyHealthBar').style.width = '100%';
    document.querySelector('#attacksBox').replaceChildren();

    emby = new Monster({...monsters.Emby, position: {x: 280, y: 325}});
    draggle = new Monster({...monsters.Draggle, position: {x: 800, y: 100}});
    
    
    renderedSprites = [draggle, emby];
    queue = [];

    emby.attacks.forEach(attack => {
        const button = document.createElement('button');
        button.innerText = attack.name;
        document.querySelector('#attacksBox').append(button);
    })

    /* Setting up battle controls */
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', ({ target }) => {
            
            emby.attack({
                attack: attacks[target.innerText],
                recipient: draggle,
                renderedSprites,
            })
    
            //check if enemy died
            if(draggle.health <= 0) {
                queue.push( () => {
                    draggle.faint();
                })
    
                queue.push( () => {
                    gsap.to('#overlappingDiv', {
                        opacity: 1,
                        onComplete: () => {
                            cancelAnimationFrame(battleAnimationID);
                            animate();
    
                            document.querySelector('#userInterface').style.display = 'none';
                            gsap.to('#overlappingDiv', {
                                opacity: 0,
                            })

                            battle.initiated = false;
                            audio.Map.play();
                        }
                    })
                })
                return;
            }
    
            const randomAttack = draggle.attacks[Math.floor( Math.random() * draggle.attacks.length)];
    
            queue.push(() => {
                draggle.attack({
                    attack: randomAttack,
                    recipient: emby,
                    renderedSprites,
                })
    
                //check if ally died
                if(emby.health <= 0) {
                    queue.push( () => {
                        emby.faint();
                    })
                    
                    queue.push( () => {
                        gsap.to('#overlappingDiv', {
                            opacity: 1,
                            onComplete: () => {
                                cancelAnimationFrame(battleAnimationID);
                                animate();
        
                                document.querySelector('#userInterface').style.display = 'none';
                                gsap.to('#overlappingDiv', {
                                    opacity: 0,
                                })

                                battle.initiated = false;
                                audio.Map.play();
                            }
                        })
                    })
                    return;
                }
            })
        })
    
        button.addEventListener('mouseenter', ({ target }) =>{
            document.querySelector('#attackType').innerText = attacks[target.innerText].type;
            document.querySelector('#attackType').style.color = attacks[target.innerText].color;
        })
    })
}

let battleAnimationID;

function animateBattle(){
    battleAnimationID = window.requestAnimationFrame(animateBattle);
    battleBackground.draw();
    renderedSprites.forEach( sprite => sprite.draw());
}

// initBattle();
// animateBattle();


document.querySelector('#dialogueBox').addEventListener('click', ({ target }) => {
    
    if(queue.length){
        queue[0]();
        queue.shift();
    } else {
        target.style.display = 'none';
    }
})
