const $ = require('jquery');

$('form').submit(e => {
	e.preventDefault();
	const email = $('#email').val();
	$.ajax({
		url: '/',
		type: 'POST',
		data: { email }
	})
		.done(function(response) {
			console.log(response);
		})
		.fail(function() {
			console.log('error');
		});
});

(function(start) {
	if (!start) return;
	const canvas = document.createElement('canvas');
	canvas.style.position = 'absolute';
	canvas.style.top = 0;
	canvas.style.left = 0;
	canvas.style.zIndex = -1;
	document.body.appendChild(canvas);

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	const c = canvas.getContext('2d');
	const GRAVITY = 1;
	const FRICTION = 0.9;
	const ballArray = [];
	const BALL_COUNT = 50;

	window.addEventListener(
		'resize',
		function() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			init();
		},
		false
	);

	window.addEventListener(
		'click',
		function() {
			init();
		},
		false
	);

	function Ball(x, y, dx, dy, radius, color) {
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.radius = radius;
		this.color = color;
	}

	Ball.prototype.draw = function() {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.fillStyle = this.color;
		c.fill();
		c.closePath();
	};
	Ball.prototype.update = function() {
		// 边界检测
		// x方向无重力
		if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
			this.dx = -this.dx;
		}

		if (
			this.y + this.radius + this.dy > canvas.height ||
			this.y - this.radius < 0
		) {
			this.dy = -this.dy * FRICTION;
		} else {
			this.dy += GRAVITY;
		}
		this.x += this.dx;
		this.y += this.dy;
		this.draw();
	};

	function init() {
		// reset ballArray
		ballArray.length = 0;
		for (var i = 0; i < BALL_COUNT; i++) {
			var radius = Math.random() * 30;
			var x = Math.random() * (canvas.width - radius * 2) + radius;
			var y = Math.random() * (canvas.height - radius * 2) + radius;
			var dx = Math.random() * 7 - 3;
			var dy = 5;
			var color =
				'rgba(' +
				~~(Math.random() * 256) +
				',' +
				~~(Math.random() * 256) +
				',' +
				~~(Math.random() * 256) +
				',' +
				1 +
				')';
			var ball = new Ball(x, y, dx, dy, radius, color);
			ballArray.push(ball);
		}
	}

	function animation() {
		requestAnimationFrame(animation);
		c.clearRect(0, 0, canvas.width, canvas.height);
		for (var i = 0, j = ballArray.length; i < j; i++) {
			ballArray[i].update();
		}
	}

	init();
	animation();
})();

