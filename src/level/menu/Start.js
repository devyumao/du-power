/**
 * @file 开始按钮
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var util = require('common/util');

    /**
     * 开始按钮类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     * @param {Object} options 参数项
     * @param {Object} options.level 所属关卡
     */
    function Start(game, options) {
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
         * 按钮
         *
         * @type {Phaser.Button}
         */
        this.button = null;

        /**
         * 圆环
         *
         * @type {Phaser.Image}
         */
        this.ring = null;

        /**
         * 元素
         *
         * @type {Phaser.Button}
         */
        this.element = null;

        this.init();
    }

    var proto = Start.prototype;

    /**
     * 初始化
     *
     * @private
     */
    proto.init = function () {
        var game = this.game;

        // 绘制按钮
        var button = game.add.button(
            game.width / 2, game.height / 2,
            'start',
            function () {
                game.sound.play('click');

                button.inputEnabled = false;
                this.fadeOut();

                this.level.initPlayStatus();
            },
            this
        );
        button.anchor.set(0.5);
        this.button = button;
        util.addHover(button);

        // 绘制圆环
        var ring = game.add.image(0, 0, 'start-ring');
        ring.anchor.set(0.5);
        button.addChild(ring);
        this.ring = ring;

        this.element = button;

        this.animate();
    };

    /**
     * 动画
     *
     * @private
     */
    proto.animate = function () {
        this.game.add.tween(this.ring)
            .to({angle: '+360'}, 3000, Phaser.Easing.Linear.None, true, 0, -1);
    };

    /**
     * 渐出
     *
     * @private
     */
    proto.fadeOut = function () {
    };

    return Start;

});
