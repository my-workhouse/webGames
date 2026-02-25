// 游戏主逻辑
class SpaceBallGame {
    constructor() {
        // 获取画布和上下文
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 游戏状态
        this.gameState = 'waiting'; // waiting, playing, paused, gameOver
        this.score = 0;
        this.speed = 5;
        this.acceleration = 0.01;
        
        // 太空球属性
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 15,
            color: '#00ffff',
            trail: []
        };
        
        // 鼠标位置
        this.mouse = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };
        
        // 星星
        this.stars = [];
        this.starCount = 10;
        
        // 游戏循环
        this.animationId = null;
        
        // 初始化游戏
        this.init();
    }
    
    // 初始化游戏
    init() {
        // 生成星星
        this.generateStars();
        
        // 绑定事件监听
        this.bindEvents();
    }
    
    // 绑定事件监听
    bindEvents() {
        // 鼠标移动事件
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        // 按钮点击事件
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('startGameBtn').addEventListener('click', () => this.startGame());
        document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
        document.getElementById('restartGameBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.restartGame());
    }
    
    // 生成星星
    generateStars() {
        this.stars = [];
        for (let i = 0; i < this.starCount; i++) {
            // 随机生成星星大小，小的星星分数高，大的星星分数低
            const minRadius = 2;
            const maxRadius = 6;
            const radius = minRadius + Math.random() * (maxRadius - minRadius);
            
            this.stars.push({
                x: Math.random() * (this.canvas.width - 40) + 20,
                y: Math.random() * (this.canvas.height - 40) + 20,
                radius: radius,
                color: '#ffff00'
            });
        }
    }
    
    // 开始游戏
    startGame() {
        // 重置游戏状态
        this.score = 0;
        this.speed = 5;
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 15,
            color: '#00ffff',
            trail: []
        };
        this.mouse = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };
        this.generateStars();
        
        this.gameState = 'playing';
        this.updateUI();
        this.gameLoop();
    }
    
    // 暂停游戏
    pauseGame() {
        this.gameState = 'paused';
        this.updateUI();
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    // 继续游戏
    resumeGame() {
        this.gameState = 'playing';
        this.updateUI();
        this.gameLoop();
    }
    
    // 重新开始游戏
    restartGame() {
        // 重置游戏状态
        this.score = 0;
        this.speed = 5;
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 15,
            color: '#00ffff',
            trail: []
        };
        this.mouse = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2
        };
        this.generateStars();
        
        // 取消之前的动画帧
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // 先更新UI，让游戏结束界面消失
        this.gameState = 'playing';
        this.updateUI();
        
        // 添加一个短暂的延迟，确保界面完全更新后再开始游戏
        setTimeout(() => {
            // 开始游戏循环
            this.gameLoop();
        }, 100);
    }
    
    // 游戏结束
    endGame() {
        this.gameState = 'gameOver';
        this.updateUI();
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    // 更新UI
    updateUI() {
        // 更新分数
        document.getElementById('score').textContent = this.score;
        document.getElementById('finalScore').textContent = this.score;
        
        // 更新状态
        document.getElementById('status').textContent = this.gameState === 'waiting' ? '等待开始' : 
                                                      this.gameState === 'playing' ? '游戏中' : 
                                                      this.gameState === 'paused' ? '游戏暂停' : '游戏结束';
        
        // 更新按钮状态
        document.getElementById('startBtn').disabled = this.gameState === 'playing' || this.gameState === 'paused';
        document.getElementById('pauseBtn').disabled = this.gameState !== 'playing';
        document.getElementById('restartBtn').disabled = this.gameState === 'waiting';
        
        // 更新界面显示
        document.getElementById('startOverlay').style.display = this.gameState === 'waiting' ? 'flex' : 'none';
        document.getElementById('pauseOverlay').style.display = this.gameState === 'paused' ? 'flex' : 'none';
        document.getElementById('gameOverOverlay').style.display = this.gameState === 'gameOver' ? 'flex' : 'none';
    }
    
    // 游戏主循环
    gameLoop() {
        if (this.gameState !== 'playing') return;
        
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 更新太空球位置
        this.updateBallPosition();
        
        // 检查碰撞
        if (this.checkCollision()) {
            this.endGame();
            return;
        }
        
        // 检查星星收集
        this.checkStarCollection();
        
        // 绘制轨迹
        this.drawTrail();
        
        // 绘制星星
        this.drawStars();
        
        // 绘制太空球
        this.drawBall();
        
        // 增加速度
        this.speed += this.acceleration;
        
        // 继续游戏循环
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    // 更新太空球位置
    updateBallPosition() {
        // 计算方向向量
        const dx = this.mouse.x - this.ball.x;
        const dy = this.mouse.y - this.ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 避免除以零的错误
        if (distance > 0) {
            // 归一化方向向量
            const nx = dx / distance;
            const ny = dy / distance;
            
            // 更新太空球位置
            this.ball.x += nx * this.speed;
            this.ball.y += ny * this.speed;
            
            // 只有当太空球移动了一定距离时，才添加到轨迹
            const minDistance = 1; // 最小移动距离
            if (this.ball.trail.length > 0) {
                const lastTrailPoint = this.ball.trail[this.ball.trail.length - 1];
                const trailDx = this.ball.x - lastTrailPoint.x;
                const trailDy = this.ball.y - lastTrailPoint.y;
                const trailDistance = Math.sqrt(trailDx * trailDx + trailDy * trailDy);
                
                if (trailDistance >= minDistance) {
                    this.ball.trail.push({ x: this.ball.x, y: this.ball.y });
                }
            } else {
                // 轨迹为空时，直接添加
                this.ball.trail.push({ x: this.ball.x, y: this.ball.y });
            }
        }
        
        // 限制轨迹长度（进一步缩短轨迹，确保轨迹更快消失）
        const maxTrailLength = 40; // 最大轨迹长度
        if (this.ball.trail.length > maxTrailLength) {
            this.ball.trail.shift();
        }
    }
    
    // 检查碰撞
    checkCollision() {
        // 检查边界碰撞
        if (this.ball.x - this.ball.radius < 0 || 
            this.ball.x + this.ball.radius > this.canvas.width || 
            this.ball.y - this.ball.radius < 0 || 
            this.ball.y + this.ball.radius > this.canvas.height) {
            return true;
        }
        
        // 计算太空球与鼠标的距离
        const mouseDx = this.ball.x - this.mouse.x;
        const mouseDy = this.ball.y - this.mouse.y;
        const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
        
        // 如果太空球与鼠标重叠（距离小于半径），跳过轨迹碰撞检测
        if (mouseDistance < this.ball.radius) {
            return false;
        }
        
        // 检查轨迹碰撞（跳过最近的15个轨迹点，避免检测到当前位置附近的点）
        const minTrailLength = 25; // 增加最小轨迹长度，进一步避免游戏开始时触发碰撞
        const collisionThreshold = this.ball.radius * 0.7; // 进一步减小碰撞阈值，使碰撞检测更宽松
        
        if (this.ball.trail.length >= minTrailLength) {
            // 只检查较旧的轨迹点，跳过最近的15个点
            for (let i = 0; i < this.ball.trail.length - 15; i++) {
                const trailPoint = this.ball.trail[i];
                const dx = this.ball.x - trailPoint.x;
                const dy = this.ball.y - trailPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < collisionThreshold) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // 检查星星收集
    checkStarCollection() {
        for (let i = this.stars.length - 1; i >= 0; i--) {
            const star = this.stars[i];
            const dx = this.ball.x - star.x;
            const dy = this.ball.y - star.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.ball.radius + star.radius) {
                // 根据星星大小计算分数：小星星分数高，大星星分数低
                const baseScore = 20;
                const score = Math.max(5, Math.floor(baseScore - star.radius * 2));
                
                // 收集星星
                this.score += score;
                document.getElementById('score').textContent = this.score;
                
                // 收集星星后加速
                this.speed += 0.5;
                
                // 让太空球闪烁一下
                this.ballFlash();
                
                // 移除星星并生成新星星
                this.stars.splice(i, 1);
                // 生成新星星时使用与generateStars相同的逻辑
                const minRadius = 2;
                const maxRadius = 6;
                const newRadius = minRadius + Math.random() * (maxRadius - minRadius);
                this.stars.push({
                    x: Math.random() * (this.canvas.width - 40) + 20,
                    y: Math.random() * (this.canvas.height - 40) + 20,
                    radius: newRadius,
                    color: '#ffff00'
                });
            }
        }
    }
    
    // 太空球闪烁效果
    ballFlash() {
        const originalColor = this.ball.color;
        
        // 改变颜色为更亮的颜色
        this.ball.color = '#ffffff';
        
        // 100毫秒后恢复原颜色
        setTimeout(() => {
            this.ball.color = originalColor;
        }, 100);
    }
    
    // 绘制太空球
    drawBall() {
        // 绘制外层发光效果
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius + 20, 0, Math.PI * 2);
        const outerGradient = this.ctx.createRadialGradient(
            this.ball.x, this.ball.y, this.ball.radius,
            this.ball.x, this.ball.y, this.ball.radius + 30
        );
        outerGradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
        outerGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        this.ctx.fillStyle = outerGradient;
        this.ctx.fill();
        
        // 绘制中层发光效果
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius + 10, 0, Math.PI * 2);
        const middleGradient = this.ctx.createRadialGradient(
            this.ball.x, this.ball.y, this.ball.radius,
            this.ball.x, this.ball.y, this.ball.radius + 15
        );
        middleGradient.addColorStop(0, 'rgba(0, 255, 255, 0.6)');
        middleGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        this.ctx.fillStyle = middleGradient;
        this.ctx.fill();
        
        // 绘制太空球主体
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        const ballGradient = this.ctx.createRadialGradient(
            this.ball.x - this.ball.radius * 0.3, this.ball.y - this.ball.radius * 0.3, 0,
            this.ball.x, this.ball.y, this.ball.radius
        );
        ballGradient.addColorStop(0, '#ffffff');
        ballGradient.addColorStop(0.5, '#00ffff');
        ballGradient.addColorStop(1, '#008888');
        this.ctx.fillStyle = ballGradient;
        this.ctx.fill();
        
        // 绘制高光
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x - this.ball.radius * 0.4, this.ball.y - this.ball.radius * 0.4, this.ball.radius * 0.3, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fill();
    }
    
    // 绘制轨迹
    drawTrail() {
        if (this.ball.trail.length < 2) return;
        
        // 绘制彗星尾巴效果
        for (let i = 0; i < this.ball.trail.length - 1; i++) {
            const progress = i / (this.ball.trail.length - 1);
            const alpha = 0.8 * (1 - progress); // 轨迹逐渐消失
            const lineWidth = this.ball.radius * 2 * (1 - progress * 0.8); // 轨迹逐渐变细
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.ball.trail[i].x, this.ball.trail[i].y);
            this.ctx.lineTo(this.ball.trail[i + 1].x, this.ball.trail[i + 1].y);
            
            // 创建渐变效果
            const gradient = this.ctx.createLinearGradient(
                this.ball.trail[i].x, this.ball.trail[i].y,
                this.ball.trail[i + 1].x, this.ball.trail[i + 1].y
            );
            gradient.addColorStop(0, `rgba(0, 255, 255, ${alpha * 0.3})`);
            gradient.addColorStop(1, `rgba(0, 255, 255, ${alpha})`);
            
            this.ctx.lineWidth = lineWidth;
            this.ctx.strokeStyle = gradient;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.stroke();
        }
    }
    
    // 绘制星星
    drawStars() {
        this.stars.forEach(star => {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = star.color;
            this.ctx.fill();
            
            // 星星闪烁效果
            const gradient = this.ctx.createRadialGradient(
                star.x, star.y, 0,
                star.x, star.y, star.radius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 0, 1)');
            gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        });
    }
    
    // 生成星星
    generateStars() {
        this.stars = [];
        for (let i = 0; i < this.starCount; i++) {
            this.stars.push({
                x: Math.random() * (this.canvas.width - 40) + 20,
                y: Math.random() * (this.canvas.height - 40) + 20,
                radius: 3 + Math.random() * 2,
                color: '#ffff00'
            });
        }
    }
}

// 游戏初始化
window.addEventListener('load', () => {
    new SpaceBallGame();
});