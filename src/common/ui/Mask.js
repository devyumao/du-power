/**
 * @file 遮罩
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var color = require('common/color');

    /**
     * 遮罩类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     * @param {Object} options 参数项
     * @param {string=} options.color 颜色
     * @param {number=} options.alpha 透明度
     * @param {Function=} options.onTouch 触摸回调
     */
    function Mask(game, options) {
        /**
         * 游戏
         *
         * @type {Phaser.Game}
         */
        this.game = game;

        /**
         * 贴图
         *
         * @type {?Phaser.Image}
         */
        this.image = null;

        /**
         * 颜色
         *
         * @type {string}
         */
        this.color = options.color || color.get('mask');

        /**
         * 透明度
         *
         * @type {number}
         */
        this.alpha = options.alpha || 1;

        /**
         * 触摸回调
         *
         * @type {?Function}
         */
        this.onTouch = options.onTouch || null;

        this.init();
    }

    /**
     * 初始化
     *
     * @private
     */
    Mask.prototype.init = function () {
        var game = this.game;

        var bitmap = game.add.bitmapData(game.width, game.height);
        bitmap.rect(0, 0, bitmap.width, bitmap.width, this.color);

        var image = game.add.image(0, 0, bitmap);
        image.fixedToCamera = true;
        image.alpha = this.alpha;
        image.inputEnabled = true; // 屏蔽被遮掩层的交互
        this.image = image;

        this.onTouch && this.bindTouch(this.onTouch);
    };

    /**
     * 显示
     *
     * @public
     * @param {number} duration 动画持续时间
     * @return {Promise}
     */
    Mask.prototype.show = function (duration) {
        if (duration) {
            var show = this.game.add.tween(this.image)
                .from({alpha: 0}, duration, Phaser.Easing.Quadratic.InOut);
            var promise = new Promise(function (resolve) {
                show.onComplete.add(resolve);
            });
            show.start();

            return promise;
        }

        return Promise.resolve();
    };

    /**
     * 隐藏 (附带销毁)
     *
     * @public
     * @param {number} duration 动画持续时间
     * @return {Promise}
     */
    Mask.prototype.hide = function (duration) {
        if (duration) {
            var hide = this.game.add.tween(this.image)
                .to({alpha: 0}, duration, Phaser.Easing.Quadratic.InOut);
            var me = this;
            var promise = new Promise(function (resolve) {
                hide.onComplete.add(
                    function () {
                        this.destroy();
                        resolve();
                    },
                    me
                );
            });
            hide.start();

            return promise;
        }

        this.image.alpha = 0;
        this.destroy();

        return Promise.resolve();
    };

    /**
     * 绑定触摸事件
     *
     * @public
     * @param {Function} onTouch 触摸回调
     */
    Mask.prototype.bindTouch = function (onTouch) {
        this.image.events.onInputUp.add(onTouch);
        // TODO: 点击一次 remove
    };

    /**
     * 解除绑定触摸事件
     *
     * @public
     */
    Mask.prototype.unbindTouch = function () {
        this.image.events.onInputUp.removeAll();
    };

    /**
     * 销毁
     *
     * @private
     */
    Mask.prototype.destroy = function () {
        var image = this.image;
        image.key.destroy();
        image.destroy();
    };

    return Mask;

});
