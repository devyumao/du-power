/**
 * @file 全局
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var MODE = {
        DEV: 0,
        PROD: 1
    };

    var global = {
        mode: MODE.DEV,

        imgPath: null,
        audioPath: null,
        imgSuffix: null
    };

    // ==================== mode
    global.setDevMode = function () {
        this.mode = MODE.DEV;
    };

    global.setProdMode = function () {
        this.mode = MODE.PROD;
    };

    global.isDevMode = function () {
        return this.mode === MODE.DEV;
    };

    global.isProdMode = function () {
        return this.mode === MODE.PROD;
    };

    // ==================== resource
    global.initResourceConfig = function () {
        if (global.isProdMode()) {
            // global.imgPath = 'http://ishowshao-game.qiniudn.com/du-power/asset/img/';
            global.imgPath = 'asset/img/';
            global.imgSuffix = '.png?v=*TIMESTAMP*';

            global.audioPath = 'asset/audio/';
        }
        else {
            global.imgPath = 'src/img/';
            global.imgSuffix = '.png';

            global.audioPath = 'src/audio/';
        }
    };

    return global;

});
