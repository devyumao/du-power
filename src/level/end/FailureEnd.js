/**
 * @file 失败结束面板
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var global = require('common/global');
    var color = require('common/color');
    var util = require('common/util');
    var End = require('./End');

    /**
     * 失败结束类
     *
     * @class
     * @extends End
     * @param {Phaser.Game} game 游戏
     * @param {Object} options 参数项
     * @param {number} options.progress 进程
     */
    function FailureEnd(game, options) {
        End.call(
            this, game,
            {
                titleImageName: 'failure-title'
            }
        );

        /**
         * 进程
         *
         * @type {number}
         */
        this.progress = options.progress;

        this.init();
    }

    util.inherits(FailureEnd, End);

    var proto = FailureEnd.prototype;

    /**
     * 初始化内容
     *
     * @private
     */
    proto.initContent = function () {
        var game = this.game;

        var ring = game.add.image(game.width / 2, 120, 'progress-ring');
        ring.anchor.set(0.5, 0);

        var progressText = game.add.text(
            10, 121,
            Math.floor(this.progress * 100) + '',
            {
                font: '48px ' + global.fontFamily,
                fill: color.get('green')
            }
        );
        progressText.anchor.set(1, 0);
        ring.addChild(progressText);

        this.content.add(ring);
    };

    /**
     * 更新分享内容
     *
     * @public
     */
    proto.updateShare = function () {
        global.setShareText('【SSG运动会】我完成了' + Math.floor(this.progress * 100) + '%，你也来试试吧！');
    };

    return FailureEnd;

});
