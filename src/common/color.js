/**
 * @file 颜色
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    /**
     * 颜色
     *
     * @type {Object}
     */
    var colors = {
        'bg': '0b0505',
        'white': '#fff',
        'electric': '#71bdca',
        'red': '#ce3c51',
        'yellow': '#c49b6d'
    };

    /**
     * 取得
     *
     * @param {string} color 颜色名称
     * @return {string} 颜色十六进制
     */
    function get(color) {
        return colors[color];
    }

    return {
        get: get
    };

});
