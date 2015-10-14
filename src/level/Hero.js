/**
 * @file 主角
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var MIN_Y = 100;
    var MIN_VELOCITY_X = 70;
    var MAX_VELOCITY_X = 1200;
    var MAX_VELOCITY_CACHE = 10;

    /**
     * 主角类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     * @param {Object} options 参数项
     */
    function Hero(game, options) {
        /**
         * 游戏
         *
         * @type {Phaser.Game}
         */
        this.game = game;

        this.level = options.level;

        this.sprite = null;

        this.body = null;

        this.radius = 32;

        this.awake = false;

        this.velocityCache = [];

        this.init();
    }

    var proto = Hero.prototype;

    /**
     * 初始化
     *
     * @private
     */
    proto.init = function () {
        var game = this.game;

        var sprite = game.add.sprite(100, game.world.height - 160 - this.radius, 'hero');
        sprite.scale.set(0.3);
        sprite.anchor.set(0.5);
        this.sprite = sprite;

        game.physics.box2d.enable(sprite);

        var body = sprite.body;
        body.setCircle(this.radius);
        body.fixedRotation = true;
        this.body = body;

        game.camera.follow(sprite); // TODO: fix follow bug
        game.camera.deadzone = new Phaser.Rectangle(
            100, 60,
            0, 0
        );

        this.wake(); // TODO: 延时

        console.log(body);
    };

    /**
     * 唤醒
     *
     * @public
     */
    proto.wake = function () {
        this.body.applyForce(80, -200);
        this.awake = true;
    };

    /**
     * 是否醒着
     *
     * @return {boolean} 是否醒着
     */
    proto.isAwake = function () {
        return this.awake;
    };

    proto.getX = function () {
        return this.body.x;
    };

    /**
     * 更新
     */
    proto.update = function () {
        this.updateStatus();

        if (this.level.isTouching) {
            this.dive();
        }
        this.limitVelocity();
        this.updateAngle();
    };

    /**
     * 俯冲
     *
     * @public
     */
    proto.dive = function () {
        if (!this.awake) {
            return;
        }

        var body = this.body;
        var velocity = body.velocity;
        if (velocity.x > MIN_VELOCITY_X) {
            body.applyForce(0, 80);
        }
    };

    /**
     * 限制速度
     */
    proto.limitVelocity = function () {
        if (!this.awake) {
            return;
        }

        var body = this.body;
        var velocity = body.velocity;
        if (velocity.x < MIN_VELOCITY_X) {
            velocity.x = MIN_VELOCITY_X;
        }
        else if (velocity.x > MAX_VELOCITY_X) {
            velocity.x = MAX_VELOCITY_X;
        }

        // 进入顶部区域
        // TODO: 上边界不封
        if (body.y < MIN_Y && velocity.y < 0) {
            velocity.y -= velocity.y / 10;
        }
    };

    /**
     * 更新角度
     */
    proto.updateAngle = function () {
        var velocity = this.body.velocity;
        var velocityCache = this.velocityCache;
        if (velocityCache.length >= MAX_VELOCITY_CACHE) {
            velocityCache.shift();
        }
        velocityCache.push({x: velocity.x, y: velocity.y});

        var sumVelocityX = 0;
        var sumVelocityY = 0;
        velocityCache.forEach(function (vel) {
            sumVelocityX += vel.x;
            sumVelocityY += vel.y;
        });
        var cacheLength = velocityCache.length;
        var avgVelocityX = sumVelocityX / cacheLength;
        var avgVelocityY = sumVelocityY / cacheLength;

        var pMath = Phaser.Math;
        this.body.angle = pMath.radToDeg(pMath.angleBetween(0, 0, avgVelocityX, avgVelocityY));
    };

    proto.updateStatus = function () {
        var level = this.level;
        if (level.progress === 1) {
            this.awake = false;
        }

        var power = level.power;
        var POWER_STATUS = power.STATUS;

        switch (power.status) {
            case POWER_STATUS.EMPTY:
                this.awake = false;
                break;
        }
    };

    proto.goToTerminal = function (terminal) {
        var game = this.game;
        var posTo = {
            x: terminal.x,
            y: terminal.y - this.radius
        };
        var duration = 400;
        var body = this.body;

        game.add.tween(body)
            .to(posTo, duration)
            .start();
        game.add.tween(body)
            .to({angle: 0}, duration)
            .start();
    };

    proto.render = function () {
        var game = this.game;
        var velocity = this.body.velocity;
        game.debug.text('vx: ' + velocity.x.toFixed(2), 2, 34, '#fff');
        game.debug.text('vy: ' + velocity.y.toFixed(2), 2, 54, '#fff');
    };

    return Hero;

});
