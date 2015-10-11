/**
 * @file 启动
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    /**
     * 预加载
     */
    function preload() {
    }

    /**
     * 创建对象
     */
    function create() {
        var game = this.game;

        // 场景设置
        game.stage.backgroundColor = require('common/color').get('bg');

        // 比例设置
        var scale = this.scale;
        scale.scaleMode = Phaser.ScaleManager.SHOW_ALL; // 保持高宽比铺屏
        scale.pageAlignHorizontally = true;
        scale.pageAlignVertically = true;

        // 避免玩家看到屏幕适应的过程
        setTimeout(
            function () {
                game.state.start('preload');
            },
            100
        );
    }

    return {
        preload: preload,
        create: create
    };

});
