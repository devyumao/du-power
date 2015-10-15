/**
 * @file 变焦器
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var util = require('common/util');

    function Zoom(game) {
        Phaser.Group.call(this, game);

        this.bounds = Phaser.Rectangle.clone(game.world.bounds);

        this.scale.setTo(1);
    }
    util.inherits(Zoom, Phaser.Group);

    var proto = Zoom.prototype;

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
            // Phaser.Utils.mixin(boundsTo, cameraBounds);
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
