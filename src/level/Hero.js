/**
 * @file 主角
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    /**
     * 最小数值位置
     *
     * @const
     * @type {number}
     */
    var MIN_Y = 100;
    /**
     * 最小水平速度
     *
     * @const
     * @type {number}
     */
    var MIN_VELOCITY_X = 80;
    /**
     * 最大水平速度
     *
     * @const
     * @type {number}
     */
    var MAX_VELOCITY_X = 1200;
    /**
     * 最大速度缓存数
     *
     * @const
     * @type {number}
     */
    var MAX_VELOCITY_CACHE = 10;

    /**
     * 主角类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     * @param {Object} options 参数项
     * @param {Object} options.level 所属关卡
     */
    function Hero(game, options) {
        /**
         * 游戏
         *
         * @type {Phaser.Game}
         */
        this.game = game;

        /**
         * 所属关卡
         *
         * @type {Object}
         */
        this.level = options.level;

        /**
         * 精灵图
         *
         * @type {?Phaser.Sprite}
         */
        this.sprite = null;

        /**
         * Box2D 躯体
         *
         * @type {Phaser.Physics.Box2D.Body}
         */
        this.body = null;

        /**
         * 身后的光
         *
         * @type {?Phaser.Image}
         */
        this.light = null;

        /**
         * 半径
         *
         * @type {number}
         */
        this.radius = 32;

        /**
         * 是否醒着
         *
         * @type {boolean}
         */
        this.awake = false;

        /**
         * 速度缓存
         *
         * @type {Array.<Object>}
         */
        this.velocityCache = [];

        /**
         * 飞行帧计数
         *
         * @type {number}
         */
        this.flyingFrameCount = 0;

        /**
         * 与地面的接触是否正在结束
         *
         * @type {boolean}
         */
        this.isContactEnding = false;

        /**
         * 是否正在飞
         *
         * @type {boolean}
         */
        this.isFlying = false;

        /**
         * 是否正在飞
         *
         * @type {boolean}
         */
        this.hasReachedMinVel = false;

        /**
         * 是否正在俯冲
         *
         * @type {boolean}
         */
        this.isDiving = false;

        /**
         * 俯冲声效
         *
         * @type {?Phaser.Sound}
         */
        this.soundDive = null;

        this.init();
    }

    var proto = Hero.prototype;

    /**
     * 初始化
     *
     * @private
     */
    proto.init = function () {
        this.initSprite();
        this.initBody();
        this.initLight();

        this.sleep();
    };

    /**
     * 初始化精灵图
     *
     * @private
     */
    proto.initSprite = function () {
        var game = this.game;

        var sprite = game.add.sprite(100, game.world.height - 160 - this.radius);
        sprite.scale.set(0.6);
        sprite.anchor.set(0.5);
        this.sprite = sprite;
    };

    /**
     * 初始化物理主体
     *
     * @private
     */
    proto.initBody = function () {
        var game = this.game;
        var sprite = this.sprite;

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
    };

    /**
     * 初始化身后光
     *
     * @private
     */
    proto.initLight = function () {
        var game = this.game;

        var light = game.add.image(-60, -10, 'light-fly');
        light.anchor.set(1, 0.5);
        light.alpha = 0;
        this.light = light;

        this.sprite.addChild(light);
    };

    /**
     * 显示身后光
     *
     * @private
     */
    proto.showLight = function () {
        var game = this.game;
        var light = this.light;
        var Easing = Phaser.Easing;

        var fadeIn = game.add.tween(light)
            .to({alpha: 1}, 50, Easing.Quadratic.Out);
        var fadeOut = game.add.tween(light)
            .to({alpha: 0}, 300, Easing.Quadratic.In, false, 200);
        fadeIn.chain(fadeOut).start();
    };

    /**
     * 行使动作
     *
     * @private
     * @param {string} action 动作名称
     * @param {number} fps 帧数
     * @param {boolean=} loop 是否循环, 缺省 false
     * @param {boolean=} refresh 是否刷新贴图, 缺省 false
     */
    proto.act = function (action, fps, loop, refresh) {
        var sprite = this.sprite;
        var key = ['hero', action].join('-');

        // 若已是当前 key, 则不重载贴图 (loadTexture 较耗内存)
        if (sprite.key === key && !refresh) {
            return;
        }
        sprite.loadTexture(key);

        // 添加/运行动画
        if (fps) {
            var animations = sprite.animations;
            !animations.getAnimation(action) && animations.add(action, null, fps, !!loop);
            animations.play(action);
        }
    };

    /**
     * 停止动作
     *
     * @public
     */
    proto.pauseAct = function () {
        var currentAnim = this.sprite.animations.currentAnim;
        currentAnim.stop();
        if (this.isDiving) {
            this.soundDive.stop();
            this.isDiving = false;
        }
    };

    /**
     * 恢复动作
     *
     * @public
     */
    proto.resumeAct = function () {
        var currentAnim = this.sprite.animations.currentAnim;
        currentAnim.play();
    };

    /**
     * 休眠动作
     *
     * @public
     */
    proto.sleep = function () {
        this.act('sleep', 5, true);
    };

    /**
     * 向上动作
     *
     * @public
     */
    proto.up = function () {
        this.act('up', 6, true);
    };

    /**
     * 飞行动作
     *
     * @public
     */
    proto.fly = function () {
        this.act('fly');
    };

    /**
     * 向下动作
     *
     * @public
     */
    proto.down = function () {
        this.act('down');
    };

    /**
     * 唤醒
     *
     * @public
     */
    proto.wake = function () {
        var game = this.game;
        var timeEvents = game.time.events;

        timeEvents.add(
            200,
            function () {
                game.sound.play('wake');
                this.act('wake', 5);
            },
            this
        );

        timeEvents.add(
            1300,
            function () {
                // 给予作用力 给一个右上方的初始加速度
                this.body.applyForce(200, -200);
                this.awake = true;
            },
            this
        );
    };

    /**
     * 俯冲
     *
     * @public
     */
    proto.dive = function () {
        var body = this.body;
        var velocity = body.velocity;
        // 水平速度超过最小阈值后 作用力施加有效
        if (velocity.x > MIN_VELOCITY_X) {
            body.applyForce(0, 75); // 此处可调参
        }
        this.act('dive');
    };

    /**
     * 关机动作
     *
     * @public
     */
    proto.shutdown = function () {
        this.act('over');
    };

    /**
     * 结束动作
     *
     * @public
     */
    proto.over = function () {
        this.act('over', 10, false, true);
    };

    /**
     * 是否醒着
     *
     * @public
     * @return {boolean} 是否醒着
     */
    proto.isAwake = function () {
        return this.awake;
    };

    /**
     * 取得水平位置
     *
     * @public
     * @return {boolean} 水平位置
     */
    proto.getX = function () {
        return this.body.x;
    };

    /**
     * 更新帧
     *
     * @public
     */
    proto.update = function () {
        this.sprite.bringToTop(); // XXX: 可能有性能问题

        if (!this.awake) {
            return;
        }

        // 计数飞行帧
        if (this.isContactEnding) {
            ++this.flyingFrameCount;
        }
        else {
            this.flyingFrameCount = 0;
            this.isFlying = false;
        }

        this.updateStatus();
        this.limitVelocity();
        this.updateAngle();
    };

    /**
     * 限制速度
     *
     * @private
     */
    proto.limitVelocity = function () {
        var body = this.body;
        var velocity = body.velocity;

        // 上下限
        if (velocity.x < MIN_VELOCITY_X) {
            if (this.hasReachedMinVel) {
                velocity.x = MIN_VELOCITY_X;
            }
        }
        else {
            this.hasReachedMinVel = true;
            if (velocity.x > MAX_VELOCITY_X) {
                velocity.x = MAX_VELOCITY_X;
            }
        }

        // 进入顶部区域, 竖直速度每帧减少 10%, 直至殆尽
        if (body.y < MIN_Y && velocity.y < 0) {
            velocity.y -= velocity.y / 10;
        }
    };

    /**
     * 更新角度
     * 用最近速度缓存修正转角, 改善转向抖动情况
     *
     * @private
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

    /**
     * 更新状态
     *
     * @private
     */
    proto.updateStatus = function () {
        var level = this.level;
        if (level.progress === 1) { // 关卡进程完成
            this.awake = false;
            return;
        }

        var power = level.power;
        var POWER_STATUS = power.STATUS;

        switch (power.status) {
            case POWER_STATUS.EMPTY: // 能量耗尽
                this.awake = false;
                break;

            default:
                var body = this.body;
                var angle = body.angle;
                if (level.isTouching) { // 正在触屏
                    this.dive();

                    // 首帧播放音效
                    if (!this.isDiving) {
                        this.soundDive = level.sound.play('dive', 1, true);
                        this.isDiving = true;
                    }
                }
                else { // 未被触摸
                    if (this.isDiving) {
                        this.soundDive.stop();
                        this.isDiving = false;
                    }

                    if (angle < 0) { // 转角偏上
                        if (this.flyingFrameCount >= 12) { // 累计飞行帧超过一定数后
                            var velocity = body.velocity;
                            if (!this.isFlying && velocity.y < 0) { // 正式飞行第一帧
                                var speed = Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2));
                                if (speed >= 550) {
                                    // 达到第一速度后, 放声音，显身后光
                                    level.sound.play('fly');
                                    this.showLight();
                                    // 达到第二速度后, 播放尖叫声
                                    speed >= 800 && level.time.events.add(
                                        250,
                                        function () {
                                            level.sound.play('yell');
                                        }
                                    );
                                }
                            }
                            this.fly();
                            this.isFlying = true;
                        }
                        else {
                            this.up();
                        }
                    }
                    else if (angle > 0) { // 转角偏下
                        this.down();
                    }
                }
        }
    };

    /**
     * 去往某处
     *
     * @public
     * @param {Object} position 位置
     * @param {number} duration 用时
     * @param {Phaser.Easing} ease 动画效果
     * @return {Promise}
     */
    proto.goTo = function (position, duration, ease) {
        var game = this.game;
        var body = this.body;

        var rotate = game.add.tween(body)
            .to({angle: 0}, duration);

        var move = game.add.tween(body)
            .to(position, duration, ease);
        var promise = new Promise(function (resolve) {
            move.onComplete.add(resolve);
        });

        rotate.start();
        move.start();

        return promise;
    };

    /**
     * 去往终点
     *
     * @public
     * @param {Terrain} terrain 地面
     * @return {Promise}
     */
    proto.goToTerminal = function (terrain) {
        this.shutdown();

        var terminal = terrain.getTerminal();
        terminal.y -= this.radius;

        return this.goTo(terminal, 400, Phaser.Easing.Linear.None);
    };

    /**
     * 坠落
     *
     * @public
     * @param {Terrain} terrain 地面
     * @return {Promise}
     */
    proto.fall = function (terrain) {
        this.shutdown();

        var position = terrain.getNearestPoint(this);
        position.y -= this.radius;
        var duration = Math.abs(this.body.y - position.y);

        return this.goTo(position, Math.sqrt(duration) * 20, Phaser.Easing.Quadratic.In);
    };

    /**
     * 渲染帧 用于调试
     */
    proto.render = function () {
        var game = this.game;
        var velocity = this.body.velocity;
        game.debug.text('vx: ' + velocity.x.toFixed(2), 2, 34, '#fff');
        game.debug.text('vy: ' + velocity.y.toFixed(2), 2, 54, '#fff');
        game.debug.text(
            'speed: ' + Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2)).toFixed(0),
            2, 134,
            '#fff'
        );
    };

    return Hero;

});
