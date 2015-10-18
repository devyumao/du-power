/**
 * @file 奖券
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var color = require('common/color');
    var global = require('common/global');

    /**
     * 奖券类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     */
    function Ticket(game) {
        /**
         * 游戏
         *
         * @type {Phaser.Game}
         */
        this.game = game;

        this.image = null;

        this.element = null;

        this.init();
    }

    var proto = Ticket.prototype;

    /**
     * 初始化
     *
     * @private
     */
    proto.init = function () {
        var game = this.game;

        var ticket = game.add.image(game.width / 2, 130, 'ticket');
        ticket.anchor.set(0.5, 0);
        ticket.scale.set(0.64);
        this.image = ticket;
        this.element = ticket;

        var datasource = require('common/datasource');
        datasource.getCode()
            .then(function (res) {
                res = JSON.parse(res);
                if (!res.success) {
                    return;
                }

                var codeText = res.code.substring(1).split('').join(' ');
                var code = game.add.text(
                    0, 180,
                    codeText,
                    {
                        font: 'bold 60px ' + global.fontFamily,
                        fill: color.get('jujube')
                    }
                );
                code.anchor.set(0.5, 0);
                ticket.addChild(code);
            });

    };

    proto.destroy = function () {
        this.element.destroy();
    };

    return Ticket;

});
