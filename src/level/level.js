/**
 * @file 关卡 state
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var global = require('common/global');
    var color = require('common/color');
    var util = require('common/util');

    var Mask = require('common/ui/Mask');
    var Zoom = require('common/Zoom');

    var Menu = require('./menu/Menu');
    var Tutorial = require('./tutorial/Tutorial');
    var PlayUI = require('./play/PlayUI');
    var SuccessEnd = require('./end/SuccessEnd');
    var FailureEnd = require('./end/FailureEnd');

    var Background = require('./scene/Background');

    var Terrain = require('./Terrain');
    var Hero = require('./Hero');
    var Power = require('./Power');

    var STATUS = {
        MENU: 0,
        PLAY: 1,
        OVER: 2
    };

    var level = {
        STATUS: STATUS
    };

    /**
     * 初始化
     *
     * @param {string} status 状态
     */
    level.init = function (status) {
        this.reset();

        this.status = status;
        // this.status = STATUS.PLAY; // for dev
    };

    level.reset = function () {
        util.extend(this, {
            background: null,
            midground: null,
            lightground: null,

            terrain: null,
            hero: null,
            zoom: null,
            power: null,

            menuUI: null,
            playUI: null,
            tutorial: null,
            successEnd: null,
            failureEnd: null,

            status: null,

            isTouching: false,
            isPaused: false,
            hasUpdated: false,

            progress: 0,

            lastCameraX: 0
        });
    };

    /**
     * 预加载
     */
    level.preload = function () {
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

        // var mask = new Mask(this.game, {color: color.get('black'), alpha: 1});
        // mask.hide(150); // 会自动销毁

        // for dev
    };

    /**
     * 初始化菜单状态
     */
    level.initMenuStatus = function () {
        this.initBaseObjects();

        // this.pause();
        this.physics.box2d.pause();

        var game = this.game;
        this.menuUI = new Menu(game, {level: this});
    };

    /**
     * 初始化可玩状态
     */
    level.initPlayStatus = function () {
        switch (this.status) {
            case STATUS.MENU:
                this.menuUI.destroy();
                this.status = STATUS.PLAY;
                break;

            case STATUS.PLAY:
                this.initBaseObjects();
                break;

        }

        // for dev
        // var world = this.world;
        // this.ceiling = new Phaser.Rectangle(0, 0, world.width, 40);
        // this.floor = new Phaser.Rectangle(0, world.height - 40, world.width, world.height);

        // var me = this;
        // setTimeout(
        //     function () {
        //     },
        //     0 // for dev
        // );

        this.physics.box2d.resume();

        this.hero.wake();

        this.bindTouch();
        this.playUI = new PlayUI(this.game, {level: this});
        this.lightground.show(1000);
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
     * 初始化物理
     */
    level.initPhysics = function () {
        var physics = this.physics;
        physics.startSystem(Phaser.Physics.BOX2D);

        var box2d = physics.box2d;
        // box2d.ptmRatio = 60;
        box2d.density = 1;
        box2d.friction = 0.03;
        box2d.restitution = 0.08;
        box2d.gravity.y = 300;
    };

    /**
     * 初始化变焦
     */
    level.initZoom = function () {
        var zoom = new Zoom(this.game);
        zoom.addMultiple([
            this.hero.sprite,
            this.terrain.spriteGroup
            // TODO
            // this.lightground.image
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

    level.pause = function () {
        this.isPaused = true;
        this.physics.box2d.pause();
        this.pauseAnim();
    };

    level.pauseAnim = function () {
        this.terrain.pauseAnim();
        this.hero.pauseAct();
    };

    level.resume = function () {
        this.isPaused = false;
        this.physics.box2d.resume();
        this.resumeAnim();
    };

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
                // if (!this.hasUpdated) {
                //     this.updateOnce();
                // }
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

        this.hasUpdated = true;
    };

    level.updateOnce = function () {
        this.updateCamera();

        this.power.update();
        this.terrain.update();
        this.hero.update();
    };

    // FIX: 单独文件
    level.updateCamera = function () {
        var game = this.game;
        var hero = this.hero;
        var heroSprite = hero.sprite;
        var camera = this.camera;
        var zoom = this.zoom;
        var world = this.world;

        var deadzone = {
            x: 100, y: 100 * zoom.scale.y
        };

        var fullHeight = world.height - heroSprite.y + deadzone.y;
        var scale = game.height < fullHeight ? game.height / fullHeight : 1;

        zoom.to(scale);

        var deltaWG = world.height - game.height;
        camera.y = heroSprite.y - deadzone.y > deltaWG ? deltaWG : heroSprite.y - deadzone.y;
        camera.x = heroSprite.x * scale - deadzone.x;
    };

    level.updateView = function () {
        this.background.update();
        this.midground.update();
        this.lightground.update();
        this.lastCameraX = this.game.camera.x / this.zoom.scale.x;
    };

    level.updatePlay = function () {
        var hero = this.hero;

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

        this.progress = heroX < terrain.distance ? heroX / terrain.distance : 1;

        this.playUI.update();

        if (this.progress === 1 && !hero.isAwake() && !this.isOver()) {
            this.finish(); // 完成
            return;
        }

        var power = this.power;
        var POWER_STATUS = power.STATUS;

        switch (power.status) {
            case POWER_STATUS.EMPTY:
                if (!hero.isAwake() && !this.isOver()) {
                    this.fail(); // 失败
                }
                break;
        }
    };

    level.isOver = function () {
        return this.status === STATUS.OVER;
    };

    level.finish = function () {
        this.complete();
        this.sound.play('finish');

        var me = this;
        var hero = this.hero;

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

    level.fail = function () {
        this.complete();
        this.sound.play('fall');

        var me = this;
        var hero = this.hero;

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

    level.complete = function () {
        this.status = STATUS.OVER;
        this.physics.box2d.pause();

        // var zoom = this.zoom;
        // if (zoom.scale.x !== 1) {
        //     var duration = 200;
        //     zoom.to(1, duration);
        // }

        this.playUI.destroy();

        this.lightground.hide(500);
    };

    level.render = function () {
        var game = this.game;

        game.debug.text('FPS: ' + (game.time.fps || '--'), 2, 14, '#00ff00');

        switch (this.status) {
            case STATUS.MENU:
                break;

            case STATUS.PLAY:
                var debugColor = 'rgba(255, 0, 0, 0.6)';

                // game.debug.box2dWorld();
                // game.debug.geom(this.ceiling, debugColor);
                // game.debug.geom(this.floor, debugColor);

                game.context.fillStyle = debugColor;

                this.hero.render();

                game.debug.text(
                    'progress: ' + (this.progress * 100).toFixed(0) + '%',
                    2, 74,
                    '#fff'
                );

                game.debug.text('camera_x: ' + (game.camera.x / this.zoom.scale.x).toFixed(2), 2, 94, '#fff');

                this.power.render();

                break;
        }
    };

    // level.shutdown = function () {
    // };

    return level;

});
