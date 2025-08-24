const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
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
let isHolding = false;
let autoFly = false;

const gravity = 0.15;
const liftForce = -0.35;
const maxVelocity = 6;
const minVelocity = -6;
const pipeGap = 300;
const pipeWidth = 120;
const pipeSpeed = 2;

const bird = {
    x: 0,
    y: 0,
    size: 45,
    velocity: 0,
    rotation: 0,
    wingAngle: 0,
    emoji: '🐤',
    hasShield: false,
    shieldTime: 0,
    trail: []
};

const birdEmojis = {
    yellow: '🐤',
    blue: '🐦',
    red: '🦜',
    plane: '✈️',
    rocket: '🚀',
    helicopter: '🚁',
    balloon: '🎈',
    butterfly: '🦋'
};

const pipes = [];
const clouds = [];
const stars = [];
const particles = [];
const powerUps = [];
const floatingHearts = [];
const backgroundElements = [];

const colors = {
    sky: ['#87CEEB', '#FFB6C1', '#E6E6FA'],
    pipe: ['#90EE90', '#98FB98', '#00FA9A'],
    ground: '#8FBC8F',
    sun: '#FFE484'
};

function init() {
    bird.x = canvas.width * 0.5;
    bird.y = canvas.height * 0.5;
    
    for (let i = 0; i < 12; i++) {
        clouds.push({
            x: Math.random() * canvas.width * 2,
            y: Math.random() * (canvas.height * 0.4),
            width: 100 + Math.random() * 80,
            height: 50 + Math.random() * 40,
            speed: 0.2 + Math.random() * 0.3,
            opacity: 0.4 + Math.random() * 0.3
        });
    }
    
    for (let i = 0; i < 50; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 4,
            twinkle: Math.random() * Math.PI * 2,
            speed: 0.1 + Math.random() * 0.2
        });
    }
    
    for (let i = 0; i < 8; i++) {
        floatingHearts.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 25 + Math.random() * 20,
            speed: 0.3 + Math.random() * 0.4,
            angle: Math.random() * Math.PI * 2,
            emoji: ['💖', '⭐', '🌈', '☁️'][Math.floor(Math.random() * 4)]
        });
    }
    
    for (let i = 0; i < 20; i++) {
        backgroundElements.push({
            x: Math.random() * canvas.width,
            y: canvas.height - 150 - Math.random() * 100,
            emoji: ['🌳', '🌲', '🏠', '🌻', '🌸'][Math.floor(Math.random() * 5)],
            size: 30 + Math.random() * 20,
            speed: 0.5
        });
    }
}

