/**
 * @file 全局
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var datasource = require('common/datasource');

    var MODE = {
        DEV: 0,
        PROD: 1
    };

    // var storagePrefix = 'dupower-';
    // var storageKey = {
    //     novice: storagePrefix + 'novice',
    //     ticket: storagePrefix + 'ticket'
    // };

    var global = {
        mode: MODE.DEV,

        imgPath: null,
        audioPath: null,
        imgSuffix: null,

        signPackage: null,

        fontFamily: '"Helvetica Neue", Helvetica, STHeiTi, sans-serif',

        novice: null,
        ticket: null,

        shareText: null
    };

    global.init = function () {
        this.initNovice();
        this.initTicket();
        this.resetShareText();
    };

    // ==================== mode
    global.setDevMode = function () {
        this.mode = MODE.DEV;
        this.initResourceConfig();
    };

    global.setProdMode = function () {
        this.mode = MODE.PROD;
        this.initResourceConfig();
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
            // this.imgPath = 'http://ishowshao-game.qiniudn.com/du-power/asset/img/';
            this.imgPath = 'asset/img/';
            // this.imgSuffix = '.png?v=*TIMESTAMP*';
            this.imgSuffix = '.png';

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
        this.novice = true;
    };

    global.getNovice = function () {
        return this.novice;
    };

    global.setNovice = function (novice) {
        this.novice = novice;
    };

    // ==================== 奖券
    global.initTicket = function () {
        var me = this;
        datasource.load(
            ['ticket'],
            function (res) {
                res = JSON.parse(res);
                me.ticket = res.ticket ? JSON.parse(res.ticket) : false;
            },
            function (err) {
                me.ticket = false;
            }
        );
    };

    global.getTicket = function () {
        return this.ticket;
    };

    global.setTicket = function (ticket) {
        this.ticket = ticket;

        datasource.save({
            ticket: ticket
        });
    };

    // ==================== 奖券
    global.resetShareText = function () {
        this.shareText = '【SSG运动会】Fighting SSGer!';
    };

    global.setShareText = function (text) {
        this.shareText = text;
        global.isProdMode() && require('common/weixin').updateShare();
    };

    global.init();

    return global;

});
