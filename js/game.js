import { Player } from "./player.js";
import  { Projectile } from "./projectile.js";
import { Enemy } from "./enemy.js";
import { data } from "./data.js";
import { radialCollision } from "./utils.js";

let gameMode = data.mode.DEBUG;
let gameState = data.state.MENU;
let animationID;

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();


const player = new Player(canvas.width * 0.5, canvas.height * 0.5, 24, "teal");

const projectiles = [];
const enemies = [];

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (data.ENEMY_MAX_SIZE - data.ENEMY_MIN_SIZE) + data.ENEMY_MIN_SIZE;
        let x;
        let y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.floor(Math.random() * canvas.height);
        } else {
            x = Math.floor(Math.random() * canvas.width);
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        
        const target = {
            x: canvas.width * 0.5, 
            y: canvas.height * 0.5
        };
        const dx = target.x - x;
        const dy = target.y - y;
        const angle = Math.atan2(dy, dx);
        const color = "green";

        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };        

        enemies.push(new Enemy(x, y, radius, color, velocity));
        // console.log(enemies);
    }, data.ENEMY_INTERVAL);
}

function animate() {
    animationID = requestAnimationFrame(animate);
    
    // clear canvas
    ctx.save();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    player.draw(ctx);

    // update + draw enemies
    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();
        enemy.draw(ctx);



        // check collision against player
        if (radialCollision(player, enemy)) {
            console.log("GAME OVER");
            cancelAnimationFrame(animationID);
        }

        // check collision against projectiles
        projectiles.forEach((proj, projectileIndex) => {
            // const dist = Math.hypot(proj.x - enemy.x, proj.y - enemy.y);
            // if (dist - proj.radius - enemy.radius < 1) {
            //     console.log("hit");
            // }
            if (radialCollision(proj, enemy)) {
                setTimeout(() => {
                    enemies.splice(enemyIndex, 1);
                    projectiles.splice(projectileIndex, 1);
                }, 0);
            } 
        });

    });

    // update + draw projectiles
    projectiles.forEach((proj, index) => {

        // check if projectiles go off screen
        if (proj.x + proj.radius < 0 ||
            proj.x - proj.radius > canvas.width ||
            proj.y + proj.radius < 0 ||
            proj.y - proj.radius > canvas.height) {
                projectiles.splice(index, 1);
            }

        proj.update();
        proj.draw(ctx);
    });

}

animate();
spawnEnemies();

window.addEventListener("resize", (e) => {
    // console.log(e);
    resizeCanvas();
    player.draw(ctx);
});

window.addEventListener("click", (e) => {
    if (gameMode === data.mode.DEBUG) console.log(projectiles);

    const target = {
        x: e.clientX, 
        y: e.clientY
    };
    const dx = target.x - canvas.width * 0.5;
    const dy = target.y - canvas.height * 0.5;
    const angle = Math.atan2(dy, dx);

    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    };
    
    projectiles.push(new Projectile(player.x, player.y, 6, "red", velocity));

    
    
});






