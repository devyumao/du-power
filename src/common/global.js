/**
 * @file 全局
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var MODE = {
        DEV: 0,
        PROD: 1
    };

    var storagePrefix = 'dupower-';
    var storageKey = {
        novice: storagePrefix + 'novice'
    };

    var global = {
        mode: MODE.DEV,

        imgPath: null,
        audioPath: null,
        imgSuffix: null,

        signPackage: null,

        fontFamily: '"Helvetica Neue", Helvetica, STHeiTi, sans-serif',

        novice: null
    };

    global.init = function () {
        this.initNovice();
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
        if (this.isProdMode()) {
            // global.imgPath = 'http://ishowshao-game.qiniudn.com/du-power/asset/img/';
            this.imgPath = 'asset/img/';
            this.imgSuffix = '.png?v=*TIMESTAMP*';

            this.audioPath = 'asset/audio/';
        }
        else {
            this.imgPath = 'src/img/';
            this.imgSuffix = '.png';

            this.audioPath = 'src/audio/';
        }
    };

    // ==================== sign package
    global.getSignPackage = function () {
        return this.signPackage;
    };

    global.setSignPackage = function (obj) {
        this.signPackage = obj;
    };

    // ==================== 新手
    global.initNovice = function () {
        var novice = localStorage.getItem(storageKey.novice);
        this.novice = novice !== null ? JSON.parse(novice) : true;
    };

    global.getNovice = function () {
        return this.novice;
    };

    global.setNovice = function (novice) {
        this.novice = novice;
        localStorage.setItem(storageKey.novice, novice);
    };

    global.init();

    return global;

});
