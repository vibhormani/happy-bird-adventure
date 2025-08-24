const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth * 0.95, 1200);
    canvas.height = Math.min(window.innerHeight * 0.95, 800);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let gameState = 'start';
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;
let frameCount = 0;
let soundEnabled = true;
let selectedBird = 'yellow';
let backgroundMusic = null;
let musicStarted = false;

const gravity = 0.25;
const jumpPower = -6;
const pipeGap = 220;
const pipeWidth = 100;
const pipeSpeed = 2.5;
const birdBounceSpeed = 0.15;

const bird = {
    x: 150,
    y: canvas.height / 2,
    size: 40,
    velocity: 0,
    rotation: 0,
    wingAngle: 0,
    bounceY: 0,
    emoji: '🐤',
    hasShield: false,
    shieldTime: 0
};

const birdEmojis = {
    yellow: '🐤',
    blue: '🐦',
    red: '🦜',
    owl: '🦉',
    eagle: '🦅'
};

const pipes = [];
const clouds = [];
const stars = [];
const particles = [];
const powerUps = [];
const floatingHearts = [];

const colors = {
    sky: ['#87CEEB', '#87E0FF'],
    pipe: ['#74C365', '#5DAE50'],
    ground: '#8B7355',
    sun: '#FFE484'
};

function init() {
    for (let i = 0; i < 8; i++) {
        clouds.push({
            x: Math.random() * canvas.width * 2,
            y: Math.random() * (canvas.height * 0.3),
            width: 80 + Math.random() * 60,
            height: 40 + Math.random() * 30,
            speed: 0.3 + Math.random() * 0.4
        });
    }
    
    for (let i = 0; i < 30; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3,
            twinkle: Math.random() * Math.PI * 2
        });
    }
    
    for (let i = 0; i < 5; i++) {
        floatingHearts.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 20 + Math.random() * 15,
            speed: 0.5 + Math.random() * 0.5,
            angle: Math.random() * Math.PI * 2
        });
    }
}

function createBackgroundMusic() {
    if (!soundEnabled || musicStarted) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    musicStarted = true;
    
    function playBackgroundNote() {
        if (!soundEnabled || gameState === 'gameover') return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88];
        const note = notes[Math.floor(Math.random() * notes.length)];
        
        oscillator.frequency.setValueAtTime(note, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 2);
        
        setTimeout(playBackgroundNote, 2000 + Math.random() * 3000);
    }
    
    playBackgroundNote();
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#FFB6C1');
    gradient.addColorStop(0.3, '#87CEEB');
    gradient.addColorStop(0.6, '#98D8E8');
    gradient.addColorStop(1, '#E6E6FA');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.beginPath();
    ctx.arc(canvas.width - 100, 100, 50, 0, Math.PI * 2);
    ctx.fillStyle = colors.sun;
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12 + frameCount * 0.01;
        const x1 = canvas.width - 100 + Math.cos(angle) * 60;
        const y1 = 100 + Math.sin(angle) * 60;
        const x2 = canvas.width - 100 + Math.cos(angle) * 75;
        const y2 = 100 + Math.sin(angle) * 75;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    
    floatingHearts.forEach(heart => {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.font = `${heart.size}px Arial`;
        ctx.fillText('💖', heart.x, heart.y);
        ctx.restore();
    });
    
    clouds.forEach(cloud => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        
        for (let i = 0; i < 3; i++) {
            const offsetX = (i - 1) * cloud.width / 3;
            const offsetY = Math.sin(i) * 10;
            ctx.beginPath();
            ctx.ellipse(
                cloud.x + offsetX, 
                cloud.y + offsetY, 
                cloud.width / 3, 
                cloud.height / 2, 
                0, 0, Math.PI * 2
            );
            ctx.fill();
        }
    });
    
    const groundHeight = 100;
    const groundGradient = ctx.createLinearGradient(0, canvas.height - groundHeight, 0, canvas.height);
    groundGradient.addColorStop(0, '#90EE90');
    groundGradient.addColorStop(0.5, '#7CFC00');
    groundGradient.addColorStop(1, '#556B2F');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
    
    for (let i = 0; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, canvas.height - groundHeight);
        ctx.quadraticCurveTo(i + 15, canvas.height - groundHeight - 10, i + 30, canvas.height - groundHeight);
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    for (let i = 0; i < canvas.width; i += 60) {
        ctx.font = '20px Arial';
        ctx.fillText('🌻', i, canvas.height - groundHeight + 20);
        ctx.fillText('🌸', i + 30, canvas.height - groundHeight + 40);
    }
}

