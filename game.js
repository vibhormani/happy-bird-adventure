const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 480;
canvas.height = 640;

let gameState = 'start';
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;
let frameCount = 0;

const gravity = 0.5;
const jumpPower = -8;
const pipeGap = 180;
const pipeWidth = 80;
const pipeSpeed = 3;

const bird = {
    x: 100,
    y: canvas.height / 2,
    size: 35,
    velocity: 0,
    color: '#FFD700',
    wingAngle: 0,
    rotation: 0
};

const pipes = [];
const clouds = [];
const stars = [];
const particles = [];

const colors = {
    sky: ['#87CEEB', '#87E0FF'],
    pipe: ['#74C365', '#5DAE50'],
    ground: '#8B7355',
    sun: '#FFE484'
};

function init() {
    for (let i = 0; i < 5; i++) {
        clouds.push({
            x: Math.random() * canvas.width * 2,
            y: Math.random() * 200,
            width: 60 + Math.random() * 40,
            height: 30 + Math.random() * 20,
            speed: 0.5 + Math.random() * 0.5
        });
    }
    
    for (let i = 0; i < 20; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3,
            twinkle: Math.random() * Math.PI * 2
        });
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#98D8E8');
    gradient.addColorStop(1, '#BDE6F1');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.beginPath();
    ctx.arc(canvas.width - 80, 80, 40, 0, Math.PI * 2);
    ctx.fillStyle = colors.sun;
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12;
        const x1 = canvas.width - 80 + Math.cos(angle) * 50;
        const y1 = 80 + Math.sin(angle) * 50;
        const x2 = canvas.width - 80 + Math.cos(angle) * 60;
        const y2 = 80 + Math.sin(angle) * 60;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    clouds.forEach(cloud => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cloud.x - cloud.width / 3, cloud.y, cloud.width / 3, cloud.height / 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cloud.x + cloud.width / 3, cloud.y, cloud.width / 3, cloud.height / 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
    });
    
    const groundHeight = 80;
    const groundGradient = ctx.createLinearGradient(0, canvas.height - groundHeight, 0, canvas.height);
    groundGradient.addColorStop(0, '#8FBC8F');
    groundGradient.addColorStop(1, '#556B2F');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
    
    ctx.strokeStyle = '#4A5F4A';
    ctx.lineWidth = 2;
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, canvas.height - groundHeight);
        ctx.lineTo(i + 20, canvas.height - groundHeight + 10);
        ctx.stroke();
    }
}

function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);
    
    ctx.fillStyle = bird.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.size, bird.size * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.ellipse(-bird.size * 0.3, -bird.size * 0.2, bird.size * 0.5, bird.size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(bird.size * 0.3, -bird.size * 0.2, bird.size * 0.25, bird.size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.size * 0.35, -bird.size * 0.2, bird.size * 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.size * 0.38, -bird.size * 0.23, bird.size * 0.04, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#FF6347';
    ctx.beginPath();
    ctx.moveTo(bird.size * 0.5, 0);
    ctx.lineTo(bird.size * 0.7, -bird.size * 0.05);
    ctx.lineTo(bird.size * 0.7, bird.size * 0.05);
    ctx.closePath();
    ctx.fill();
    
    const wingY = Math.sin(bird.wingAngle) * bird.size * 0.2;
    ctx.fillStyle = '#FFB347';
    ctx.beginPath();
    ctx.ellipse(-bird.size * 0.3, wingY, bird.size * 0.4, bird.size * 0.6, -0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawPipe(pipe) {
    const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
    gradient.addColorStop(0, colors.pipe[0]);
    gradient.addColorStop(0.5, colors.pipe[1]);
    gradient.addColorStop(1, colors.pipe[0]);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
    
    ctx.fillStyle = '#5DAE50';
    ctx.fillRect(pipe.x - 5, pipe.top - 30, pipeWidth + 10, 30);
    ctx.fillRect(pipe.x - 5, pipe.bottom, pipeWidth + 10, 30);
    
    ctx.strokeStyle = '#4A8F3C';
    ctx.lineWidth = 3;
    ctx.strokeRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.strokeRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
    ctx.strokeRect(pipe.x - 5, pipe.top - 30, pipeWidth + 10, 30);
    ctx.strokeRect(pipe.x - 5, pipe.bottom, pipeWidth + 10, 30);
    
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(pipe.x + 10 + i * 25, pipe.top - 25);
        ctx.lineTo(pipe.x + 10 + i * 25, pipe.top - 5);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(pipe.x + 10 + i * 25, pipe.bottom + 5);
        ctx.lineTo(pipe.x + 10 + i * 25, pipe.bottom + 25);
        ctx.stroke();
    }
}

function createParticle(x, y, type) {
    const colors = type === 'score' ? ['#FFD700', '#FFA500', '#FF69B4'] : ['#87CEEB', '#98D8E8'];
    particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1
    });
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life -= 0.02;
        p.size *= 0.98;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
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
        if (cloud.x < -cloud.width) {
            cloud.x = canvas.width + cloud.width;
            cloud.y = Math.random() * 200;
        }
    });
}

function updateBird() {
    if (gameState === 'playing') {
        bird.velocity += gravity;
        bird.y += bird.velocity;
        
        bird.rotation = Math.min(Math.max(bird.velocity * 0.1, -0.5), 0.5);
        
        bird.wingAngle += 0.3;
        
        if (bird.y < bird.size) {
            bird.y = bird.size;
            bird.velocity = 0;
        }
        
        if (bird.y > canvas.height - 80 - bird.size) {
            gameOver();
        }
    }
}

function updatePipes() {
    if (frameCount % 100 === 0 && gameState === 'playing') {
        const minHeight = 100;
        const maxHeight = canvas.height - pipeGap - 180;
        const top = Math.random() * (maxHeight - minHeight) + minHeight;
        
        pipes.push({
            x: canvas.width,
            top: top,
            bottom: top + pipeGap,
            passed: false
        });
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
        
        if (checkCollision(pipes[i])) {
            gameOver();
        }
    }
}

function checkCollision(pipe) {
    const birdLeft = bird.x - bird.size * 0.7;
    const birdRight = bird.x + bird.size * 0.7;
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
        
        for (let i = 0; i < 5; i++) {
            createParticle(bird.x - bird.size, bird.y + bird.size, 'jump');
        }
        
        playSound('jump');
    }
}

function startGame() {
    gameState = 'playing';
    score = 0;
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes.length = 0;
    particles.length = 0;
    
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('scoreDisplay').style.display = 'block';
    document.getElementById('gameOverScreen').style.display = 'none';
    
    updateScore();
}

function restartGame() {
    startGame();
}

function gameOver() {
    if (gameState === 'playing') {
        gameState = 'gameover';
        
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bestScore', bestScore);
        }
        
        document.getElementById('finalScore').textContent = `Score: ${score}`;
        document.getElementById('bestScore').textContent = `Best: ${bestScore}`;
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

function playSound(type) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'jump':
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
            
        case 'score':
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
            
        case 'gameover':
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    
    if (gameState === 'playing' || gameState === 'gameover') {
        drawStars();
    }
    
    updateClouds();
    
    pipes.forEach(pipe => drawPipe(pipe));
    
    updateBird();
    drawBird();
    
    updatePipes();
    
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

init();
gameLoop();