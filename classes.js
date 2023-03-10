class Sprite {
    constructor({ position, velocity, image, frames = {max : 1, hold: 10}, sprites = {} , animate = false, rotation = 0}){
        this.position = position;
        this.velocity = velocity;
        this.image = new Image();
        this.frames = {...frames, val: 0, elapsed: 0};
        this.image.onload = () => {
            this.width = this.image.width / frames.max;
            this.height = this.image.height;
        }
        this.image.src = image.src;

        this.animate = animate;
        this.sprites = sprites;
        this.opacity = 1;
        this.rotation = rotation;
    }

    draw(){

        //when using global properties (which will effect all the canvas),
            //wrap the code between context.save() and context.restore()
        context.save();

        context.globalAlpha = this.opacity;

        //add a rotation effect 
        context.translate(this.position.x + this.width/2, this.position.y + this.height/2); //translate the rotation center
        context.rotate(this.rotation);
        context.translate(-this.position.x - this.width/2, -this.position.y - this.height/2)

        context.drawImage(
            this.image,
            this.frames.val * this.width, //crop start position x axis
            0, //crop end position y axis
            this.image.width / this.frames.max, //crop width
            this.image.height, //crop height
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height
        );

        context.restore();
        
        if(!this.animate) return;

        if(this.frames.max > 1) this.frames.elapsed = (this.frames.elapsed + 1) % this.frames.hold;

        if(this.frames.elapsed === 0)this.frames.val = (this.frames.val+1) % this.frames.max;
    
    }


}

class Monster extends Sprite {

    constructor({ position, velocity, image, frames = {max : 1, hold: 10}, sprites = {} , animate = false, rotation = 0, isEnemy = false, name = '', attacks}){
        super({position, velocity, image, frames, sprites, animate, rotation})
        this.isEnemy = isEnemy;
        this.name = name;
        this.health = 100;
        this.attacks = attacks;
    }

    faint(){
        document.querySelector('#dialogueBox').innerText = `${this.name} fainted!`;
        gsap.to(this.position, {
            y: this.position.y + 20,
        })

        gsap.to(this, {
            opacity: 0,
        })
        audio.Battle.stop();
        audio.victory.play();
    }

    attack({ attack, recipient, renderedSprites}){
        
        document.querySelector('#dialogueBox').style.display = 'block';
        document.querySelector('#dialogueBox').innerText = `${this.name} used ${attack.name}`;

        const direction = this.isEnemy ? -1 : 1;
        const recipientHealthBar = this.isEnemy ? '#playerHealthBar' : '#enemyHealthBar';
        recipient.health -= attack.damage;

        switch(attack.name){
            case 'Fireball' :

                audio.initFireball.play();
                //set the fireball object
                const fireballImage = new Image();
                fireballImage.src = './Assets/Images/fireball.png';
                const fireball = new Sprite({
                    position: {
                        x: this.position.x,
                        y: this.position.y,
                    },
                    image: fireballImage,
                    frames: {
                        max: 4,
                        hold: 10,
                    },
                    animate: true,
                    rotation: 1 * direction,
                })

                //render the fireball
                renderedSprites.splice(1, 0, fireball); //add the fireball to the middle of the array

                //animate fireball
                gsap.to(fireball.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    onComplete: () => {
                        renderedSprites.splice(1, 1);

                        //recipient health decreases
                        gsap.to(recipientHealthBar, {
                            width: recipient.health + '%',
                            
                        })
        
                        //recipient gets hit
                        audio.fireballHit.play();
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08,
                        })
        
                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.08,
                        })
                    }
                })


                break;
            case 'Tackle': 

                gsap.timeline().to(this.position, {
                    x: this.position.x - 20 * direction,
                }).to(this.position, {
                    x: this.position.x + 40 * direction,
                    duration: 0.1,
                    onComplete: () => {
        
                        //recipient health decreases
                        gsap.to(recipientHealthBar, {
                            width: recipient.health + '%',
                            
                        })
        
                        //recipient gets hit
                        audio.tackle.play();
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08,
                        })
        
                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.08,
                        })
                    }
                }).to(this.position, {
                    x: this.position.x,
                })

                break;
        }
        
    }
}

class Boundary {
    static width = 48; //12px from "Tiled" zoomed by 400% => 48
    static height = 48;
    constructor({ position }){
        this.position = position;
    }

    draw(){
        context.fillStyle = 'transparent';
        context.fillRect(this.position.x, this.position.y, Boundary.width, Boundary.height);
    }
}