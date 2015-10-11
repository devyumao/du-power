/**
 * @file 关卡 state
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var Terrain = require('./Terrain');
    var Hero = require('./Hero');
    var Zoom = require('common/Zoom');

    var level = {
        terrain: null,
        hero: null,
        zoom: null,
        isTouching: false
    };

    level.preload = function () {
        this.game.time.advancedTiming = true;
    };

    /**
     * 创建对象
     */
    level.create = function () {
        this.initPhysics();

        var game = this.game;

        this.terrain = new Terrain(game);
        this.hero = new Hero(game);

        this.initZoom();

        this.bindEvents();

        // for dev
        this.ceiling = new Phaser.Rectangle(0, 0, game.world.width, 40);
        this.floor = new Phaser.Rectangle(0, game.world.height - 40, game.world.width, game.world.height);
    };

    level.initPhysics = function () {
        var physics = this.game.physics;
        physics.startSystem(Phaser.Physics.BOX2D);

        var box2d = physics.box2d;
        // box2d.ptmRatio = 60;
        box2d.density = 1;
        box2d.friction = 0.06;
        box2d.restitution = 0.08;
        box2d.gravity.y = 300;
    };

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

    level.bindEvents = function () {
        var game = this.game;

        game.input.onDown.add(onInputDown, this);
        game.input.onUp.add(onInputUp, this);
    };

    function onInputDown() {
        this.isTouching = true;
    }

    function onInputUp() {
        this.isTouching = false;
    }

    /**
     * 更新帧
     */
    level.update = function () {
        this.terrain.update();
        this.hero.update(this.isTouching);
        this.updateZoom();
    };

    // FIX: 单独文件
    level.updateZoom = function () {
        var game = this.game;
        var zoom = this.zoom;
        var deadzone = game.camera.deadzone;
        var heroBottom = game.world.height - this.hero.sprite.y;
        var fullHeight = heroBottom + deadzone.y;
        var scale = game.height < fullHeight ? game.height / fullHeight : 1;
        zoom.to(scale);
        deadzone.y = 60 * scale; // FIX: deadzone 参数常量
    };

    level.render = function () {
        var game = this.game;

        var debugColor = 'rgba(255, 0, 0, 0.6)';

        game.debug.box2dWorld();
        game.debug.geom(this.ceiling, debugColor);
        game.debug.geom(this.floor, debugColor);

        game.context.fillStyle = debugColor;
        var zone = game.camera.deadzone;
        game.context.fillRect(zone.x, zone.y, zone.width, zone.height);

        game.debug.text('FPS: ' + (game.time.fps || '--'), 2, 14, '#00ff00');

        this.hero.render();

        game.debug.text(
            this.hero.body.x.toFixed(0) + ' / ' + game.world.width,
            2, 74,
            '#fff'
        );
    };

    return level;

});
