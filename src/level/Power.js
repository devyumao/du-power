/**
 * @file 能量
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var STATUS = {
        EMPTY: 0,
        STABLE: 1,
        LOSING: 2,
        NORMAL_CHARGE: 3,
        SUPER_CHARGE: 4
    };

    /**
     * 能量类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     * @param {Object} options 参数项
     */
    function Power(game, options) {
        /**
         * 游戏
         *
         * @type {Phaser.Game}
         */
        this.game = game;

        this.level = options.level;

        this.max = game.width;
        this.min = 0;

        this.value = this.max;

        this.lossFreq = 0.5;

        this.normalCharge = 0.4;
        this.normalThreshold = game.world.height - 460;

        this.superCharge = 0.8;
        this.superThreshold = game.world.height - 580;

        this.status = STATUS.LOSING;

        // this.init();
    }

    var proto = Power.prototype;

    proto.STATUS = STATUS;

    proto.update = function () {
        var level = this.level;
        var heroBody = level.hero.body;
        var newValue;

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

    proto.render = function () {
        var game = this.game;

        game.debug.text('power: ' + this.value.toFixed(1), 2, 114, 'yellow');
    };

    return Power;

});
