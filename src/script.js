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
	let skyStars = [];
	let stars = [];
	let explosions = [];
	const skyStarsCount = 400;
	let skyStarsVelocity = 0.1;
	let backgroundGradient;
	let spawnTimer = null;
	addEventListener(
		'resize',
		function() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			skyStars = [];
			stars = [];
			explosions = [];
			clearInterval(spawnTimer);
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

	// 画星星
	function Skystar() {
		this.x = (Math.random() - 0.5) * 2 * canvas.width;
		this.y = Math.random() * canvas.height;
		this.color = '#fff';
		this.shadowColor = '#E3EAEF';
		this.radius = Math.random() * 3;
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
		this.x += skyStarsVelocity;
		if (
			this.x + this.radius > canvas.width * 2 ||
			this.x - this.radius < -canvas.width
		) {
			skyStarsVelocity *= -1;
		}
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
			y: 10
		};
		this.friction = 0.7;
		this.gravity = 1;
		this.color = '#fff';
		this.shadowColor = '#E3EAEF';
		this.shadowBlur = 20;
		this.die = false;
	}

	Star.prototype.draw = function() {
		c.save();
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
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
		}
		// 碰到地面
		if (this.y + this.radius + this.velocity.y > canvas.height) {
			this.velocity.y *= -this.friction;

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

		explosions.forEach(function(explosion) {
			explosion.update();
		});
	};

	function drawStars() {
		for (let i = 0; i < 2; i++) {
			stars.push(new Star());
		}
		spawnTimer = setInterval(function() {
			stars.push(new Star());
		}, Math.random() * 3000 + 1000);
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
		this.friction = 0.9;
		this.gravity = 0.6;
		this.opacity = 1;
		this.timeToLive = 3;
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

		this.timeToLive -= 0.01;
		this.opacity -= 1 / (this.timeToLive / 0.01);
	};

	function animation() {
		requestAnimationFrame(animation);
		// 画背景
		c.fillStyle = backgroundGradient;
		c.fillRect(0, 0, canvas.width, canvas.height);
		// 画星星
		skyStars.forEach(function(skyStar) {
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
			}
			if (star.radius <= 0) {
				star.radius = 1;
				setTimeout(function() {
					star.die = true;
				}, 3000);
			}
			star.update();
		});
		// 判断爆炸是否结束
		explosions.forEach(function(explosion, index) {
			if (explosion.particles.length === 0) {
				explosions.splice(index, 1);
			}
		});
	}

	init();
	animation();
})(true);
