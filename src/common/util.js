/**
 * @file 工具
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    /**
     * 工具
     *
     * @exports util
     * @namespace
     */
    var util = {};

    /**
     * 设置继承关系
     *
     * @param {Function} type 子类
     * @param {Function} superType 父类
     * @return {Function} 子类
     */
    util.inherits = function (type, superType) {
        var Empty = function () {};
        Empty.prototype = superType.prototype;
        var proto = new Empty();

        var originalPrototype = type.prototype;
        type.prototype = proto;

        for (var key in originalPrototype) {
            proto[key] = originalPrototype[key];
        }
        type.prototype.constructor = type;

        return type;
    };

    /**
     * 添加 hover 效果
     *
     * @param {Phaser.Button} btn 按钮
     * @param {*} target 待加效果目标
     */
    util.addHover = function (btn, target) {
        var events = btn.events;
        target = target ? target : btn;
        var originAlpha = target.alpha;

        events.onInputDown.add(function () {
            target.alpha = originAlpha * 0.8;
        });
        events.onInputUp.add(function () {
            target.alpha = originAlpha;
        });
    };

    return util;

});
