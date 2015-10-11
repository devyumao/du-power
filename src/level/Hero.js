/**
 * @file 主角
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var MIN_Y = 100;
    var MIN_VELOCITY_X = 60;
    var MAX_VELOCITY_X = 1200;
    var MAX_VELOCITY_CACHE = 10;

    /**
     * 主角类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     */
    function Hero(game) {
        /**
         * 游戏
         *
         * @type {Phaser.Game}
         */
        this.game = game;

        this.sprite = null;

        this.body = null;

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

        var sprite = game.add.sprite(0, game.world.height - 240 - 32, 'hero');
        sprite.anchor.set(0.5);
        this.sprite = sprite;

        game.physics.box2d.enable(sprite);

        var body = sprite.body;
        body.setCircle(32);
        body.fixedRotation = true;
        this.body = body;

        game.camera.follow(sprite);
        game.camera.deadzone = new Phaser.Rectangle(
            100, 60,
            0, 0
        );

        this.wake(); // TODO: 延时
    };

    /**
     * 唤醒
     *
     * @public
     */
    proto.wake = function () {
        this.body.applyForce(100, -200);
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

    /**
     * 更新
     *
     * @param {boolean} isTouching 是否正在触摸
     */
    proto.update = function (isTouching) {
        if (isTouching) {
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

    proto.render = function () {
        var game = this.game;
        var velocity = this.body.velocity;
        game.debug.text('vx: ' + velocity.x.toFixed(2), 2, 34, '#fff');
        game.debug.text('vy: ' + velocity.y.toFixed(2), 2, 54, '#fff');
    };

    return Hero;

});
