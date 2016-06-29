/**
 * @file 能量
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    /**
     * 能量状态集
     *
     * @const
     * @type {Object}
     */
    var STATUS = {
        EMPTY: 0, // 耗尽
        STABLE: 1, // 稳定
        LOSING: 2, // 耗损
        NORMAL_CHARGE: 3, // 正常充电
        SUPER_CHARGE: 4 // 超级充电
    };

    /**
     * 能量类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     * @param {Object} options 参数项
     * @param {Object} options.level 所属关卡
     */
    function Power(game, options) {
        /**
         * 游戏
         *
         * @type {Phaser.Game}
         */
        this.game = game;

        /**
         * 所属关卡
         *
         * @type {Object}
         */
        this.level = options.level;

        /**
         * 最大值
         *
         * @type {number}
         */
        this.max = game.width;

        /**
         * 最小值
         *
         * @type {number}
         */
        this.min = 0;

        /**
         * 当前值
         *
         * @type {number}
         */
        this.value = this.max;

        /**
         * 每帧耗损值
         *
         * @type {number}
         */
        this.lossFreq = 0.5;

        /**
         * 每帧正常充电值
         *
         * @type {number}
         */
        this.normalCharge = 0.6;

        /**
         * 正常充电的高度阈值
         *
         * @type {number}
         */
        this.normalThreshold = game.world.height - 440;

        /**
         * 每帧超级充电值
         *
         * @type {number}
         */
        this.superCharge = 1.2;

        /**
         * 超级充电的高度阈值
         *
         * @type {number}
         */
        this.superThreshold = game.world.height - 590;

        /**
         * 电量状态
         *
         * @type {number}
         */
        this.status = STATUS.LOSING;

        /**
         * 上一帧状态
         *
         * @type {number}
         */
        this.lastStatus = this.status;

        /**
         * 低电量阈值
         *
         * @type {number}
         */
        this.lowThreshold = 150;
    }

    var proto = Power.prototype;

    proto.STATUS = STATUS;

    /**
     * 更新帧
     *
     * @public
     */
    proto.update = function () {
        var level = this.level;
        var hero = level.hero;
        var heroBody = hero.body;
        var newValue;

        this.lastStatus = this.status;

        if (level.status !== level.STATUS.PLAY || !hero.hasReachedMinVel) {
            this.status = STATUS.STABLE;
            return;
        }

        if (heroBody.y <= this.superThreshold) {
            newValue = this.value + this.normalCharge;
            this.value = newValue < this.max ? newValue : this.max;

            this.status = STATUS.SUPER_CHARGE;
        }
        else if (heroBody.y <= this.normalThreshold) {
            newValue = this.value + this.superCharge;
            this.value = newValue < this.max ? newValue : this.max;

            this.status = STATUS.NORMAL_CHARGE;
        }
        else {
            newValue = this.value - this.lossFreq;
            if (newValue > this.min) {
                this.value = newValue;
                this.status = STATUS.LOSING;
            }
            else {
                this.value = this.min;
                this.status = STATUS.EMPTY;
            }
        }
    };

    /**
     * 判断是否低电量
     *
     * @public
     * @return {boolean} 是否低电量
     */
    proto.isLow = function () {
        return this.value < this.lowThreshold;
    };

    /**
     * 渲染帧 用于调试
     */
    proto.render = function () {
        var game = this.game;

        game.debug.text('power: ' + this.value.toFixed(1), 2, 114, 'yellow');
    };

    return Power;

});
