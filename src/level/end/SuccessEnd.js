/**
 * @file 成功结束面板
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var global = require('common/global');
    var color = require('common/color');
    var util = require('common/util');
    var End = require('./End');

    /**
     * 成功结束类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     */
    function SuccessEnd(game) {
        End.call(
            this, game,
            {
                titleImageName: 'success-title'
            }
        );

        this.init();
    }

    util.inherits(SuccessEnd, End);

    var proto = SuccessEnd.prototype;

    proto.initContent = function () {
        var game = this.game;

        var ticket = game.add.image(game.width / 2, 130, 'ticket');
        ticket.anchor.set(0.5, 0);
        ticket.scale.set(0.64);

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

        this.content.add(ticket);
    };

    return SuccessEnd;

});
