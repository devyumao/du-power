/**
 * @file 数据源
 * @author yumao [zhangyu38@baidu.com]
 */

define(function () {

    var ajax = require('common/ajax');
    var url = require('common/url');

    /**
     * 读取
     *
     * @param {Array.<string>} keys 键组
     * @param {Function} success 成功回调
     * @param {Function} failure 失败回调
     */
    function load(keys, success, failure) {
        ajax.get({
            url: url.LOAD_DATA,
            data: {
                key: keys.join(',')
            },
            success: success,
            failure: failure
        });
    }

    /**
     * 存储
     *
     * @param {Object} data 数据
     * @param {Function} success 成功回调
     * @param {Function} failure 失败回调
     */
    function save(data, success, failure) {
        ajax.post({
            url: url.SAVE_DATA,
            data: data,
            success: success,
            failure: failure
        });
    }

    /**
     * 获取券码
     *
     * @param {Function} success 成功回调
     * @param {Function} failure 失败回调
     * @return {Promise}
     */
    function getCode(success, failure) {
        return get(url.GET_CODE);
    }

    /**
     * get 请求的 promise 封装
     *
     * @param {string} url URL
     * @param {Object} data 数据
     * @return {Promise}
     */
    function get(url, data) {
        return new Promise(function (resolve) {
            ajax.get({
                url: url,
                data: data,
                success: resolve,
                failure: function (err) {
                    resolve({success: false});
                }
            });
        });
    }

    return {
        load: load,
        save: save,
        getCode: getCode
    };

});
