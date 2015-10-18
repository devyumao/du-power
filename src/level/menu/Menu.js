/**
 * @file 菜单
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var Mask = require('common/ui/Mask');
    var Start = require('./Start');
    var Title = require('./Title');
    var BtnTicket = require('./BtnTicket');

    /**
     * 菜单类
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

        this.group = null;

        // this.start = null;

        // this.title = null;

        // this.btnTicket = null;

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

        this.mask = new Mask(game, {alpha: 0.4});

        var start = new Start(game, {level: level});
        var title = new Title(game);
        var btnTicket = new BtnTicket(game);

        var group = game.add.group();
        group.fixedToCamera = true;
        group.addMultiple([start.element, title.element, btnTicket.element]);
        this.group = group;
    };

    proto.destroy = function () {
        this.group.destroy();
        this.mask.hide(600);
    };

    return Menu;

});
