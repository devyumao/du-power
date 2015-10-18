/**
 * @file 奖券按钮
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var util = require('common/util');
    var color = require('common/color');
    var Mask = require('common/ui/Mask');
    var Ticket = require('level/End/Ticket');

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

        this.button = null;

        this.mask = null;

        this.ticket = null;

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
