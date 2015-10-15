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
        'bg': '#0a0405',
        'mask': '#7c7c7c',
        'black': '#000',
        'white': '#fff',
        'electric': '#6ebdcb',
        'red': '#d0394f',
        'yellow': '#eec349',
        'green': 'green'
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
