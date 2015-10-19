/**
 * @file 可玩界面
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var Alarm = require('./Alarm');
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

        this.alarm = null;

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

        var group = game.add.group();
        group.fixedToCamera = true;
        this.group = group;

        var alarm = new Alarm(game, {level: level});
        this.alarm = alarm;
        group.add(alarm.element);

        var roadmap = new Roadmap(game, {level: level});
        this.roadmap = roadmap;
        group.add(roadmap.element);

        var pause = new Pause(game, {level: level});
        this.pause = pause;
        group.add(pause.group);

        var chargeTip = new ChargeTip(game, {level: level});
        this.chargeTip = chargeTip;
        group.add(chargeTip.group);
    };

    proto.update = function () {
        this.alarm.update();
        this.roadmap.update();
        this.chargeTip.update();
    };

    proto.destroy = function () {
        var alarm = this.alarm;
        alarm.isAlarming && alarm.recover();
        this.group.destroy();
    };

    return PlayUI;

});
