/**
 * @file 可玩界面
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var Roadmap = require('./Roadmap');
    var Pause = require('./Pause');
    var ChargeTip = require('./ChargeTip');

    /**
     * 可玩界面类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     * @param {Object} options 参数项
     */
    function PlayUI(game, options) {
        /**
         * 游戏
         *
         * @type {Phaser.Game}
         */
        this.game = game;

        this.level = options.level;

        this.group = null;

        this.roadmap = null;

        this.pause = null;

        this.chargeTip = null;

        this.init();
    }

    var proto = PlayUI.prototype;

    /**
     * 初始化
     *
     * @private
     */
    proto.init = function () {
        var game = this.game;
        var level = this.level;

        var roadmap = new Roadmap(game, {level: level});
        this.roadmap = roadmap;

        var pause = new Pause(game, {level: level});
        this.pause = pause;

        var chargeTip = new ChargeTip(game, {level: level});
        this.chargeTip = chargeTip;

        var group = game.add.group();
        group.fixedToCamera = true;
        group.addMultiple([
            roadmap.element,
            pause.group,
            chargeTip.group
        ]);
        this.group = group;
    };

    proto.update = function () {
        this.roadmap.update();
        this.chargeTip.update();
    };

    proto.destroy = function () {
        this.group.destroy();
    };

    return PlayUI;

});
