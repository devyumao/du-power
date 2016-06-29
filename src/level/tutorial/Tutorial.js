/**
 * @file 教程
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var global = require('common/global');
    var color = require('common/color');
    var Mask = require('common/ui/Mask');

    /**
     * 教程类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     * @param {Object} options 参数项
     * @param {Object} options.level 所属关卡
     */
    function Tutorial(game, options) {
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
         * 遮罩
         *
         * @type {?Mask}
         */
        this.mask = null;

        /**
         * 组
         *
         * @type {?Phaser.Group}
         */
        this.group = null;

        this.init();
    }

    var proto = Tutorial.prototype;

    /**
     * 初始化
     *
     * @private
     */
    proto.init = function () {
        this.initMask();
        this.initGroup();
        this.initGesture();
        this.initCurrentInst();
        this.initChargeInst();

        this.show();
    };

    /**
     * 初始化遮罩
     *
     * @private
     */
    proto.initMask = function () {
        var me = this;

        var mask = new Mask(
            this.game,
            {
                alpha: 0.5,
                onTouch: function () {
                    me.destroy();
                    me.level.resume();
                }
            }
        );
        this.mask = mask;
    };

    /**
     * 初始化组
     *
     * @private
     */
    proto.initGroup = function () {
        var group = this.game.add.group();
        group.fixedToCamera = true;
        this.group = group;
    };

    /**
     * 初始化手势
     *
     * @private
     */
    proto.initGesture = function () {
        var game = this.game;

        var gesture = game.add.image(game.width / 2, game.height, 'gesture');
        gesture.anchor.set(0.5, 1);
        this.group.add(gesture);

        var inst = game.add.text(
            0, -200,
            '按住屏幕\n给小度向下的冲力',
            {
                font: 'bold 42px ' + global.fontFamily,
                fill: color.get('white')
            }
        );
        inst.anchor.set(0.5, 1);
        gesture.addChild(inst);
    };

    /**
     * 初始化电流说明
     *
     * @private
     */
    proto.initCurrentInst = function () {
        var game = this.game;

        var inst = game.add.text(
            game.width - 20, game.height - 16,
            '电流随时间而消耗',
            {
                font: 'bold 30px ' + global.fontFamily,
                fill: color.get('electric')
            }
        );
        inst.anchor.set(1, 1);
        this.group.add(inst);

        var arrow = game.add.image(-inst.width / 2, -inst.height - 10, 'arrow-current');
        arrow.anchor.set(0.5, 1);
        arrow.scale.set(0.7);
        arrow.angle -= 45;
        inst.addChild(arrow);
    };

    /**
     * 初始化充电说明
     *
     * @private
     */
    proto.initChargeInst = function () {
        var game = this.game;

        var inst = game.add.text(
            20, 16,
            '飞到高处\n可以充电哦！',
            {
                font: 'bold 30px ' + global.fontFamily,
                fill: color.get('green')
            }
        );
        this.group.add(inst);

        var arrow = game.add.image(inst.width, inst.height / 2 + 20, 'arrow-charge');
        arrow.anchor.set(0, 1);
        arrow.scale.set(0.7);
        inst.addChild(arrow);
    };

    /**
     * 显示
     *
     * @private
     */
    proto.show = function () {
        this.mask.show(200);

        this.game.add.tween(this.group)
            .from({alpha: 0}, 200, Phaser.Easing.Quadratic.InOut)
            .start();
    };

    /**
     * 销毁
     *
     * @private
     */
    proto.destroy = function () {
        this.mask.hide(200);

        var fadeOut = this.game.add.tween(this.group)
            .to({alpha: 0}, 200, Phaser.Easing.Quadratic.InOut);
        fadeOut.onComplete.add(
            function () {
                this.group.destroy();
            },
            this
        );
        fadeOut.start();
    };

    return Tutorial;

});