(function(start) {
	if (!start) return;
	const canvas = document.createElement('canvas');
	canvas.style.position = 'absolute';
	canvas.style.top = 0;
	canvas.style.left = 0;
	canvas.style.zIndex = -1;
	document.body.appendChild(canvas);
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	const c = canvas.getContext('2d');
	const skyStarsArray = []; // 星空星星数组
	const starsArray = []; // 坠落星星数组
	const explosionsArray = []; // 爆炸粒子数组
	const skyStarsCount = 400; // 星空初始生成星星数量
	const skyStarsVelocity = 0.1; // 星空平移速度
	const backgroundGradient = c.createLinearGradient(0, 0, 0, canvas.height); //4个参数:startX,startY,EndX,EndY
	backgroundGradient.addColorStop(0, 'rgba(23, 30, 38, 0.7)');
	backgroundGradient.addColorStop(1, 'rgba(63, 88, 107, 0.7)');
	let spawnTimer = Math.random() * 300; // 随机生成坠落星星的时间

	window.addEventListener(
		'resize',
		function() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			skyStarsArray.length = 0;
			starsArray.length = 0;
			explosionsArray.length = 0;
			spawnTimer = Math.random() * 300;
			init();
		},
		false
	);

	function init() {
		drawSkyStars(); // 初始化背景星星
		drawStars(); // 初始化坠落的星星
	}

	// 画山
	function drawMountains(number, y, height, color, offset) {
		c.save();
		c.fillStyle = color;
		const width = canvas.width / number;
		// 循环绘制
		for (let i = 0; i < number; i++) {
			c.beginPath();
			c.moveTo(width * i - offset, y);
			c.lineTo(width * i + width + offset, y);
			c.lineTo(width * i + width / 2, y - height);
			c.closePath();
			c.fill();
		}
		c.restore();
	}

	function Skystar(x) {
		this.x = x || (Math.random() - 0.5) * 2 * canvas.width;
		this.y = Math.random() * canvas.height;
		this.color = '#ccc';
		this.shadowColor = '#E3EAEF';
		this.radius = Math.random() * 3;
		// 流星属性
		this.falling = false;
		this.dx = Math.random() * 4 + 4;
		this.dy = 2;
		this.gravity = 0.1;
		this.timeToLive = 200;
	}

	Skystar.prototype.draw = function() {
		c.save();
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.shadowColor = this.shadowColor;
		c.shadowBlur = Math.random() * 10 + 10;
		c.shadowOffsetX = 0;
		c.shadowOffsetY = 0;
		c.fillStyle = this.color;
		c.fill();
		c.closePath();
		c.restore();
	};

	Skystar.prototype.update = function() {
		this.draw();
		// 星空一直连续不断向右移
		this.x += skyStarsVelocity;
		// y方向上有一个从上到下的偏移量，这里用cos函数来表示，模拟地球自转时看到的星空
		let angle =
			Math.PI /
			(canvas.width / skyStarsVelocity) *
			(this.x / skyStarsVelocity);
		this.y += this.x > 0 ? -Math.cos(angle) * 0.03 : 0;
	};

	function drawSkyStars() {
		for (let i = 0; i < skyStarsCount; i++) {
			skyStarsArray.push(new Skystar());
		}
	}

	function Star() {
		this.radius = Math.random() * 10 + 5;
		this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
		this.y = -Math.random() * canvas.height;
		this.velocity = {
			x: (Math.random() - 0.5) * 20 + 5,
			y: 5,
			rotate: 5
		};
		this.rotate = Math.sign(this.velocity.x) * Math.random() * Math.PI * 2;
		this.friction = 0.7;
		this.gravity = 0.5;
		this.opacity = 1;
		this.shadowColor = '#E3EAEF';
		this.shadowBlur = 20;
		this.timeToLive = 200;
		this.die = false;
	}

	Star.prototype.draw = function() {
		c.save();
		c.beginPath();
		// 画五角星
		for (let i = 0; i < 5; i++) {
			c.lineTo(
				Math.cos((18 + i * 72 - this.rotate) / 180 * Math.PI) *
					this.radius +
					this.x,
				-Math.sin((18 + i * 72 - this.rotate) / 180 * Math.PI) *
					this.radius +
					this.y
			);
			c.lineTo(
				Math.cos((54 + i * 72 - this.rotate) / 180 * Math.PI) *
					this.radius *
					0.5 +
					this.x,
				-Math.sin((54 + i * 72 - this.rotate) / 180 * Math.PI) *
					this.radius *
					0.5 +
					this.y
			);
		}
		c.shadowColor = this.shadowColor;
		c.shadowBlur = this.shadowBlur;
		c.shadowOffsetX = 0;
		c.shadowOffsetY = 0;
		c.fillStyle = 'rgba(255,255,255,' + this.opacity + ')';
		c.fill();
		c.closePath();
		c.restore();
	};

	Star.prototype.update = function() {
		this.draw();
		// 碰到两边墙壁
		if (
			this.x + this.radius + this.velocity.x > canvas.width ||
			this.x - this.radius + this.velocity.x < 0
		) {
			this.velocity.x *= -this.friction; // 碰到两边墙壁，横向速度损失，同时方向反转
			this.velocity.rotate *= -this.friction; // 旋转速度也损失，同时方向反转
		}
		// 碰到地面
		if (this.y + this.radius + this.velocity.y > canvas.height) {
			// 如果没到最小半径，则产生爆炸效果
			if (this.radius > 1) {
				explosionsArray.push(new Explosion(this));
			}
			this.velocity.y *= -this.friction; // 每次碰撞，速度都损失，同时方向反转
			this.velocity.rotate *= (Math.random() - 0.5) * 20; // 每次碰到地面旋转速度都随机
			this.radius -= 3;
			// 修正如果半径小等于1，直接定为1
			if (this.radius <= 1) {
				this.radius = 1;
			}
		} else {
			this.velocity.y += this.gravity; // 没碰到地面，速度增加
		}

		this.x += this.velocity.x;
		this.y += this.velocity.y;
		this.rotate += this.velocity.rotate;

		// 进入消失倒计时
		if (this.radius - 1 <= 0 && !this.die) {
			this.timeToLive--;
			this.opacity -= 1 / Math.max(1, this.timeToLive); // 不透明从慢到快
			if (this.timeToLive < 0) {
				this.die = true;
			}
		}
	};

	// 画2个星星
	function drawStars() {
		for (let i = 0; i < 2; i++) {
			starsArray.push(new Star());
		}
	}

	function Explosion(star) {
		this.particles = []; // 用来存放爆炸粒子
		this.init(star);
	}

	Explosion.prototype.init = function(star) {
		for (let i = 0; i < 4 + Math.random() * 10; i++) {
			const dx = (Math.random() - 0.5) * 8; // 随机生成的x方向速度
			const dy = (Math.random() - 0.5) * 20; // 随机生成的y方向速度
			this.particles.push(new Particle(star.x, star.y, dx, dy)); // 把坐标和速度传给Particle构造函数
		}
	};

	Explosion.prototype.update = function() {
		this.particles.forEach((particle, index, particles) => {
			if (particle.timeToLive <= 0) {
				// 生命周期结束
				particles.splice(index, 1);
				return;
			}
			particle.update();
		});
	};

	function Particle(x, y, dx, dy) {
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.size = {
			width: 2,
			height: 2
		};
		this.friction = 0.7;
		this.gravity = 0.5;
		this.opacity = 1;
		this.timeToLive = 200;
		this.shadowColor = '#E3EAEF';
	}

	Particle.prototype.draw = function() {
		c.save();
		c.fillStyle = 'rgba(227, 234, 239,' + this.opacity + ')';
		c.shadowColor = this.shadowColor;
		c.shadowBlur = 20;
		c.shadowOffsetX = 0;
		c.shadowOffsetY = 0;
		c.fillRect(this.x, this.y, this.size.width, this.size.height);
		c.restore();
	};

	Particle.prototype.update = function() {
		this.draw();
		// 碰到两边墙壁
		if (
			this.x + this.size.width + this.dx > canvas.width ||
			this.x + this.dx < 0
		) {
			this.dx *= -this.friction;
		}
		// 碰到地面
		if (this.y + this.size.height + this.dy > canvas.height) {
			this.dy *= -this.friction;
		} else {
			this.dy += this.gravity;
		}
		this.x += this.dx;
		this.y += this.dy;

		this.timeToLive--;
		this.opacity -= 1 / this.timeToLive; //不透明度ease-in效果
	};

	function animation() {
		requestAnimationFrame(animation);
		// 画背景
		c.fillStyle = backgroundGradient;
		c.fillRect(0, 0, canvas.width, canvas.height);
		// 画背景星星
		// 随机将一个背景星星定义成流星
		if (~~spawnTimer % 103 === 0) {
			// 这里选择一个质数来求余，使得一个生成周期内最多触发一次
			skyStarsArray[
				~~(Math.random() * skyStarsArray.length)
			].falling = true;
		}
		skyStarsArray.forEach((skyStar, index) => {
			// 如果超出canvas或者作为流星滑落结束，则去除这颗星星，在canvas左侧重新生成一颗
			if (
				skyStar.x - skyStar.radius - 20 > canvas.width ||
				skyStar.timeToLive < 0
			) {
				skyStarsArray.splice(index, 1);
				skyStarsArray.push(new Skystar(-Math.random() * canvas.width));
				return;
			}
			// 星空随机产生流星
			if (skyStar.falling) {
				skyStar.x += skyStar.dx;
				skyStar.y += skyStar.dy;
				// skyStar.dy += skyStar.gravity;
				skyStar.color = '#fff';
				// 半径慢慢变小
				if (skyStar.radius > 0.05) {
					skyStar.radius -= 0.05;
				} else {
					skyStar.radius = 0.05;
				}
				skyStar.timeToLive--;
			}
			skyStar.update();
		});
		// 画山
		drawMountains(1, canvas.height, canvas.height * 0.78, '#384551', 300);
		drawMountains(2, canvas.height, canvas.height * 0.64, '#2B3843', 400);
		drawMountains(3, canvas.height, canvas.height * 0.42, '#26333E', 150);
		// 画地面
		c.fillStyle = '#182028';
		c.fillRect(0, canvas.height * 0.85, canvas.width, canvas.height * 0.15);
		// 画坠落的星星
		starsArray.forEach((star, index) => {
			if (star.die) {
				starsArray.splice(index, 1);
				return;
			}
			star.update();
		});
		// 循环更新爆炸点
		explosionsArray.forEach((explosion, index) => {
			if (explosion.particles.length === 0) {
				explosionsArray.splice(index, 1);
				return;
			}
			explosion.update();
		});
		// 控制随机生成坠星
		spawnTimer--;
		if (spawnTimer < 0) {
			spawnTimer = Math.random() * 300;
			starsArray.push(new Star());
		}
	}

	init();
	animation();
})(true);
