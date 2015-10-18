/**
 * @file 预加载
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var global = require('common/global');

    /**
     * 预加载
     */
    function preload() {
        var game = this.game;

        initLoading(game);
        loadResources(game);
    }

    /**
     * 初始化载入画面
     *
     * @inner
     * @param {Phaser.Game} game 游戏
     */
    function initLoading(game) {
    }

    /**
     * 加载资源
     *
     * @inner
     * @param {Phaser.Game} game 游戏
     */
    function loadResources(game) {
        var path = global.imgPath;
        var suffix = global.imgSuffix;

        [
            'hero',
            'start', 'start-ring', 'title', 'title-decoration',
            'icon-back', 'icon-share', 'icon-restart',
            'success-title', 'ticket',
            'failure-title', 'progress-ring',
            'hero-label',
            'button-pause', 'button-close',
            'charge', 'charge-double',
            'light-fly',
            'gesture', 'arrow-charge', 'arrow-current'
        ].forEach(function (name) {
            game.load.image(name, path + name + suffix);
        });

        [
            'hero-sleep',
            'hero-up',
            'hero-fly',
            'hero-down',
            'hero-dive',
            'hero-wake',
            'hero-over'
        ].forEach(function (name) {
            game.load.spritesheet(name, path + name + suffix, 120, 212);
        });

        game.load.spritesheet('midground', path + 'midground' + suffix, 800, 272);
        game.load.spritesheet('light-ball', path + 'light-ball' + suffix, 1600, 480);
        game.load.spritesheet('light', path + 'light' + suffix, 1400, 720);

        game.load.spritesheet('flag', path + 'flag' + suffix, 186, 197);

        // // 像素图
        // ['black'].forEach(function (color) {
        //     game.load.image('pixel-' + color, path + 'pixel/' + color + suffix);
        // });
    }

    /**
     * 创建
     */
    function create() {
        var game = this.game;
        var level = game.state.states.level;

        // menu -> level 是连贯场景，所以实际是同一 state
        game.state.start('level', true, false, level.STATUS.MENU);
    }

    return {
        preload: preload,
        create: create
    };

});
