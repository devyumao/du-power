/**
 * @file 启动
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var global = require('common/global');

    /**
     * 预加载
     */
    function preload() {
        this.game.load.spritesheet('hero-sleep', global.imgPath + 'hero-sleep' + global.imgSuffix, 120, 212);
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
        scale.pageAlignHorizontally = true; // 水平居中
        scale.pageAlignVertically = true; // 垂直居中
        scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

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
