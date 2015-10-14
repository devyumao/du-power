/**
 * @file 菜单
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var Start = require('./Start');
    var Title = require('./Title');

    /**
     * 开始按钮类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     * @param {Object} options 参数项
     */
    function Menu(game, options) {
        /**
         * 游戏
         *
         * @type {Phaser.Game}
         */
        this.game = game;

        this.level = options.level;

        this.mask = null;

        this.group = game.add.group();

        this.start = null;

        this.title = null;

        this.init();
    }

    var proto = Menu.prototype;

    /**
     * 初始化
     *
     * @private
     */
    proto.init = function () {
        var game = this.game;
        var level = this.level;

        var start = new Start(game, {level: level});
        this.start = start;

        var title = new Title(game);
        this.title = title;

        this.group.addMultiple([start.element, title.element]);
    };

    proto.destroy = function () {
        this.group.destroy();
    };

    return Menu;

});
