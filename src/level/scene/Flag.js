/**
 * @file 旗子
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    /**
     * 旗子类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     */
    function Flag(game, options) {
        /**
         * 游戏
         *
         * @type {Phaser.Game}
         */
        this.game = game;

        this.sprite = null;

        this.group = null;

        this.x = options.x;

        this.y = options.y;

        this.animName = 'flutter';

        this.init();
    }

    var proto = Flag.prototype;

    /**
     * 初始化
     *
     * @private
     */
    proto.init = function () {
        this.initSprite();
        this.initGroup();
    };

    proto.initSprite = function () {
        var game = this.game;

        var sprite = game.add.sprite(this.x, this.y, 'flag');
        sprite.scale.set(0.7);
        sprite.anchor.set(1, 1);
        this.sprite = sprite;

        var animations = sprite.animations;
        var animName = this.animName;
        animations.add(animName);
        animations.play(animName, 6, true);
    };

    proto.initGroup = function () {
        var group = this.game.add.group();
        group.addMultiple([this.sprite]);
        this.group = group;
    };

    return Flag;

});