function createBackgroundMusic() {
    if (!soundEnabled || musicStarted) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        musicStarted = true;
        
        function playBackgroundNote() {
            if (!soundEnabled || gameState === 'gameover') return;
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
            const note = notes[Math.floor(Math.random() * notes.length)];
            
            oscillator.frequency.setValueAtTime(note, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + 0.1);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 3);
            
            setTimeout(playBackgroundNote, 3000 + Math.random() * 2000);
        }
        
        playBackgroundNote();
    } catch (e) {
        console.log('Audio context not available');
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#FFE5E5');
    gradient.addColorStop(0.2, '#FFD4E5');
    gradient.addColorStop(0.4, '#D4E5FF');
    gradient.addColorStop(0.6, '#87CEEB');
    gradient.addColorStop(0.8, '#B8E6B8');
    gradient.addColorStop(1, '#E8F5E8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const sunX = canvas.width * 0.85;
    const sunY = canvas.height * 0.15;
    const sunRadius = 60;
    
    const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
    sunGradient.addColorStop(0, '#FFFACD');
    sunGradient.addColorStop(0.5, '#FFE484');
    sunGradient.addColorStop(1, '#FFD700');
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    
    for (let i = 0; i < 16; i++) {
        const angle = (i * Math.PI * 2) / 16 + frameCount * 0.005;
        const x1 = sunX + Math.cos(angle) * (sunRadius + 10);
        const y1 = sunY + Math.sin(angle) * (sunRadius + 10);
        const x2 = sunX + Math.cos(angle) * (sunRadius + 25);
        const y2 = sunY + Math.sin(angle) * (sunRadius + 25);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
    
    floatingHearts.forEach(heart => {
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.font = `${heart.size}px Arial`;
        ctx.fillText(heart.emoji, heart.x, heart.y);
        ctx.restore();
    });
    
    clouds.forEach(cloud => {
        ctx.save();
        ctx.globalAlpha = cloud.opacity;
        ctx.fillStyle = 'white';
        
        for (let i = 0; i < 4; i++) {
            const offsetX = (i - 1.5) * cloud.width / 4;
            const offsetY = Math.sin(i + frameCount * 0.001) * 10;
            ctx.beginPath();
            ctx.ellipse(
                cloud.x + offsetX, 
                cloud.y + offsetY, 
                cloud.width / 3.5, 
                cloud.height / 2, 
                0, 0, Math.PI * 2
            );
            ctx.fill();
        }
        ctx.restore();
    });
    
    const groundHeight = 150;
    const groundGradient = ctx.createLinearGradient(0, canvas.height - groundHeight, 0, canvas.height);
    groundGradient.addColorStop(0, '#90EE90');
    groundGradient.addColorStop(0.3, '#7CFC00');
    groundGradient.addColorStop(0.7, '#98FB98');
    groundGradient.addColorStop(1, '#228B22');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
    
    for (let i = 0; i < canvas.width; i += 40) {
        const hillHeight = 30 + Math.sin(i * 0.01) * 20;
        ctx.beginPath();
        ctx.moveTo(i, canvas.height - groundHeight);
        ctx.quadraticCurveTo(
            i + 20, canvas.height - groundHeight - hillHeight,
            i + 40, canvas.height - groundHeight
        );
        ctx.fillStyle = '#7CFC00';
        ctx.fill();
    }
    
    backgroundElements.forEach(elem => {
        ctx.font = `${elem.size}px Arial`;
        ctx.fillText(elem.emoji, elem.x, elem.y);
    });
    
    for (let i = 0; i < canvas.width; i += 80) {
        ctx.font = '25px Arial';
        ctx.fillText('🌻', i, canvas.height - groundHeight + 30);
        ctx.fillText('🌸', i + 40, canvas.height - groundHeight + 60);
        ctx.fillText('🌼', i + 20, canvas.height - groundHeight + 90);
    }
}

function drawBird() {
    bird.trail.push({ x: bird.x, y: bird.y, size: bird.size });
    if (bird.trail.length > 15) {
        bird.trail.shift();
    }
    
    bird.trail.forEach((pos, index) => {
        ctx.save();
        ctx.globalAlpha = index * 0.05;
        ctx.font = `${pos.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✨', pos.x - 20, pos.y);
        ctx.restore();
    });
    
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);
    
    if (bird.hasShield) {
        const shieldGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, bird.size + 20);
        shieldGradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
        shieldGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.2)');
        shieldGradient.addColorStop(1, 'rgba(255, 215, 0, 0.1)');
        ctx.fillStyle = shieldGradient;
        ctx.beginPath();
        ctx.arc(0, 0, bird.size + 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI / 6) + frameCount * 0.03;
            const x = Math.cos(angle) * (bird.size + 25);
            const y = Math.sin(angle) * (bird.size + 25);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    ctx.font = `${bird.size * 2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const bounce = Math.sin(frameCount * 0.1) * 0.1;
    ctx.save();
    ctx.scale(1 + bounce, 1 - bounce * 0.5);
    ctx.fillText(bird.emoji, 0, 0);
    ctx.restore();
    
    ctx.restore();
}

function drawPipe(pipe) {
    const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
    pipeGradient.addColorStop(0, '#32CD32');
    pipeGradient.addColorStop(0.3, '#90EE90');
    pipeGradient.addColorStop(0.7, '#98FB98');
    pipeGradient.addColorStop(1, '#32CD32');
    
    ctx.fillStyle = pipeGradient;
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
    
    const capGradient = ctx.createLinearGradient(0, pipe.top - 50, 0, pipe.top);
    capGradient.addColorStop(0, '#228B22');
    capGradient.addColorStop(1, '#32CD32');
    ctx.fillStyle = capGradient;
    ctx.fillRect(pipe.x - 15, pipe.top - 50, pipeWidth + 30, 50);
    ctx.fillRect(pipe.x - 15, pipe.bottom, pipeWidth + 30, 50);
    
    ctx.strokeStyle = '#006400';
    ctx.lineWidth = 5;
    ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.strokeRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
    ctx.strokeRect(pipe.x - 15, pipe.top - 50, pipeWidth + 30, 50);
    ctx.strokeRect(pipe.x - 15, pipe.bottom, pipeWidth + 30, 50);
    
    for (let i = 0; i < 4; i++) {
        ctx.font = '35px Arial';
        ctx.fillText('🌿', pipe.x + i * 30, pipe.top - 15);
        ctx.fillText('🍃', pipe.x + i * 30, pipe.bottom + 35);
    }
    
    ctx.save();
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 3; i++) {
        ctx.fillStyle = 'white';
        ctx.fillRect(pipe.x + 20 + i * 30, 20, 10, pipe.top - 40);
        ctx.fillRect(pipe.x + 20 + i * 30, pipe.bottom + 20, 10, canvas.height - pipe.bottom - 40);
    }
    ctx.restore();
}

function drawPowerUp(powerUp) {
    ctx.save();
    ctx.translate(powerUp.x, powerUp.y);
    
    const pulse = Math.sin(frameCount * 0.1) * 0.2 + 1;
    ctx.scale(pulse, pulse);
    ctx.rotate(frameCount * 0.02);
    
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (powerUp.type === 'shield') {
        ctx.fillText('🛡️', 0, 0);
    } else if (powerUp.type === 'star') {
        ctx.fillText('⭐', 0, 0);
    } else if (powerUp.type === 'heart') {
        ctx.fillText('💖', 0, 0);
    } else if (powerUp.type === 'rainbow') {
        ctx.fillText('🌈', 0, 0);
    }
    
    ctx.restore();
    
    const glowGradient = ctx.createRadialGradient(powerUp.x, powerUp.y, 0, powerUp.x, powerUp.y, 40);
    glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
    glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(powerUp.x, powerUp.y, 40, 0, Math.PI * 2);
    ctx.fill();
}

function createParticle(x, y, type) {
    const particleTypes = {
        score: ['⭐', '✨', '💫', '🌟', '🎉'],
        fly: ['☁️', '💨', '🌬️', '✨'],
        powerup: ['✨', '💖', '🌈', '🎉', '🎊'],
        crash: ['💥', '😵', '🌀', '😢']
    };
    
    const emojis = particleTypes[type] || ['✨'];
    
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            size: 25 + Math.random() * 25,
            life: 1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.3
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.vx *= 0.98;
        p.life -= 0.015;
        p.size *= 0.98;
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
        ctx.save();
        ctx.globalAlpha = twinkle * 0.6;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(star.x - star.size * 2, star.y);
        ctx.lineTo(star.x + star.size * 2, star.y);
        ctx.moveTo(star.x, star.y - star.size * 2);
        ctx.lineTo(star.x, star.y + star.size * 2);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = star.size * 0.5;
        ctx.stroke();
        ctx.restore();
    });
}

function updateClouds() {
    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x < -cloud.width * 2) {
            cloud.x = canvas.width + cloud.width;
            cloud.y = Math.random() * (canvas.height * 0.4);
        }
    });
}

