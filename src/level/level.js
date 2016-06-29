/**
 * @file 关卡 state
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var global = require('common/global');
    var util = require('common/util');

    var Zoom = require('common/Zoom');

    var Background = require('./scene/Background');

    // 引入菜单元素类
    var Menu = require('./menu/Menu');
    var Tutorial = require('./tutorial/Tutorial');
    var PlayUI = require('./play/PlayUI');
    var SuccessEnd = require('./end/SuccessEnd');
    var FailureEnd = require('./end/FailureEnd');

    // 引入主体玩物类
    var Terrain = require('./Terrain');
    var Hero = require('./Hero');
    var Power = require('./Power');

    /**
     * 关卡内部状态列表
     *
     * @const
     * @type {Object}
     */
    var STATUS = {
        MENU: 0, // 菜单
        PLAY: 1, // 在玩
        OVER: 2  // 结束
    };

    /**
     * 关卡 state
     *
     * @exports level
     * @namespace
     */
    var level = {
        STATUS: STATUS
    };

    /**
     * 初始化
     *
     * @param {number} status 状态
     */
    level.init = function (status) {
        this.reset();

        this.status = status;
    };

    /**
     * 重置
     */
    level.reset = function () {
        util.extend(this, {
            background: null, // 背景
            midground: null, // 中景
            lightground: null, // 光景 (光球层)

            terrain: null, // 地面
            hero: null, // 英雄
            zoom: null, // 变焦器
            power: null, // 能量

            menuUI: null, // 菜单界面
            playUI: null, // 游玩界面
            tutorial: null, // 教程
            successEnd: null, // 成功结束面板
            failureEnd: null, // 失败结束面板

            status: null, // 内部状态

            isTouching: false, // 是否正在触摸
            isPaused: false, // 是否暂停

            progress: 0, // 进程

            lastCameraX: 0 // 上一帧的摄像机水平位置
        });
    };

    /**
     * 预加载
     */
    level.preload = function () {
        // 开启包括 FPS 侦测在内的高级分析功能
        // 注意: 上线前关闭改功能以保证性能
        this.time.advancedTiming = true;
    };

    /**
     * 创建对象
     */
    level.create = function () {
        this.world.height = 720;

        switch (this.status) {
            case STATUS.MENU:
                this.initMenuStatus();
                break;
            case STATUS.PLAY:
                this.initPlayStatus();
                break;
        }
    };

    /**
     * 初始化菜单状态
     */
    level.initMenuStatus = function () {
        this.initBaseObjects();

        // 暂停物理引擎
        this.physics.box2d.pause();

        var game = this.game;
        this.menuUI = new Menu(game, {level: this});
    };

    /**
     * 初始化游玩状态
     */
    level.initPlayStatus = function () {
        // 根据前继状态进行物件的销毁和初始化
        switch (this.status) {
            case STATUS.MENU:
                this.menuUI.destroy();
                this.status = STATUS.PLAY;
                break;

            case STATUS.PLAY:
                this.initBaseObjects();
                break;
        }

        // 恢复物理引擎
        this.physics.box2d.resume();

        // 唤醒英雄
        this.hero.wake();

        this.bindTouch();
        this.playUI = new PlayUI(this.game, {level: this});
        this.lightground.show(1000); // 光景渐显
    };

    /**
     * 初始化基础物件
     */
    level.initBaseObjects = function () {
        this.initPhysics();
        this.initViews();

        var game = this.game;

        this.power = new Power(game, {level: this});
        this.terrain = new Terrain(game, {level: this});
        this.hero = new Hero(game, {level: this});

        this.initZoom();
    };

    /**
     * 初始化场景
     */
    level.initViews = function () {
        var game = this.game;

        this.background = new Background(
            game,
            {
                level: this,
                imageName: 'light-ball',
                absSpeed: 0.2,
                relSpeed: 0.1
            }
        );

        this.midground = new Background(
            game,
            {
                level: this,
                imageName: 'midground',
                absSpeed: 0,
                relSpeed: 0.5
            }
        );

        this.lightground = new Background(
            game,
            {
                level: this,
                imageName: 'light',
                absSpeed: 4,
                relSpeed: 1,
                alpha: 0
            }
        );
    };

    /**
     * 初始化物理引擎
     */
    level.initPhysics = function () {
        var physics = this.physics;
        physics.startSystem(Phaser.Physics.BOX2D);

        var box2d = physics.box2d;
        // box2d.ptmRatio = 60; // for dev
        box2d.density = 1; // 密度
        box2d.friction = 0.03; // 摩擦系数
        box2d.restitution = 0.08; // 恢复系数
        box2d.gravity.y = 300; // 竖直重力
    };

    /**
     * 初始化变焦
     */
    level.initZoom = function () {
        var zoom = new Zoom(this.game);
        zoom.addMultiple([
            this.hero.sprite
            // TODO: 让 lightground 也能正常变焦, 增强视觉冲击
        ]);
        this.zoom = zoom;
    };

    /**
     * 绑定触击操作
     */
    level.bindTouch = function () {
        var input = this.input;

        input.onDown.add(onInputDown, this);
        input.onUp.add(onInputUp, this);
    };

    /**
     * 响应触摸按下
     *
     * @inner
     * @event
     */
    function onInputDown() {
        this.isTouching = true;
    }

    /**
     * 响应触摸松开
     *
     * @inner
     * @event
     */
    function onInputUp() {
        this.isTouching = false;
    }

    /**
     * 暂停
     */
    level.pause = function () {
        this.isPaused = true;
        this.physics.box2d.pause();
        this.pauseAnim();
    };

    /**
     * 暂停动画
     */
    level.pauseAnim = function () {
        this.terrain.pauseAnim();
        this.hero.pauseAct();
    };

    /**
     * 恢复
     */
    level.resume = function () {
        this.isPaused = false;
        this.physics.box2d.resume();
        this.resumeAnim();
    };

    /**
     * 恢复动画
     */
    level.resumeAnim = function () {
        this.terrain.resumeAnim();
        this.hero.resumeAct();
    };

    /**
     * 更新帧
     */
    level.update = function () {
        switch (this.status) {
            case STATUS.OVER:
            case STATUS.MENU:
                this.updateOnce();
                this.updateView();

                break;

            case STATUS.PLAY:
                if (this.isPaused) {
                    return;
                }
                this.updateOnce();
                this.updateView();
                this.updatePlay();

                break;
        }
    };

    /**
     * 更新一次 (主体玩物)
     */
    level.updateOnce = function () {
        this.updateCamera();

        this.power.update();
        this.terrain.update();
        this.hero.update();
    };

    /**
     * 更新摄像机
     */
    level.updateCamera = function () {
        var game = this.game;
        var hero = this.hero;
        var heroSprite = hero.sprite;
        var camera = this.camera;
        var zoom = this.zoom;
        var world = this.world;

        // 不活动区
        var deadzone = {
            x: 100, y: 100 * zoom.scale.y
        };

        // 计算缩放倍数
        var fullHeight = world.height - heroSprite.y + deadzone.y;
        var scale = game.height < fullHeight ? game.height / fullHeight : 1;

        zoom.to(scale);

        // 更新摄像机位置
        var deltaWG = world.height - game.height;
        camera.y = heroSprite.y - deadzone.y > deltaWG ? deltaWG : heroSprite.y - deadzone.y;
        camera.x = heroSprite.x * scale - deadzone.x;
    };

    /**
     * 更新场景
     */
    level.updateView = function () {
        this.background.update();
        this.midground.update();
        this.lightground.update();
        this.lastCameraX = this.game.camera.x / this.zoom.scale.x;
    };

    /**
     * 更新游玩状态
     */
    level.updatePlay = function () {
        var hero = this.hero;

        // 是新手 and 已达到最低速度, 则暂停并开启教程
        if (global.getNovice() && hero.hasReachedMinVel) {
            var game = this.game;
            game.time.events.add(
                300,
                function () {
                    this.pause();
                    this.tutorial = new Tutorial(game, {level: this});
                },
                this
            );

            global.setNovice(false);
        }

        var terrain = this.terrain;
        var heroX = hero.getX();

        // 更新进程
        this.progress = heroX < terrain.distance ? heroX / terrain.distance : 1;

        this.playUI.update();

        // 进程 100% and 英雄休眠 and 关卡还没结束
        if (this.progress === 1 && !hero.isAwake() && !this.isOver()) {
            this.finish(); // 完成
            return;
        }

        var power = this.power;
        var POWER_STATUS = power.STATUS;

        switch (power.status) {
            case POWER_STATUS.EMPTY: // 能量用尽
                // 英雄休眠 and 关卡还没结束
                if (!hero.isAwake() && !this.isOver()) {
                    this.fail(); // 失败
                }
                break;
        }
    };

    /**
     * 判断关卡是否结束
     *
     * @return {boolean} 是否结束
     */
    level.isOver = function () {
        return this.status === STATUS.OVER;
    };

    /**
     * 成功完成
     */
    level.finish = function () {
        this.complete();
        this.sound.play('finish');

        var me = this;
        var hero = this.hero;

        // 英雄前往终点 -> 英雄结束 -> 弹出成功结束面板
        hero.goToTerminal(this.terrain)
            .then(function () {
                hero.over();

                me.game.time.events.add(
                    500,
                    function () {
                        this.successEnd = new SuccessEnd(this.game);
                    },
                    me
                );
            });
    };

    /**
     * 失败完成
     */
    level.fail = function () {
        this.complete();
        this.sound.play('fall');

        var me = this;
        var hero = this.hero;

        // 英雄坠落 -> 英雄结束 -> 弹出失败结束面板
        hero.fall(this.terrain)
            .then(function () {
                hero.over();

                me.game.time.events.add(
                    500,
                    function () {
                        this.failureEnd = new FailureEnd(this.game, {progress: this.progress});
                    },
                    me
                );
            });
    };

    /**
     * 完成
     */
    level.complete = function () {
        this.status = STATUS.OVER;
        this.physics.box2d.pause();

        this.playUI.destroy();

        this.lightground.hide(500);
    };

    /**
     * 渲染帧
     * 屏幕上 log 出参数, 供调试使用
     * 注意：上线前关闭
     */
    level.render = function () {
        var game = this.game;

        game.debug.text('FPS: ' + (game.time.fps || '--'), 2, 14, '#00ff00');

        game.debug.box2dWorld();

        // switch (this.status) {
        //     case STATUS.MENU:
        //         break;

        //     case STATUS.PLAY:
        //         var debugColor = 'rgba(255, 0, 0, 0.6)';

        //         game.debug.box2dWorld();
        //         game.debug.geom(this.ceiling, debugColor);
        //         game.debug.geom(this.floor, debugColor);

        //         game.context.fillStyle = debugColor;

        //         this.hero.render();

        //         game.debug.text(
        //             'progress: ' + (this.progress * 100).toFixed(0) + '%',
        //             2, 74,
        //             '#fff'
        //         );

        //         game.debug.text('camera_x: ' + (game.camera.x / this.zoom.scale.x).toFixed(2), 2, 94, '#fff');

        //         this.power.render();

        //         break;
        // }
    };

    return level;

});