function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y + bird.bounceY);
    ctx.rotate(bird.rotation);
    
    if (bird.hasShield) {
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, bird.size + 10, 0, Math.PI * 2);
        ctx.stroke();
        
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI / 4) + frameCount * 0.05;
            const x = Math.cos(angle) * (bird.size + 15);
            const y = Math.sin(angle) * (bird.size + 15);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    ctx.font = `${bird.size * 2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const wingFlap = Math.sin(bird.wingAngle) * 0.2;
    ctx.save();
    ctx.scale(1 + wingFlap * 0.1, 1 - wingFlap * 0.1);
    ctx.fillText(bird.emoji, 0, 0);
    ctx.restore();
    
    ctx.restore();
}

function drawPipe(pipe) {
    const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
    gradient.addColorStop(0, '#32CD32');
    gradient.addColorStop(0.5, '#228B22');
    gradient.addColorStop(1, '#006400');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
    
    ctx.fillStyle = '#228B22';
    ctx.fillRect(pipe.x - 10, pipe.top - 40, pipeWidth + 20, 40);
    ctx.fillRect(pipe.x - 10, pipe.bottom, pipeWidth + 20, 40);
    
    ctx.strokeStyle = '#006400';
    ctx.lineWidth = 4;
    ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.strokeRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
    ctx.strokeRect(pipe.x - 10, pipe.top - 40, pipeWidth + 20, 40);
    ctx.strokeRect(pipe.x - 10, pipe.bottom, pipeWidth + 20, 40);
    
    for (let i = 0; i < 3; i++) {
        ctx.font = '30px Arial';
        ctx.fillText('🌿', pipe.x + i * 30, pipe.top - 10);
        ctx.fillText('🌿', pipe.x + i * 30, pipe.bottom + 30);
    }
}

function drawPowerUp(powerUp) {
    ctx.save();
    ctx.translate(powerUp.x, powerUp.y);
    ctx.rotate(frameCount * 0.05);
    
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (powerUp.type === 'shield') {
        ctx.fillText('🛡️', 0, 0);
    } else if (powerUp.type === 'star') {
        ctx.fillText('⭐', 0, 0);
    } else if (powerUp.type === 'heart') {
        ctx.fillText('💖', 0, 0);
    }
    
    ctx.restore();
    
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(powerUp.x, powerUp.y, 25, 0, Math.PI * 2);
    ctx.stroke();
}

function createParticle(x, y, type) {
    const particleTypes = {
        score: ['⭐', '✨', '💫', '🌟'],
        jump: ['☁️', '💨', '🌬️'],
        powerup: ['✨', '💖', '🌈', '🎉'],
        crash: ['💥', '😵', '🌀']
    };
    
    const emojis = particleTypes[type] || ['✨'];
    
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            size: 20 + Math.random() * 20,
            life: 1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.life -= 0.02;
        p.size *= 0.97;
        p.rotation += p.rotationSpeed;
        
        if (p.life <= 0 || p.size < 5) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = `${p.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
    });
}

function drawStars() {
    stars.forEach(star => {
        const twinkle = Math.sin(star.twinkle + frameCount * 0.05) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.8})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateClouds() {
    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x < -cloud.width * 2) {
            cloud.x = canvas.width + cloud.width;
            cloud.y = Math.random() * (canvas.height * 0.3);
        }
    });
}

