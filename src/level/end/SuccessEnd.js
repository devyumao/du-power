/**
 * @file 成功结束面板
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var util = require('common/util');
    var End = require('./End');
    var Ticket = require('./Ticket');

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
        var ticket = new Ticket(this.game);
        this.content.add(ticket.element);
    };

    return SuccessEnd;

});
