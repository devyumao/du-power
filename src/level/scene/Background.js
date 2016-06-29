/**
 * @file 背景
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    /**
     * 背景类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     * @param {Object} options 参数项
     * @param {Object} options.level 所属关卡
     * @param {string} options.imageName 贴图名
     * @param {string} options.absSpeed 绝对速度, 缺省 0
     * @param {string} options.relSpeed 相对速度, 缺省 0
     * @param {string} options.alpha 透明度, 缺省 1
     */
    function Background(game, options) {
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
         * 贴图
         *
         * @type {?Phaser.Image}
         */
        this.image = null;

        /**
         * 贴图名前缀
         *
         * @type {string}
         */
        this.imageName = options.imageName;

        /**
         * 绝对速度
         *
         * @type {number}
         */
        this.absSpeed = options.absSpeed || 0;

        /**
         * 相对速度
         *
         * @type {number}
         */
        this.relSpeed = options.relSpeed || 0;

        /**
         * 透明度
         *
         * @type {number}
         */
        this.alpha = options.alpha !== 'undefined' ? options.alpha : 1;

        this.init();
    }

    /**
     * 初始化
     *
     * @private
     */
    Background.prototype.init = function () {
        var game = this.game;

        var imageName = this.imageName;
        var imageCache = game.cache.getImage(imageName);

        var image = game.add.tileSprite(
            0, game.height,
            imageCache.width, imageCache.height,
            imageName
        );
        image.alpha = this.alpha;
        image.anchor.set(0, 1);
        image.fixedToCamera = true;
        this.image = image;
    };

    /**
     * 显示
     *
     * @public
     * @param {number} duration 用时
     * @return {Promise}
     */
    Background.prototype.show = function (duration) {
        if (duration) {
            var show = this.game.add.tween(this.image)
                .to({alpha: 1}, duration);
            var promise = new Promise(function (resolve) {
                show.onComplete.add(resolve);
            });
            show.start();

            return promise;
        }

        this.image.alpha = 1;

        return Promise.resolve();
    };

    /**
     * 隐藏
     *
     * @public
     * @param {number} duration 用时
     * @return {Promise}
     */
    Background.prototype.hide = function (duration) {
        if (duration) {
            var show = this.game.add.tween(this.image)
                .to({alpha: 0}, duration);
            var promise = new Promise(function (resolve) {
                show.onComplete.add(resolve);
            });
            show.start();

            return promise;
        }

        this.image.alpha = 0;

        return Promise.resolve();
    };

    /**
     * 更新帧
     *
     * @public
     */
    Background.prototype.update = function () {
        var level = this.level;

        this.scroll(
            this.absSpeed
            + (this.game.camera.x / level.zoom.scale.x - level.lastCameraX) * this.relSpeed
        );
    };

    /**
     * 滚动
     *
     * @public
     * @param {number} offsetX 位移
     */
    Background.prototype.scroll = function (offsetX) {
        this.image.tilePosition.x -= offsetX;
    };

    /**
     * 销毁
     *
     * @public
     */
    Background.prototype.destroy = function () {
        this.image.destroy();
    };

    return Background;

});
