/**
 * @file 关卡 state
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    // var global = require('common/global');
    var Zoom = require('common/Zoom');

    var Menu = require('./menu/Menu');

    var Terrain = require('./Terrain');
    var Hero = require('./Hero');
    var Power = require('./Power');

    var STATUS = {
        MENU: 0,
        PLAY: 1
    };

    var level = {
        terrain: null,
        hero: null,
        zoom: null,
        power: null,

        menu: null,

        status: null,

        isOver: false,
        isTouching: false,
        isPaused: false,
        hasUpdated: false,

        progress: 0,

        STATUS: STATUS
    };

    /**
     * 预加载
     */
    level.preload = function () {
        this.time.advancedTiming = true;
    };

    /**
     * 初始化
     *
     * @param {string} status 状态
     */
    level.init = function (status) {
        this.status = status;
        // this.status = STATUS.PLAY; // for dev
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

        this.bindTouch();

        var world = this.world;
        // for dev
        this.ceiling = new Phaser.Rectangle(0, 0, world.width, 40);
        this.floor = new Phaser.Rectangle(0, world.height - 40, world.width, world.height);

        var me = this;
        setTimeout(
            function () {
                me.resume();
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
        zoom.add(this.hero.sprite);
        zoom.add(this.terrain.spriteGroup);
        this.zoom = zoom;

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

    level.updatePlay = function () {
        var terrain = this.terrain;
        var hero = this.hero;
        var heroX = hero.getX();

        this.progress = heroX < terrain.distance ? heroX / terrain.distance : 1;

        if (!hero.isAwake() && !this.isOver) {
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
        var game = this.game;

        this.isOver = true;
        this.pause();

        var zoom = this.zoom;
        if (zoom.scale.x !== 1) {
            zoom.to(1, 200);
            game.camera.deadzone.y = 60; // TODO: config
        }

        this.hero.goToTerminal(this.terrain.getTerminal());
    };

    level.fail = function () {
        this.isOver = true;
        this.pause();
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
                game.debug.geom(this.ceiling, debugColor);
                game.debug.geom(this.floor, debugColor);

                game.context.fillStyle = debugColor;
                var zone = game.camera.deadzone;
                game.context.fillRect(zone.x, zone.y, zone.width, zone.height);

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

    return level;

});