function updateFloatingHearts() {
    floatingHearts.forEach(heart => {
        heart.x -= heart.speed;
        heart.y += Math.sin(heart.angle) * 0.8;
        heart.angle += 0.02;
        
        if (heart.x < -50) {
            heart.x = canvas.width + 50;
            heart.y = Math.random() * canvas.height;
        }
    });
}

function updateBackgroundElements() {
    backgroundElements.forEach(elem => {
        elem.x -= elem.speed;
        if (elem.x < -50) {
            elem.x = canvas.width + 50;
            elem.y = canvas.height - 150 - Math.random() * 100;
        }
    });
}

function updateBird() {
    if (gameState === 'playing') {
        if (isHolding) {
            bird.velocity += liftForce;
            if (frameCount % 5 === 0) {
                createParticle(bird.x - bird.size, bird.y + bird.size, 'fly');
            }
        } else {
            bird.velocity += gravity;
        }
        
        bird.velocity = Math.max(minVelocity, Math.min(maxVelocity, bird.velocity));
        
        bird.y += bird.velocity;
        
        if (autoFly) {
            const targetY = canvas.height * 0.5;
            const diff = targetY - bird.y;
            if (Math.abs(diff) > 50) {
                bird.velocity += diff * 0.001;
            }
        }
        
        bird.rotation = Math.min(Math.max(bird.velocity * 0.05, -0.3), 0.3);
        
        bird.wingAngle += 0.2;
        
        if (bird.y < bird.size) {
            bird.y = bird.size;
            bird.velocity = 0;
        }
        
        if (bird.y > canvas.height - 150 - bird.size) {
            if (!bird.hasShield) {
                gameOver();
            } else {
                bird.y = canvas.height - 150 - bird.size;
                bird.velocity = -3;
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
    if (frameCount % 200 === 0 && gameState === 'playing') {
        const minHeight = 200;
        const maxHeight = canvas.height - pipeGap - 350;
        const top = Math.random() * (maxHeight - minHeight) + minHeight;
        
        pipes.push({
            x: canvas.width,
            top: top,
            bottom: top + pipeGap,
            passed: false
        });
        
        if (Math.random() < 0.4) {
            const powerUpTypes = ['shield', 'star', 'heart', 'rainbow'];
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
            
            for (let j = 0; j < 12; j++) {
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
        if (dist < 60 && !powerUps[i].collected) {
            powerUps[i].collected = true;
            
            if (powerUps[i].type === 'shield') {
                bird.hasShield = true;
                bird.shieldTime = 500;
                document.getElementById('powerUpDisplay').style.display = 'block';
                document.getElementById('powerUpDisplay').innerHTML = '🛡️ Shield Active!';
            } else if (powerUps[i].type === 'star') {
                score += 10;
                updateScore();
            } else if (powerUps[i].type === 'heart') {
                bird.velocity = -4;
            } else if (powerUps[i].type === 'rainbow') {
                autoFly = true;
                setTimeout(() => { autoFly = false; }, 5000);
                document.getElementById('powerUpDisplay').style.display = 'block';
                document.getElementById('powerUpDisplay').innerHTML = '🌈 Auto-Fly Active!';
            }
            
            for (let j = 0; j < 20; j++) {
                createParticle(powerUps[i].x, powerUps[i].y, 'powerup');
            }
            
            playSound('powerup');
            powerUps.splice(i, 1);
        }
    }
}

function checkCollision(pipe) {
    const birdLeft = bird.x - bird.size * 0.5;
    const birdRight = bird.x + bird.size * 0.5;
    const birdTop = bird.y - bird.size * 0.5;
    const birdBottom = bird.y + bird.size * 0.5;
    
    if (birdRight > pipe.x && birdLeft < pipe.x + pipeWidth) {
        if (birdTop < pipe.top || birdBottom > pipe.bottom) {
            return true;
        }
    }
    
    return false;
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
    bird.x = canvas.width * 0.5;
    bird.y = canvas.height * 0.5;
    bird.velocity = 0;
    bird.hasShield = false;
    bird.shieldTime = 0;
    bird.trail = [];
    pipes.length = 0;
    particles.length = 0;
    powerUps.length = 0;
    autoFly = false;
    
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('scoreDisplay').style.display = 'block';
    document.getElementById('modeDisplay').style.display = 'block';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('powerUpDisplay').style.display = 'none';
    
    setTimeout(() => {
        document.getElementById('modeDisplay').style.display = 'none';
    }, 3000);
    
    updateScore();
    createBackgroundMusic();
}

function restartGame() {
    gameState = 'playing';
    score = 0;
    bird.x = canvas.width * 0.5;
    bird.y = canvas.height * 0.5;
    bird.velocity = 0;
    bird.hasShield = false;
    bird.shieldTime = 0;
    bird.rotation = 0;
    bird.trail = [];
    pipes.length = 0;
    particles.length = 0;
    powerUps.length = 0;
    autoFly = false;
    
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
        
        for (let i = 0; i < 25; i++) {
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
            case 'fly':
                oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(700, audioContext.currentTime + 0.05);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.05);
                break;
                
            case 'score':
                const notes = [523.25, 659.25, 783.99, 1046.50];
                for (let i = 0; i < notes.length; i++) {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.frequency.setValueAtTime(notes[i], audioContext.currentTime + i * 0.08);
                    gain.gain.setValueAtTime(0.15, audioContext.currentTime + i * 0.08);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.08 + 0.1);
                    osc.start(audioContext.currentTime + i * 0.08);
                    osc.stop(audioContext.currentTime + i * 0.08 + 0.1);
                }
                break;
                
            case 'powerup':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(1600, audioContext.currentTime + 0.3);
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.4);
                break;
                
            case 'select':
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.05);
                break;
                
            case 'gameover':
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.8);
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.8);
                break;
                
            case 'toggle':
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.03);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.03);
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
    updateBackgroundElements();
    
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
    if (e.code === 'Space' && gameState === 'playing') {
        e.preventDefault();
        isHolding = true;
        playSound('fly');
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        isHolding = false;
    }
});

canvas.addEventListener('mousedown', () => {
    if (gameState === 'playing') {
        isHolding = true;
        playSound('fly');
    }
});

canvas.addEventListener('mouseup', () => {
    isHolding = false;
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState === 'playing') {
        isHolding = true;
        playSound('fly');
    }
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    isHolding = false;
});

window.selectBird = selectBird;
window.startGame = startGame;
window.restartGame = restartGame;
window.toggleSound = toggleSound;

init();
gameLoop();