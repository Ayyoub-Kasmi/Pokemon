const monsters = {
    Emby: {
        position: {
            x: 280,
            y: 325,
        },
        image: {
            src: './Assets/Images/embySprite.png',
        },
        frames: {
            max: 4,
            hold: 30,
        },
        animate: true,
        name: 'Emby',
        attacks: [attacks.Tackle, attacks.Fireball],
    },
    Draggle: {
        position: {
            x: 800,
            y: 100,
        },
        image: {
            src: './Assets/Images/draggleSprite.png',
        },
        frames: {
            max: 4,
            hold: 30,
        },
        animate: true,
        isEnemy: true,
        name: 'Draggle',
        attacks: [attacks.Tackle, attacks.Fireball],
    }
}