/**
 * @file 预加载
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

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
        var path = 'src/img/';
        var suffix = '.png';

        ['hero', 'start', 'start-ring', 'title', 'title-decoration'].forEach(function (name) {
            game.load.image(name, path + name + suffix);
        });
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
