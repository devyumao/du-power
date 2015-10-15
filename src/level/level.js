/**
 * @file 关卡 state
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    // var global = require('common/global');
    var util = require('common/util');
    var Zoom = require('common/Zoom');

    var Menu = require('./menu/Menu');
    var SuccessEnd = require('./end/SuccessEnd');
    var FailureEnd = require('./end/FailureEnd');

    var Background = require('./scene/Background');

    var Terrain = require('./Terrain');
    var Hero = require('./Hero');
    var Power = require('./Power');

    var STATUS = {
        MENU: 0,
        PLAY: 1
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
        this.status = STATUS.PLAY; // for dev
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

            successEnd: null,
            failureEnd: null,

            status: null,

            isOver: false,
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

        // for dev
        // this.successEnd = new SuccessEnd(this.game);
    };

    /**
     * 初始化菜单状态
     */
    level.initMenuStatus = function () {
        this.initBaseObjects();

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

        var me = this;
        setTimeout(
            function () {
                me.bindTouch();
                me.resume();
                me.lightground.show(1000);
            },
            0 // for dev
        );
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

        this.pause();
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
        box2d.friction = 0.05;
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

        // // for dev
        // zoom.to(0.7);
        // setTimeout(function () {
        //     zoom.to(1);
        // }, 3000);
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
    };

    level.resume = function () {
        this.isPaused = false;
        this.physics.box2d.resume();
    };

    /**
     * 更新帧
     */
    level.update = function () {
        switch (this.status) {
            case STATUS.MENU:
                if (!this.hasUpdated) {
                    this.updateOnce();
                }

                break;

            case STATUS.PLAY:
                if (this.isPaused) {
                    return;
                }
                this.updateOnce();
                this.updatePlay();
                break;
        }

        this.updateView();

        this.hasUpdated = true;
    };

    level.updateOnce = function () {
        this.updateZoom();

        this.power.update();
        this.terrain.update();
        this.hero.update();
    };

    // FIX: 单独文件
    level.updateZoom = function () {
        var game = this.game;
        var zoom = this.zoom;
        var deadzone = game.camera.deadzone;
        var heroBottom = this.world.height - this.hero.sprite.y;
        var fullHeight = heroBottom + deadzone.y;
        var scale = game.height < fullHeight ? game.height / fullHeight : 1;
        zoom.to(scale);
        deadzone.y = 60 * scale; // FIX: deadzone 参数常量
    };

    level.updateView = function () {
        this.background.update();
        this.midground.update();
        this.lightground.update();
        this.lastCameraX = this.game.camera.x / this.zoom.scale.x;
    };

    level.updatePlay = function () {
        var terrain = this.terrain;
        var hero = this.hero;
        var heroX = hero.getX();

        this.progress = heroX < terrain.distance ? heroX / terrain.distance : 1;

        if (this.progress === 1 && !hero.isAwake() && !this.isOver) {
            this.finish(); // 完成
        }

        var power = this.power;
        var POWER_STATUS = power.STATUS;

        switch (power.status) {
            case POWER_STATUS.EMPTY:
                if (!hero.isAwake() && !this.isOver) {
                    this.fail(); // 失败
                }
                break;
        }
    };

    level.finish = function () {
        this.complete();

        var me = this;

        this.hero.goToTerminal(this.terrain.getTerminal())
            .then(function () {
                me.successEnd = new SuccessEnd(me.game);
            });
    };

    level.fail = function () {
        this.complete();

        this.failureEnd = new FailureEnd(this.game, {progress: this.progress.toFixed(2)});
    };

    level.complete = function () {
        var game = this.game;

        this.isOver = true;
        this.pause();

        var zoom = this.zoom;
        if (zoom.scale.x !== 1) {
            zoom.to(1, 200);
            game.camera.deadzone.y = 60; // TODO: config
        }

        // TODO: 更新电流

        this.lightground.hide(0);
    };

    level.render = function () {
        var game = this.game;

        game.debug.text('FPS: ' + (game.time.fps || '--'), 2, 14, '#00ff00');

        // switch (this.status) {
        //     case STATUS.MENU:
        //         break;

        //     case STATUS.PLAY:
        //         var debugColor = 'rgba(255, 0, 0, 0.6)';

        //         // game.debug.box2dWorld();
        //         // game.debug.geom(this.ceiling, debugColor);
        //         // game.debug.geom(this.floor, debugColor);

        //         game.context.fillStyle = debugColor;
        //         var zone = game.camera.deadzone;
        //         game.context.fillRect(zone.x, zone.y, zone.width, zone.height);

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
