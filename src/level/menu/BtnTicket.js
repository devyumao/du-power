/**
 * @file 奖券按钮
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var util = require('common/util');
    var color = require('common/color');
    var Mask = require('common/ui/Mask');
    var Ticket = require('level/end/Ticket');

    /**
     * 奖券按钮类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     */
    function BtnTicket(game) {
        /**
         * 游戏
         *
         * @type {Phaser.Game}
         */
        this.game = game;

        /**
         * 按钮
         *
         * @type {?Phaser.Button}
         */
        this.button = null;

        /**
         * 遮罩
         *
         * @type {?Mask}
         */
        this.mask = null;

        /**
         * 奖券
         *
         * @type {?Ticket}
         */
        this.ticket = null;

        /**
         * 元素
         *
         * @type {?Phaser.Button}
         */
        this.element = null;

        this.init();
    }

    var proto = BtnTicket.prototype;

    /**
     * 初始化
     *
     * @private
     */
    proto.init = function () {
        var game = this.game;

        var button = game.add.button(
            30, game.height - 20,
            'button-ticket',
            this.onClick,
            this
        );
        button.scale.set(0.7);
        button.anchor.set(0, 1);
        this.button = button;
        util.addHover(button);

        this.element = button;
    };

    /**
     * 响应点击事件
     *
     * @private
     */
    proto.onClick = function () {
        var game = this.game;
        game.sound.play('click');

        var me = this;

        var mask = new Mask(
            game,
            {
                alpha: 0.3,
                color: color.get('black'),
                onTouch: function () {
                    me.hideTicket();
                }
            }
        );
        mask.show(500);
        this.mask = mask;

        var ticket = new Ticket(game);
        ticket.element.fixedToCamera = true;
        this.ticket = ticket;

        game.add.tween(ticket.element)
            .from({alpha: 0}, 500, Phaser.Easing.Quadratic.InOut)
            .start();
    };


    /**
     * 隐藏奖券
     *
     * @private
     */
    proto.hideTicket = function () {
        this.mask.hide(500);

        var ticket = this.ticket;
        var fadeOut = this.game.add.tween(ticket.element)
            .to({alpha: 0}, 500, Phaser.Easing.Quadratic.InOut);
        fadeOut.onComplete.add(
            function () {
                ticket.destroy();
            },
            this
        );
        fadeOut.start();
    };

    return BtnTicket;

});
