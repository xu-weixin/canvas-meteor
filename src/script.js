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
	let skyStars = []; // 星空星星数组
	let stars = []; // 坠落星星数组
	let explosions = []; // 爆炸粒子数组
	const skyStarsCount = 400; // 星空初始生成星星数量
	let skyStarsVelocity = 0.1; // 星空平移速度
	let backgroundGradient;
	let spawnTimer = ~~(Math.random() * 500); // 随机生成坠落星星的时间
	addEventListener(
		'resize',
		function() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			skyStars = [];
			stars = [];
			explosions = [];
			spawnTimer = ~~(Math.random() * 500) + 200;
			init();
		},
		false
	);

	function init() {
		// 1.画背景(山和星星)
		///////////////
		// 1.1 背景色渐变 //
		///////////////
		backgroundGradient = c.createLinearGradient(0, 0, 0, canvas.height); //4个参数:startX,startY,EndX,EndY
		backgroundGradient.addColorStop(0, 'rgba(23, 30, 38, 0.7)');
		backgroundGradient.addColorStop(1, 'rgba(63, 88, 107, 0.7)');
		drawSkyStars();
		drawStars();
	}

	// 画山
	function drawMountains(number, y, height, color, offset) {
		c.fillStyle = color;
		const width = canvas.width / number;
		// 循环绘制
		for (var i = 0; i < number; i++) {
			c.beginPath();
			c.moveTo(width * i - offset, y);
			c.lineTo(width * i + width + offset, y);
			c.lineTo(width * i + width / 2, y - height);
			c.closePath();
			c.fill();
		}
	}

	// 画星空
	function Skystar(x, y) {
		this.x = x || (Math.random() - 0.5) * 2 * canvas.width;
		this.y = y || Math.random() * canvas.height;
		this.color = '#ccc';
		this.shadowColor = '#E3EAEF';
		this.radius = Math.random() * 3;
		// 流星属性
		this.falling = false;
		this.dx = Math.random() * 4 + 4;
		// this.dx = 4;
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
	};
	function drawSkyStars() {
		for (var i = 0; i < skyStarsCount; i++) {
			skyStars.push(new Skystar());
		}
	}
	// 画坠落的星星
	function Star() {
		this.radius = Math.random() * 10 + 5;
		this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
		this.y = -Math.random() * canvas.height;
		this.velocity = {
			x: (Math.random() - 0.5) * 20,
			y: 5,
			rotate: 5
		};
		this.rotate = Math.random() * Math.PI * 2;
		this.friction = 0.7;
		this.gravity = 0.5;
		this.color = '#fff';
		this.shadowColor = '#E3EAEF';
		this.shadowBlur = 20;
		this.timeToLive = 200;
		this.die = false;
	}

	Star.prototype.draw = function() {
		c.save();
		c.beginPath();
		// 画五角星
		// c.star(this.x, this.y, this.radius, this.radius * 0.5, 0);
		for (var i = 0; i < 5; i++) {
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
		// c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		c.shadowColor = this.shadowColor;
		c.shadowBlur = this.shadowBlur;
		c.shadowOffsetX = 0;
		c.shadowOffsetY = 0;
		c.fillStyle = this.color;
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
			this.velocity.x *= -this.friction;
			this.velocity.rotate *= -this.friction;
		}
		// 碰到地面
		if (this.y + this.radius + this.velocity.y > canvas.height) {
			this.velocity.y *= -this.friction;
			this.velocity.rotate *= (Math.random() - 0.5) * 20;
			// 如果没到最小半径，则产生爆炸效果
			if (this.radius > 1) {
				explosions.push(new Explosion(this));
			}

			this.radius -= 3;
			// 修正半径为0~1之间，直接定为1
			if (this.radius > 0 && this.radius < 1) {
				this.radius = 1;
			}
		} else {
			this.velocity.y += this.gravity;
		}

		this.x += this.velocity.x;
		this.y += this.velocity.y;

		this.rotate += this.velocity.rotate;
	};

	function drawStars() {
		for (let i = 0; i < 1; i++) {
			stars.push(new Star());
		}
	}

	// 爆炸粒子
	function Explosion(star) {
		this.particles = [];
		this.init(star);
	}
	Explosion.prototype.init = function(star) {
		for (let i = 0; i < 8; i++) {
			const dx = (Math.random() - 0.5) * 8;
			const dy = (Math.random() - 0.5) * 20;
			this.particles.push(new Particle(star.x, star.y, dx, dy));
		}
	};
	Explosion.prototype.update = function() {
		this.particles.forEach(function(particle, index, particles) {
			if (particle.timeToLive <= 0) {
				particles.splice(index, 1);
				return;
			}
			particle.update();
		});
	};

	// 粒子
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
		// 画星星
		if (spawnTimer % 103 === 0) {
			skyStars[~~(Math.random() * skyStars.length)].falling = true;
		}
		skyStars.forEach(function(skyStar, index) {
			// 如果超出canvas或者作为流星滑落结束，则去除这颗星星，在canvas左侧重新生成一颗
			if (
				skyStar.x - skyStar.radius - 20 > canvas.width ||
				skyStar.timeToLive < 0
			) {
				skyStars.splice(index, 1);
				skyStars.push(new Skystar(-Math.random() * canvas.width));
				return;
			}
			// 星空随机产生流星
			if (skyStar.falling) {
				skyStar.x += skyStar.dx;
				skyStar.y += skyStar.dy;
				// skyStar.dy += skyStar.gravity;
				skyStar.color = '#fff';

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
		// 画坠落的球
		stars.forEach(function(star, index) {
			if (star.die) {
				stars.splice(index, 1);
				return;
			}
			if (star.radius <= 0) {
				star.radius = 1;
				star.timeToLive--;
				if (star.timeToLive < 0) {
					star.die = true;
				}
			}
			star.update();
		});
		// 判断爆炸是否结束
		explosions.forEach(function(explosion, index) {
			if (explosion.particles.length === 0) {
				explosions.splice(index, 1);
				return;
			}
			explosion.update();
		});

		spawnTimer--;
		if (spawnTimer < 0) {
			spawnTimer = ~~(Math.random() * 500);
			stars.push(new Star());
		}
	}

	init();
	animation();
})(true);
