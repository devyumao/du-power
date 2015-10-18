/**
 * @file 主程序
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var global = require('common/global');

    /**
     * 初始化
     */
    function init() {
        if (global.isProdMode()) {
            require('common/weixin').init();
        }

        initGame();
    }

    /**
     * 初始化游戏
     *
     * @inner
     */
    function initGame() {
        var game = new Phaser.Game(800, 480, Phaser.CANVAS, '');

        game.state.add('boot', require('boot'));
        game.state.add('preload', require('preload'));
        game.state.add('level', require('level/level'));

        game.state.start('boot');
    }

    return {
        init: init
    };

});
