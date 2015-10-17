/**
 * @file 主角
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var MIN_Y = 100;
    var MIN_VELOCITY_X = 80;
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

        this.flyingFrameCount = 0;

        this.isContactEnding = false;

        // this.isFlying = false;

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

        var sprite = game.add.sprite(100, game.world.height - 160 - this.radius);
        sprite.scale.set(0.6);
        sprite.anchor.set(0.5);
        this.sprite = sprite;

        game.physics.box2d.enable(sprite);

        var body = sprite.body;
        body.setCircle(this.radius);
        body.fixedRotation = true;
        this.body = body;

        // 碰撞检测
        body.setBodyContactCallback(
            this.level.terrain,
            function (heroBody, terrainBody, heroFt, terrainFt, begin) {
                this.isContactEnding = !begin;
            },
            this
        );

        game.camera.follow(sprite); // TODO: fix follow bug
        game.camera.deadzone = new Phaser.Rectangle(
            100, 60,
            0, 0
        );

        this.sleep();

        this.wake(); // TODO: 延时
    };

    /**
     * 行使动作
     *
     * @private
     * @param {string} action 动作名称
     * @param {number} fps 帧数
     * @param {boolean=} loop 是否循环, 缺省 false
     */
    proto.act = function (action, fps, loop) {
        var sprite = this.sprite;
        var key = ['hero', action].join('-');

        // 若已是当前 key, 则不重载贴图 (loadTexture 较耗内存)
        if (sprite.key === key) {
            return;
        }
        sprite.loadTexture(key);

        // 添加/运行动画
        if (fps) {
            !sprite.animations.getAnimation(action) && sprite.animations.add(action, null, fps, !!loop);
            sprite.animations.play(action);
        }
    };

    proto.pauseAct = function () {
        var currentAnim = this.sprite.animations.currentAnim;
        currentAnim.stop();
    };

    proto.resumeAct = function () {
        var currentAnim = this.sprite.animations.currentAnim;
        currentAnim.play();
    };

    proto.sleep = function () {
        this.act('sleep', 6, true);
    };

    proto.up = function () {
        this.act('up', 6, true);
    };

    proto.fly = function () {
        this.act('fly');
    };

    proto.down = function () {
        this.act('down');
    };

    /**
     * 俯冲
     *
     * @public
     */
    proto.dive = function () {
        var body = this.body;
        var velocity = body.velocity;
        if (velocity.x > MIN_VELOCITY_X) {
            body.applyForce(0, 70); // TODO: 调参
        }
        this.act('dive');
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
        if (!this.awake) {
            return;
        }

        if (this.isContactEnding) {
            ++this.flyingFrameCount;
        }
        else {
            this.flyingFrameCount = 0;
        }

        this.sprite.bringToTop(); // XXX: 可能有性能问题

        this.updateStatus();

        if (this.level.isTouching) {
            this.dive();
        }
        this.limitVelocity();
        this.updateAngle();
    };

    /**
     * 限制速度
     */
    proto.limitVelocity = function () {
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
            this.awake = false; // TODO: sleep()
            return;
        }

        var power = level.power;
        var POWER_STATUS = power.STATUS;

        switch (power.status) {
            case POWER_STATUS.EMPTY:
                this.awake = false;
                break;
            default:
                var angle = this.body.angle;
                if (level.isTouching) {
                }
                else {
                    if (angle < 0) {
                        if (this.flyingFrameCount >= 10) {
                            this.fly();
                        }
                        else {
                            this.up();
                        }
                    }
                    else if (angle > 0) {
                        this.down();
                    }
                }
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

        var rotate = game.add.tween(body)
            .to({angle: 0}, duration);

        var move = game.add.tween(body)
            .to(posTo, duration);
        var promise = new Promise(function (resolve) {
            move.onComplete.add(resolve);
        });

        rotate.start();
        move.start();

        return promise;
    };

    proto.render = function () {
        var game = this.game;
        var velocity = this.body.velocity;
        game.debug.text('vx: ' + velocity.x.toFixed(2), 2, 34, '#fff');
        game.debug.text('vy: ' + velocity.y.toFixed(2), 2, 54, '#fff');
    };

    return Hero;

});
