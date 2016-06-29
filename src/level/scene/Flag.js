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
     * @param {Object} options 参数项
     * @param {Object} options.x 水平位置
     * @param {Object} options.x 竖直位置
     */
    function Flag(game, options) {
        /**
         * 游戏
         *
         * @type {Phaser.Game}
         */
        this.game = game;

        /**
         * 精灵图
         *
         * @type {?Phaser.Sprite}
         */
        this.sprite = null;

        /**
         * 组
         *
         * @type {?Phaser.Group}
         */
        this.group = null;

        /**
         * 水平位置
         *
         * @type {number}
         */
        this.x = options.x;

        /**
         * 竖直位置
         *
         * @type {number}
         */
        this.y = options.y;

        /**
         * 动画名称
         *
         * @type {string}
         */
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

    /**
     * 初始化精灵图
     *
     * @private
     */
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

    /**
     * 初始化组
     *
     * @private
     */
    proto.initGroup = function () {
        var group = this.game.add.group();
        group.addMultiple([this.sprite]);
        this.group = group;
    };

    /**
     * 暂停动画
     *
     * @public
     */
    proto.pauseAnim = function () {
        var currentAnim = this.sprite.animations.currentAnim;
        currentAnim.stop();
    };

    /**
     * 恢复动画
     *
     * @public
     */
    proto.resumeAnim = function () {
        var currentAnim = this.sprite.animations.currentAnim;
        currentAnim.play();
    };

    return Flag;

});
