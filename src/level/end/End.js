/**
 * @file 结束面板
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var Mask = require('common/ui/Mask');
    var BtnGroup = require('./BtnGroup');

    /**
     * 结束面板类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     * @param {Object} options 参数项
     */
    function End(game, options) {
        /**
         * 游戏
         *
         * @type {Phaser.Game}
         */
        this.game = game;

        this.titleImageName = options.titleImageName;

        this.mask = null;

        this.group = null;

        this.content = null;
    }

    var proto = End.prototype;

    /**
     * 初始化
     *
     * @private
     */
    proto.init = function () {
        var game = this.game;

        this.mask = new Mask(game, {alpha: 0.6});

        var title = game.add.image(game.width / 2, 37, this.titleImageName);
        title.anchor.set(0.5, 0);

        this.content = game.add.group();
        this.initContent();

        var btnGroup = new BtnGroup(game);

        var group = game.add.group();
        group.fixedToCamera = true;
        group.addMultiple([
            title,
            this.content,
            btnGroup.group
        ]);
        this.group = group;
    };

    proto.initContent = function () {
    };

    return End;

});
