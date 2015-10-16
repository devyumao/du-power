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
     * @param {Phaser.Game} game 游戏
     */
    function FailureEnd(game, options) {
        End.call(
            this, game,
            {
                titleImageName: 'failure-title'
            }
        );

        this.progress = options.progress;

        this.init();
    }

    util.inherits(FailureEnd, End);

    var proto = FailureEnd.prototype;

    proto.initContent = function () {
        var game = this.game;

        var ring = game.add.image(game.width / 2, 120, 'progress-ring');
        ring.anchor.set(0.5, 0);

        var progressText = game.add.text(
            10, 121,
            (this.progress * 100).toFixed(0) + '',
            {
                font: '48px ' + global.fontFamily,
                fill: color.get('green')
            }
        );
        progressText.anchor.set(1, 0);
        ring.addChild(progressText);

        this.content.add(ring);
    };

    return FailureEnd;

});
