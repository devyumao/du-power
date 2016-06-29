/**
 * @file 暂停
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var color = require('common/color');
    var util = require('common/util');
    var Mask = require('common/ui/Mask');

    /**
     * 暂停类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     * @param {Object} options 参数项
     * @param {Object} options.level 所属关卡
     */
    function Pause(game, options) {
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
         * 触发器
         *
         * @type {?Phaser.Button}
         */
        this.trigger = null;

        /**
         * 菜单
         *
         * @type {?Phaser.Group}
         */
        this.menu = null;

        /**
         * 组
         *
         * @type {?Phaser.Group}
         */
        this.group = null;

        /**
         * 是否收起
         *
         * @type {boolean}
         */
        this.isCollapsed = true;

        this.init();
    }

    var proto = Pause.prototype;

    /**
     * 初始化
     *
     * @private
     */
    proto.init = function () {
        this.initTrigger();
        this.initMenu();
        this.initGroup();
    };

    /**
     * 初始化触发器
     *
     * @private
     */
    proto.initTrigger = function () {
        var game = this.game;

        // TODO: down callback
        // TODO: menu 动画
        var trigger = game.add.button(
            game.width - 40, 24,
            'button-pause',
            function () {
                if (this.isCollapsed) {
                    game.sound.play('click');
                    this.level.pause();
                    trigger.loadTexture('button-close');
                    this.isCollapsed = false;
                    this.menu.visible = true;
                }
                else {
                    game.sound.play('click');
                    this.level.resume();
                    trigger.loadTexture('button-pause');
                    this.isCollapsed = true;
                    this.menu.visible = false;
                }
            },
            this
        );
        trigger.anchor.set(1, 0);
        trigger.inputEnabled = true;
        util.addHover(trigger);
        this.trigger = trigger;
    };

    /**
     * 初始化菜单
     *
     * @private
     */
    proto.initMenu = function () {
        var game = this.game;

        var menu = game.add.group();
        menu.visible = false;
        this.menu = menu;

        var me = this;
        var trigger = this.trigger;
        var LEVEL_STATUS = this.level.STATUS;

        var transition = function () {
            // 用遮掩层过渡
            var mask = new Mask(game, {color: color.get('black'), alpha: 1});
            return mask.show(150); // 会自动销毁
        };

        var btnConfigList = [
            {
                // 返回主菜单
                name: 'button-back',
                onClick: function () {
                    game.sound.play('click');
                    transition()
                        .then(function () {
                            game.state.restart(true, false, LEVEL_STATUS.MENU);
                        });
                }
            },
            {
                // 重新开始
                name: 'button-restart',
                onClick: function () {
                    game.sound.play('click');
                    transition()
                        .then(function () {
                            game.state.restart(true, false, LEVEL_STATUS.PLAY);
                        });
                }
            }
        ];

        btnConfigList.forEach(function (config, index) {
            var btn = game.add.button(
                trigger.x, trigger.y + 80 * (index + 1),
                config.name,
                config.onClick,
                me
            );
            btn.anchor.set(1, 0);
            util.addHover(btn);
            menu.add(btn);
        });
    };

    /**
     * 初始化组
     *
     * @private
     */
    proto.initGroup = function () {
        var group = this.game.add.group();
        group.addMultiple([this.trigger, this.menu]);
        this.group = group;
    };

    return Pause;

});
