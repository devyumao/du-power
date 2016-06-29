/**
 * @file 充电提示
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    /**
     * 充电提示类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     * @param {Object} options 参数项
     * @param {Object} options.level 所属关卡
     */
    function ChargeTip(game, options) {
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
         * 组
         *
         * @type {?Phaser.Group}
         */
        this.group = null;

        this.init();
    }

    var proto = ChargeTip.prototype;

    /**
     * 初始化
     *
     * @private
     */
    proto.init = function () {
        this.initGroup();
    };

    /**
     * 初始化组
     *
     * @private
     */
    proto.initGroup = function () {
        this.group = this.game.add.group();
    };

    /**
     * 添加提示
     *
     * @private
     * @param {string} name 提示贴图名
     */
    proto.addTip = function (name) {
        var game = this.game;
        var group = this.group;

        var Easing = Phaser.Easing;

        var oldTip = group.getTop();
        if (oldTip) {
            var oldFadeOut = game.add.tween(oldTip)
                .to({alpha: 0}, 150, Easing.Quadratic.In);
            oldFadeOut.onComplete.add(function () {
                oldTip.destroy();
            });
            oldFadeOut.start();
        }

        var tip = game.add.image(game.width / 2, 50, name);
        tip.anchor.set(0.5, 0);
        tip.scale.set(0.5);
        group.add(tip);

        var flyIn = game.add.tween(tip)
            .from({x: game.width + tip.width / 2}, 300, Easing.Quadratic.Out);
        var fadeOut = game.add.tween(tip)
            .to({alpha: 0}, 300, Easing.Quadratic.In, false, 400);

        fadeOut.onComplete.add(function () {
            tip.destroy();
        });

        flyIn.chain(fadeOut);
        flyIn.start();
    };

    /**
     * 更新帧
     *
     * @public
     */
    proto.update = function () {
        var level = this.level;
        var sound = level.sound;
        var power = level.power;
        var STATUS = power.STATUS;
        var lastStatus = power.lastStatus;

        switch (power.status) {
            case STATUS.NORMAL_CHARGE:
                if (lastStatus === STATUS.LOSING) {
                    sound.play('charge');
                    this.addTip('charge');
                }
                break;

            case STATUS.SUPER_CHARGE:
                if (lastStatus === STATUS.NORMAL_CHARGE) {
                    sound.play('charge-double');
                    this.addTip('charge-double');
                }
                break;
        }
    };

    return ChargeTip;

});
