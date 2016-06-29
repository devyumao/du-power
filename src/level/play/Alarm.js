/**
 * @file 警报
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var color = require('common/color');

    /**
     * 警报类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     * @param {Object} options 参数项
     * @param {Object} options.level 所属关卡
     */
    function Alarm(game, options) {
        /**
         * 游戏
         *
         * @type {Phaser.Game}
         */
        this.game = game;

        /**
         * 所属关卡
         *
         * @type {Object}
         */
        this.level = options.level;

        /**
         * 贴图
         *
         * @type {?Phaser.Image}
         */
        this.image = null;

        /**
         * 元素
         *
         * @type {?Phaser.Image}
         */
        this.element = null;

        /**
         * 是否正在报警
         *
         * @type {boolean}
         */
        this.isAlarming = false;

        /**
         * 补间动画
         *
         * @type {Phaser.Tween}
         */
        this.tween = null;

        /**
         * 声效
         *
         * @type {Phaser.Sound}
         */
        this.audio = null;

        this.init();
    }

    var proto = Alarm.prototype;

    /**
     * 初始化
     *
     * @private
     */
    proto.init = function () {
        var game = this.game;

        var bitmap = game.add.bitmapData(game.width, game.height);
        bitmap.rect(0, 0, bitmap.width, bitmap.width, color.get('red'));

        var image = game.add.image(0, 0, bitmap);
        image.visible = false;
        image.alpha = 0.5;
        this.image = image;

        this.element = image;
    };

    /**
     * 更新帧
     *
     * @public
     */
    proto.update = function () {
        var power = this.level.power;

        if (!this.isAlarming && power.isLow()) {
            this.alarm();
        }
        else if (this.isAlarming && !power.isLow()) {
            this.recover();
        }
    };

    /**
     * 报警
     *
     * @public
     */
    proto.alarm = function () {
        var game = this.game;
        var image = this.image;

        image.visible = 1;

        // 图层闪烁
        this.tween = game.add.tween(this.image)
            .from({alpha: 0}, 500, Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true)
            .start();
        this.audio = game.sound.play('alarm', 1, true);
        this.isAlarming = true;
    };

    /**
     * 恢复
     *
     * @public
     */
    proto.recover = function () {
        var image = this.image;
        image.visible = false;
        image.alpha = 0.5;

        this.tween.stop(true);
        this.audio.stop();
        this.isAlarming = false;
    };

    return Alarm;

});
