import { Player } from "./player.js";
import { Projectile } from "./projectile.js";
import { Enemy } from "./enemy.js";
import { Particle } from "./particle.js";
import { data } from "./data.js";
import { radialCollision } from "./utils.js";

let gameMode = data.mode.LIVE;
let gameState = data.state.MENU;
let animationID;
let score = 0;

const scoreDisp = document.getElementById("score");
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

const projectiles = [];
const enemies = [];
const particles = [];

const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

const player = new Player(canvas.width * 0.5, canvas.height * 0.5, 10, "white");


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
        const hue = Math.random() * 360;
        const color = `hsl(${hue} 50% 50%)`;
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
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
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
            
            if (radialCollision(proj, enemy)) {

                // increase score by 100 per hit
                score += 100;
                scoreDisp.innerText = score.toString().padStart(data.SCORE_MAX_DIGITS);

                // draw explosion with particles
                for (let i = 1; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(
                        proj.x, 
                        proj.y,
                        Math.random() * 2, 
                        enemy.color, 
                        {
                            x: (Math.random() - 0.5) * Math.random() * data.PARTICLE_MAX_SPEED,
                            y: (Math.random() - 0.5) * Math.random() * data.PARTICLE_MAX_SPEED
                        }
                    ));
                }

                // first shrink, if radius is not too small already
                if (enemy.radius - 10 >= 5) {
                    enemy.radius -= 10;
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                // then remove from game, if radius is small enough
                } else {
                    
                    // increase score by 250 for complete destruction of enemy
                    score += 250;
                    scoreDisp.innerText = score.toString().padStart(data.SCORE_MAX_DIGITS);

                    setTimeout(() => {
                        enemies.splice(enemyIndex, 1);
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                }          
            } 
        });

    });

    // update + draw particles
    particles.forEach((particle, index) => {

        if (particle.alpha <= 0) {
            particles.splice(index, 1); 
        } else {
            particle.update();
            particle.draw(ctx);     
        }
        
        // check if particles go off screen
        if (particle.x + particle.radius < 0 ||
            particle.x - particle.radius > canvas.width ||
            particle.y + particle.radius < 0 ||
            particle.y - particle.radius > canvas.height) {
                particles.splice(index, 1);
            }

            
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
        x: Math.cos(angle) * 6,
        y: Math.sin(angle) * 6
    };
    
    projectiles.push(new Projectile(player.x, player.y, 6, "white", velocity));

    
    
});






