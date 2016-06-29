/**
 * @file 成功结束面板
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var global = require('common/global');
    var util = require('common/util');
    var End = require('./End');
    var Ticket = require('./Ticket');

    /**
     * 成功结束类
     *
     * @class
     * @extends End
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

    /**
     * 初始化内容
     *
     * @private
     */
    proto.initContent = function () {
        var ticket = new Ticket(this.game);
        this.content.add(ticket.element);
    };

    /**
     * 更新分享内容
     *
     * @public
     */
    proto.updateShare = function () {
        global.setShareText('【SSG运动会】我完成了挑战，你也来试试吧！');
    };

    return SuccessEnd;

});
