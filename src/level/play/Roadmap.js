/**
 * @file 路程图
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    /**
     * 路程图类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     * @param {Object} options 参数项
     * @param {Object} options.level 所属关卡
     */
    function Roadmap(game, options) {
        /**
         * 游戏
         *
         * @type {Phaser.Game}
         */
        this.game = game;

        /**
         * 所属关卡
         *
         * @type {Object}
         */
        this.level = options.level;

        /**
         * 定位贴图
         *
         * @type {?Phaser.Image}
         */
        this.location = null;

        /**
         * 元素
         *
         * @type {?Phaser.Image}
         */
        this.element = null;

        this.init();
    }

    var proto = Roadmap.prototype;

    /**
     * 初始化
     *
     * @private
     */
    proto.init = function () {
        var game = this.game;

        var location = game.add.image(0, game.height, 'hero-label');
        location.anchor.set(0, 1);
        location.scale.set(0.9);
        this.location = location;

        this.element = location;
    };

    /**
     * 更新帧
     *
     * @public
     */
    proto.update = function () {
        this.location.x = this.level.progress * this.game.width;
    };

    return Roadmap;

});