function updateFloatingHearts() {
    floatingHearts.forEach(heart => {
        heart.x -= heart.speed;
        heart.y += Math.sin(heart.angle) * 0.5;
        heart.angle += 0.02;
        
        if (heart.x < -50) {
            heart.x = canvas.width + 50;
            heart.y = Math.random() * canvas.height;
        }
    });
}

function updateBird() {
    if (gameState === 'playing') {
        bird.velocity += gravity;
        bird.velocity = Math.min(bird.velocity, 10);
        bird.y += bird.velocity;
        
        bird.rotation = Math.min(Math.max(bird.velocity * 0.08, -0.5), 0.5);
        
        bird.wingAngle += 0.3;
        bird.bounceY = Math.sin(frameCount * birdBounceSpeed) * 3;
        
        if (bird.y < bird.size) {
            bird.y = bird.size;
            bird.velocity = 0;
        }
        
        if (bird.y > canvas.height - 100 - bird.size) {
            if (!bird.hasShield) {
                gameOver();
            } else {
                bird.y = canvas.height - 100 - bird.size;
                bird.velocity = -jumpPower / 2;
                bird.hasShield = false;
                bird.shieldTime = 0;
                document.getElementById('powerUpDisplay').style.display = 'none';
            }
        }
        
        if (bird.hasShield) {
            bird.shieldTime--;
            if (bird.shieldTime <= 0) {
                bird.hasShield = false;
                document.getElementById('powerUpDisplay').style.display = 'none';
            }
        }
    }
}

function updatePipes() {
    if (frameCount % 150 === 0 && gameState === 'playing') {
        const minHeight = 150;
        const maxHeight = canvas.height - pipeGap - 250;
        const top = Math.random() * (maxHeight - minHeight) + minHeight;
        
        pipes.push({
            x: canvas.width,
            top: top,
            bottom: top + pipeGap,
            passed: false
        });
        
        if (Math.random() < 0.3) {
            const powerUpTypes = ['shield', 'star', 'heart'];
            powerUps.push({
                x: canvas.width + pipeWidth / 2,
                y: top + pipeGap / 2,
                type: powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)],
                collected: false
            });
        }
    }
    
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= pipeSpeed;
        
        if (pipes[i].x < -pipeWidth) {
            pipes.splice(i, 1);
            continue;
        }
        
        if (!pipes[i].passed && pipes[i].x + pipeWidth < bird.x) {
            pipes[i].passed = true;
            score++;
            updateScore();
            
            for (let j = 0; j < 10; j++) {
                createParticle(bird.x, bird.y, 'score');
            }
            
            playSound('score');
        }
        
        if (!bird.hasShield && checkCollision(pipes[i])) {
            gameOver();
        }
    }
}

function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        powerUps[i].x -= pipeSpeed;
        
        if (powerUps[i].x < -50) {
            powerUps.splice(i, 1);
            continue;
        }
        
        const dist = Math.hypot(bird.x - powerUps[i].x, bird.y - powerUps[i].y);
        if (dist < 40 && !powerUps[i].collected) {
            powerUps[i].collected = true;
            
            if (powerUps[i].type === 'shield') {
                bird.hasShield = true;
                bird.shieldTime = 300;
                document.getElementById('powerUpDisplay').style.display = 'block';
                document.getElementById('powerUpDisplay').innerHTML = '🛡️ Shield Active!';
            } else if (powerUps[i].type === 'star') {
                score += 5;
                updateScore();
            } else if (powerUps[i].type === 'heart') {
                bird.velocity = -jumpPower / 2;
            }
            
            for (let j = 0; j < 15; j++) {
                createParticle(powerUps[i].x, powerUps[i].y, 'powerup');
            }
            
            playSound('powerup');
            powerUps.splice(i, 1);
        }
    }
}

