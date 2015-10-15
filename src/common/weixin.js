/**
 * @file 微信
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var global = require('common/global');

    /**
     * 初始化
     */
    function init() {
        var signPackage = global.getSignPackage();
        signPackage.jsApiList = [
            'onMenuShareTimeline',
            'onMenuShareAppMessage'
        ];

        // debug 解除注释
        // signPackage.debug = true;

        wx.config(signPackage);

        wx.ready(function () {
            updateShare();
        });
    }

    /**
     * 更新分享
     */
    function updateShare() {
        var link = 'http://farm.yiluwan.org/dupower/index.php';
        var imgUrl = 'http://farm.yiluwan.org/efe-game/asset/img/icon-200.png';
        var title = 'Fighting SSGer';

        wx.onMenuShareTimeline({
            // title: global.getShareText(),
            title: title,
            link: link,
            imgUrl: imgUrl,
            success: function () {
            }
        });
        wx.onMenuShareAppMessage({
            title: title,
            // desc: global.getShareText(),
            desc: title,
            link: link,
            imgUrl: imgUrl
        });
    }

    return {
        init: init,
        updateShare: updateShare
    };

});
