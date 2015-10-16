/**
 * @file 暂停
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var util = require('common/util');

    /**
     * 暂停类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     */
    function Pause(game, options) {
        /**
         * 游戏
         *
         * @type {Phaser.Game}
         * @param {Object} options 参数项
         */
        this.game = game;

        this.level = options.level;

        this.trigger = null;

        this.menu = null;

        this.group = null;

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

    proto.initTrigger = function () {
        var game = this.game;

        // TODO: down callback
        // TODO: menu 动画
        var trigger = game.add.button(
            game.width - 40, 24,
            'button-pause',
            function () {
                if (this.isCollapsed) {
                    this.level.pause();
                    trigger.loadTexture('button-close');
                    this.isCollapsed = false;
                    this.menu.visible = true;
                }
                else {
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

    proto.initMenu = function () {
        var game = this.game;

        var menu = game.add.group();
        menu.visible = false;
        this.menu = menu;

        var me = this;
        var trigger = this.trigger;
        var LEVEL_STATUS = this.level.STATUS;
        var btnConfigList = [
            {
                name: 'button-close',
                onClick: function () {
                    game.state.restart(true, false, LEVEL_STATUS.MENU);
                }
            },
            {
                name: 'button-close',
                onClick: function () {
                    game.state.restart(true, false, LEVEL_STATUS.PLAY);
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

    proto.initGroup = function () {
        var group = this.game.add.group();
        group.addMultiple([this.trigger, this.menu]);
        this.group = group;
    };

    return Pause;

});