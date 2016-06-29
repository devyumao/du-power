/**
 * @file 变焦器
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var util = require('common/util');

    /**
     * 变焦器
     *
     * @class
     * @extends Phaser.Group
     * @param {Phaser.Game} game 游戏
     */
    function Zoom(game) {
        Phaser.Group.call(this, game);

        /**
         * 范围
         *
         * @type {Phaser.Rectangle}
         */
        this.bounds = Phaser.Rectangle.clone(game.world.bounds);

        this.scale.setTo(1);
    }
    util.inherits(Zoom, Phaser.Group);

    var proto = Zoom.prototype;

    /**
     * 缩放至
     *
     * @public
     * @param {number} scale 缩放比例
     * @param {number} duration 用时
     */
    proto.to = function (scale, duration) {
        var game = this.game;
        var bounds = this.bounds;
        var cameraBounds = game.camera.bounds;

        var boundsTo = {
            x: bounds.x  * (1 - scale) / 2,
            y: bounds.y * (1 - scale) / 2,
            width: bounds.width  * scale,
            height: bounds.height * scale
        };

        if (!duration) {
            util.extend(cameraBounds, boundsTo);
            this.scale.setTo(scale);
        }
        else {
            game.add.tween(cameraBounds)
                .to(boundsTo, duration)
                .start();
            game.add.tween(this.scale)
                .to({x: scale, y: scale}, duration)
                .start();
        }
    };

    return Zoom;

});
