/**
 * @file 按钮组
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var color = require('common/color');
    var util = require('common/util');
    var Mask = require('common/ui/Mask');

    /**
     * 按钮组类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     * @param {Object} options 参数项
     */
    function BtnGroup(game, options) {
        /**
         * 游戏
         *
         * @type {Phaser.Game}
         */
        this.game = game;

        this.group = null;

        this.init();
    }

    var proto = BtnGroup.prototype;

    /**
     * 初始化
     *
     * @private
     */
    proto.init = function () {
        var game = this.game;
        var me = this;

        var group = game.add.group();
        group.x = game.width / 2;
        group.y = game.height - 50;
        this.group = group;

        var transition = function () {
            // 用遮掩层过渡
            var mask = new Mask(game, {color: color.get('black'), alpha: 1});
            return mask.show(150); // 会自动销毁
        };

        var LEVEL_STATUS = game.state.states.level.STATUS;

        // TODO: 素材留白 保证点击
        var btnConfigList = [
            {
                name: 'icon-back',
                scale: 0.7,
                onClick: function () {
                    game.sound.play('click');
                    transition()
                        .then(function () {
                            game.state.restart(true, false, LEVEL_STATUS.MENU);
                        });
                }
            },
            {
                name: 'icon-share',
                scale: 0.7,
                onClick: function () {
                    game.sound.play('click');
                }
            },
            {
                name: 'icon-restart',
                scale: 0.7,
                onClick: function () {
                    game.sound.play('click');
                    transition()
                        .then(function () {
                            game.state.restart(true, false, LEVEL_STATUS.PLAY);
                        });
                }
            }
        ];

        var btnSpacing = 120;
        var btnX = -(btnConfigList.length - 1) * btnSpacing / 2;

        btnConfigList.forEach(function (config, index) {

            var btn = game.add.button(
                btnX + index * btnSpacing, 0,
                config.name,
                config.onClick,
                me
            );
            btn.anchor.set(0.5);
            btn.scale.set(config.scale ? config.scale : 1);
            util.addHover(btn);
            group.add(btn);
        });


    };

    /**
     * 销毁
     *
     * @public
     */
    proto.destroy = function () {
        this.group.destroy();
    };

    return BtnGroup;

});