function checkCollision(pipe) {
    const birdLeft = bird.x - bird.size * 0.6;
    const birdRight = bird.x + bird.size * 0.6;
    const birdTop = bird.y - bird.size * 0.6;
    const birdBottom = bird.y + bird.size * 0.6;
    
    if (birdRight > pipe.x && birdLeft < pipe.x + pipeWidth) {
        if (birdTop < pipe.top || birdBottom > pipe.bottom) {
            return true;
        }
    }
    
    return false;
}

function jump() {
    if (gameState === 'playing') {
        bird.velocity = jumpPower;
        
        for (let i = 0; i < 3; i++) {
            createParticle(bird.x - bird.size, bird.y + bird.size, 'jump');
        }
        
        playSound('jump');
    }
}

function selectBird(birdType) {
    selectedBird = birdType;
    bird.emoji = birdEmojis[birdType];
    
    document.querySelectorAll('.character-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`[data-bird="${birdType}"]`).classList.add('selected');
    
    playSound('select');
}

function startGame() {
    gameState = 'playing';
    score = 0;
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    bird.hasShield = false;
    bird.shieldTime = 0;
    pipes.length = 0;
    particles.length = 0;
    powerUps.length = 0;
    
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('scoreDisplay').style.display = 'block';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('powerUpDisplay').style.display = 'none';
    
    updateScore();
    createBackgroundMusic();
}

function restartGame() {
    gameState = 'playing';
    score = 0;
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    bird.hasShield = false;
    bird.shieldTime = 0;
    bird.rotation = 0;
    pipes.length = 0;
    particles.length = 0;
    powerUps.length = 0;
    
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('scoreDisplay').style.display = 'block';
    document.getElementById('powerUpDisplay').style.display = 'none';
    
    updateScore();
}

function gameOver() {
    if (gameState === 'playing') {
        gameState = 'gameover';
        
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bestScore', bestScore);
        }
        
        document.getElementById('finalScore').textContent = `Score: ${score} 🌟`;
        document.getElementById('bestScore').textContent = `Best: ${bestScore} 🏆`;
        document.getElementById('gameOverScreen').style.display = 'block';
        
        for (let i = 0; i < 20; i++) {
            createParticle(bird.x, bird.y, 'crash');
        }
        
        playSound('gameover');
    }
}

function updateScore() {
    document.getElementById('scoreDisplay').textContent = score;
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    document.getElementById('muteButton').textContent = soundEnabled ? '🔊' : '🔇';
    playSound('toggle');
}

function playSound(type) {
    if (!soundEnabled) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'jump':
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
                
            case 'score':
                const notes = [523.25, 659.25, 783.99];
                for (let i = 0; i < notes.length; i++) {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.frequency.setValueAtTime(notes[i], audioContext.currentTime + i * 0.1);
                    gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.1);
                    osc.start(audioContext.currentTime + i * 0.1);
                    osc.stop(audioContext.currentTime + i * 0.1 + 0.1);
                }
                break;
                
            case 'powerup':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(1200, audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
                
            case 'select':
                oscillator.frequency.setValueAtTime(700, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.05);
                break;
                
            case 'gameover':
                oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
                break;
                
            case 'toggle':
                oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.05);
                break;
        }
    } catch (e) {
        console.log('Audio not supported');
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    
    if (gameState === 'playing' || gameState === 'gameover') {
        drawStars();
    }
    
    updateClouds();
    updateFloatingHearts();
    
    pipes.forEach(pipe => drawPipe(pipe));
    powerUps.forEach(powerUp => drawPowerUp(powerUp));
    
    updateBird();
    drawBird();
    
    updatePipes();
    updatePowerUps();
    
    updateParticles();
    drawParticles();
    
    frameCount++;
    
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
});

canvas.addEventListener('click', jump);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
});

window.selectBird = selectBird;
window.startGame = startGame;
window.restartGame = restartGame;
window.toggleSound = toggleSound;

init();
gameLoop();