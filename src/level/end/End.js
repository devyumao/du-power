/**
 * @file 结束面板
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var color = require('common/color');
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

        var mask = new Mask(game, {alpha: 0.5, color: color.get('black')});
        mask.show(500);
        this.mask = mask;

        var title = game.add.image(game.width / 2, 37, this.titleImageName);
        title.anchor.set(0.5, 0);

        this.content = game.add.group();
        this.initContent();

        var btnGroup = new BtnGroup(game);

        var copyright = game.add.image(game.width - 15, game.height - 20, 'copyright');
        copyright.anchor.set(1, 1);
        copyright.scale.set(0.55);

        var group = game.add.group();
        group.fixedToCamera = true;
        group.addMultiple([
            title,
            this.content,
            btnGroup.group,
            copyright
        ]);
        this.group = group;

        this.updateShare();

        this.show();
    };

    proto.initContent = function () {
    };

    proto.updateShare = function () {
    };

    proto.show = function () {
        this.game.add.tween(this.group)
            .from({alpha: 0}, 500, Phaser.Easing.Quadratic.InOut)
            .start();
    };

    return End;

});
