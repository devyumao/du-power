/**
 * @file 地面
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var color = require('common/color');
    var util = require('common/util');

    /**
     * 极值点数量
     *
     * @const
     * @type {number}
     */
    var NUM_EXTREMUM = 110; // 偶数为佳
    /**
     * 区间宽度
     *
     * @const
     * @type {number}
     */
    var SEGMENT_WIDTH = 10;

    /**
     * 地面类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     * @param {Object} options 参数项
     * @param {Object} options.level 所属关卡
     */
    function Terrain(game, options) {
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
         * 极值点集
         *
         * @type {Array.<Object>}
         */
        this.extremums = [];

        /**
         * Box2D 躯体
         *
         * @type {Phaser.Physics.Box2D.Body}
         */
        this.body = null;

        /**
         * 边缘曲线列表
         *
         * @type {Array.<Array>}
         */
        this.edges = []; // FIXME: 重命名为曲线

        /**
         * 边缘点集
         *
         * @type {Array.<Array>}
         */
        this.edgePoints = [];

        /**
         * 管道精灵图列表
         *
         * @type {Array.<Phaser.Sprite>}
         */
        this.tubes = [];

        /**
         * 电流精灵图列表
         *
         * @type {Array.<Phaser.Sprite>}
         */
        this.currents = [];

        /**
         * BAIUD logo 贴图列表
         *
         * @type {Array.<Phaser.Image>}
         */
        this.logos = [];

        /**
         * 终点旗子
         *
         * @type {?Phaser.Sprite}
         */
        this.flag = null;

        /**
         * 是否有旗子
         *
         * @type {boolean}
         */
        this.hasFlag = false;

        /**
         * 前极值点序号
         *
         * @type {number}
         */
        this.prevExtremumIndex = 0;

        /**
         * 后极值点序号
         *
         * @type {number}
         */
        this.nextExtremumIndex = 0;

        /**
         * 电流颜色
         *
         * @type {string}
         */
        this.currentColor = color.get('electric');

        /**
         * 电流透明度
         *
         * @type {number}
         */
        this.cAlpha = 1;

        /**
         * 电流增量符号 控制闪烁效果
         *
         * @type {number}
         */
        this.cAlphaDeltaSign = -1;

        /**
         * 路程全长
         *
         * @type {?number}
         */
        this.distance = null;

        this.init();
    }

    var proto = Terrain.prototype;

    /**
     * 初始化
     *
     * @private
     */
    proto.init = function () {
        this.initExtremums();
        this.initBody();
    };

    /**
     * 初始化物理主体
     *
     * @private
     */
    proto.initBody = function () {
        var game = this.game;

        var body = new Phaser.Physics.Box2D.Body(game, null, 0, 0);
        body.static = true; // 位置静止
        this.body = body;
    };

    /**
     * 初始化极值点
     *
     * @private
     */
    proto.initExtremums = function () {
        var game = this.game;
        var worldHeight = game.world.height;

        // 前三点
        var extremums = [
            {x: -60, y: worldHeight - 80},
            {x: 100, y: worldHeight - 160},
            {x: 320, y: worldHeight - 40},
            {x: 600, y: worldHeight - 200}
        ];

        var minDX = 200;
        var minDY = 80;
        var rangeDX = 120;
        var rangeDY = 110;
        var minHeight = 30;
        var maxHeight = 360;

        for (var i = extremums.length; i <= NUM_EXTREMUM - 2; ++i) {
            var pointA = extremums[i - 1];

            var bY;
            var sign = i % 2 ? -1 : 1;
            do {
                bY = pointA.y + sign * (minDY + game.rnd.between(0, rangeDY));
            } while (bY > worldHeight - minHeight || bY < worldHeight - maxHeight);

            var pointB = {
                x: pointA.x + minDX + game.rnd.between(0, rangeDX),
                y: bY
            };
            extremums.push(pointB);
        }

        // 倒二
        var penult = extremums[NUM_EXTREMUM - 2];

        extremums.push({x: penult.x + 500, y: penult.y});

        this.extremums = extremums;
        this.distance = penult.x; // 全长为倒二点水平位置

        // 根据最远极值点设定世界宽度
        game.world.width = extremums[NUM_EXTREMUM - 1].x;
    };

    /**
     * 更新帧
     *
     * @public
     */
    proto.update = function () {
        this.updateEdges();
        this.updateCurrents();
        this.updateFlag();
        this.updateLogos();
    };

    /**
     * 更新旗子
     *
     * @private
     */
    proto.updateFlag = function () {
        if (this.hasFlag) {
            return;
        }

        var game = this.game;
        var boundsLeft = this.getPenult().x - 600;
        // 快抵达终点时更新旗子
        if (game.camera.x / this.level.zoom.scale.x > boundsLeft) {
            this.initFlag();
        }
    };

    /**
     * 初始化旗子
     *
     * @private
     */
    proto.initFlag = function () {
        var Flag = require('./scene/Flag');
        var game = this.game;
        var penult = this.extremums[NUM_EXTREMUM - 2];

        this.flag = new Flag(
            game,
            {x: game.world.width - 70, y: penult.y}
        );
        this.hasFlag = true;
    };

    /**
     * 暂停动画
     *
     * @public
     */
    proto.pauseAnim = function () {
        this.hasFlag && this.flag.pauseAnim();
    };

    /**
     * 暂停动画
     *
     * @public
     */
    proto.resumeAnim = function () {
        this.hasFlag && this.flag.resumeAnim();
    };

    /**
     * 取得倒数第二个极值点
     *
     * @private
     * @return {Object} 极值点
     */
    proto.getPenult = function () {
        return this.extremums[NUM_EXTREMUM - 2];
    };

    /**
     * 更新边缘曲线
     *
     * @private
     */
    proto.updateEdges = function () {
        this.clearPrevEdges();
        this.drawNextEdges();
    };

    /**
     * 更新电流
     *
     * @private
     */
    proto.updateCurrents = function () {
        this.updateCurrentColor();
        this.renderCurrents();
    };

    /**
     * 清除前一组边缘 (连带附属)
     *
     * @private
     */
    proto.clearPrevEdges = function () {
        var game = this.game;
        var body = this.body;
        var extremums = this.extremums;
        var edges = this.edges;
        var currents = this.currents;
        var tubes = this.tubes;
        var logos = this.logos;
        var zoom = this.level.zoom;

        var removeEdge = function (edge) {
            body.removeFixture(edge);
        };

        for (var prevI = this.nextExtremumIndex; prevI > this.prevExtremumIndex; --prevI) {
            var boundsLeft = game.camera.x / zoom.scale.x - 400;
            if (extremums[prevI].x < boundsLeft) {
                // 清除边缘
                edges[prevI].forEach(removeEdge);
                edges[prevI] = null;

                // 清除电流
                var current = currents[prevI];
                current.key.destroy();
                current.destroy();
                currents[prevI] = null;

                // 清除管道
                var tube = tubes[prevI];
                tube.key.destroy();
                tube.destroy();
                tube[prevI] = null;

                // 清除 logo
                var logo = logos[prevI];
                if (logo) {
                    logo.destroy();
                    logos[prevI] = null;
                }

                this.prevExtremumIndex = prevI;

                break;
            }
        }
    };

    /**
     * 绘制后一组边缘
     *
     * @private
     */
    proto.drawNextEdges = function () {
        var game = this.game;
        var body = this.body;
        var extremums = this.extremums;
        var edges = this.edges;
        var edgePoints = this.edgePoints;
        var tubeWidth = 12;
        var zoom = this.level.zoom;
        var tubes = this.tubes;

        // 变相余弦曲线
        for (var i = this.nextExtremumIndex; i < NUM_EXTREMUM - 1; ++i) {
            var pointA = extremums[i];
            var boundsRight = game.camera.x / zoom.scale.x + 2000;
            if (pointA.x > boundsRight) {
                break;
            }

            var pointB = extremums[i + 1];

            var segmentCount = Math.floor((pointB.x - pointA.x) / SEGMENT_WIDTH);
            var dx = (pointB.x - pointA.x) / segmentCount;
            var da = Math.PI / segmentCount;
            var ymid = (pointA.y + pointB.y) / 2;
            var ampl = (pointA.y - pointB.y) / 2;

            var p0 = {x: pointA.x, y: pointA.y};
            var edgeGroup = [];

            var bitmap = game.add.bitmapData(pointB.x - pointA.x, game.world.height);
            var sprite = game.add.sprite(pointA.x, 0, bitmap);
            sprite.terrainType = 'tube'; // for test
            tubes[i] = sprite;
            zoom.add(sprite); // 管道贴图加入变焦器

            var points = [p0];

            var ctx = bitmap.ctx;
            ctx.beginPath();
            ctx.lineCap = 'round';
            ctx.lineWidth = 2;
            ctx.strokeStyle = color.get('electric');

            // 区间逐点连线
            for (var j = 1; j < segmentCount + 1; ++j) {
                var p1 = {
                    x: pointA.x + j * dx,
                    y: ymid + ampl * Math.cos(da * j)
                };

                points.push(p1);
                edgeGroup.push(body.addEdge(p0.x, p0.y, p1.x, p1.y));

                var p0xRel = p0.x - sprite.x;
                var p1xRel = p1.x - sprite.x;
                // 上边缘
                ctx.moveTo(p0xRel, p0.y);
                ctx.lineTo(p1xRel, p1.y);

                var angle = Phaser.Math.angleBetween(p0xRel, p0.y, p1xRel, p1.y);
                var cos = Math.cos(angle);
                var sin = Math.sin(angle);

                // TODO: 解决不连续
                var iy = tubeWidth * cos;
                var ix = -tubeWidth * sin;
                // 下边缘
                ctx.moveTo(p0xRel + ix, p0.y + iy);
                ctx.lineTo(p1xRel + ix, p1.y + iy);

                p0 = {x: p1.x, y: p1.y};
            }

            ctx.stroke();
            ctx.closePath();

            edgePoints[i] = points;
            edges.push(edgeGroup);
        }

        if (this.nextExtremumIndex !== i) {
            this.nextExtremumIndex = i;
        }
    };

    /**
     * 更新电流颜色
     *
     * @private
     */
    proto.updateCurrentColor = function () {
        var power = this.level.power;
        var POWER_STATUS = power.STATUS;

        switch (power.status) {
            case POWER_STATUS.STABLE:
            case POWER_STATUS.LOSING:
                this.currentColor = color.get('electric');
                break;

            case POWER_STATUS.NORMAL_CHARGE:
                this.currentColor = color.get('green');
                break;

            case POWER_STATUS.SUPER_CHARGE:
                this.currentColor = color.get('yellow');
                break;
        }
    };

    /**
     * 渲染电流
     *
     * @private
     */
    proto.renderCurrents = function () {
        var game = this.game;
        var extremums = this.extremums;
        var edgePoints = this.edgePoints;
        var level = this.level;
        var zoom = level.zoom;
        var power = level.power;
        var currents = this.currents;

        // 在透明度 0.5 至 1 内往复
        if (this.cAlpha >= 1) {
            this.cAlphaDeltaSign = -1;
        }
        else if (this.cAlpha <= 0.5) {
            this.cAlphaDeltaSign = 1;
        }
        this.cAlpha += this.cAlphaDeltaSign * 0.02;

        // 绘制电流
        for (var extInd = this.prevExtremumIndex; extInd < this.nextExtremumIndex; ++extInd) {
            var pointA = extremums[extInd];
            // 电流反映电量
            if (pointA.x > game.camera.x / zoom.scale.x + power.value) {
                break;
            }

            var pointB = extremums[extInd + 1];

            var sprite = currents[extInd];
            if (!sprite) {
                var bitmap = game.add.bitmapData(pointB.x - pointA.x, game.world.height);
                sprite = game.add.sprite(pointA.x, 0, bitmap);
                sprite.terrainType = 'current'; // for test
                currents[extInd] = sprite;
                zoom.add(sprite); // 贴图加入变焦器
            }
            this.drawCurrents(sprite, edgePoints[extInd]);
        }
    };

    /**
     * 渲染电流
     *
     * @private
     * @param {Phaser.Sprite} sprite 精灵图
     * @param {Array.<Object>} points 点集
     */
    proto.drawCurrents = function (sprite, points) {
        var game = this.game;
        var currentWidth = 6;
        var bitmap = sprite.key;
        var ctx = bitmap.ctx;
        var level = this.level;
        var zoom = level.zoom;
        var power = level.power;

        sprite.alpha = this.cAlpha;

        bitmap.clear();

        ctx.beginPath();
        ctx.lineWidth = currentWidth;
        ctx.lineCap = 'round';
        ctx.strokeStyle = this.currentColor;

        for (var pointInd = 1, len = points.length; pointInd < len; ++pointInd) {
            var p1 = points[pointInd];
            if (p1.x > game.camera.x / zoom.scale.x + power.value) {
                break;
            }
            var p0 = points[pointInd - 1];

            var angle = Phaser.Math.angleBetween(p0.x, p0.y, p1.x, p1.y);
            var cos = Math.cos(angle);
            var sin = Math.sin(angle);

            var ix = -(currentWidth) * sin;
            var iy = (currentWidth) * cos;
            ctx.moveTo(p0.x + ix - sprite.x, p0.y + iy);
            ctx.lineTo(p1.x + ix - sprite.x, p1.y + iy);
        }

        ctx.stroke();
        ctx.closePath();
    };

    /**
     * 更新 logo
     *
     * @private
     */
    proto.updateLogos = function () {
        var extremums = this.extremums;
        var logos = this.logos;

        for (var extInd = this.prevExtremumIndex; extInd <= this.nextExtremumIndex; ++extInd) {
            var ext = extremums[extInd];

            if (typeof logos[extInd] !== 'undefined') {
                continue;
            }

            // 3 个极值点以后, 每 10 个点出现一次 logo
            // 并且最末点不出现
            if ((extInd - 3) % 10 === 0 && extInd !== NUM_EXTREMUM - 1) {
                this.addLogo(extInd, ext);
            }
        }
    };

    /**
     * 添加 logo
     *
     * @private
     * @param {number} extInd 极值点索引
     * @param {Object} ext 极值点
     */
    proto.addLogo = function (extInd, ext) {
        var game = this.game;

        var sprite = game.add.image(ext.x, this.game.world.height - 30, 'baidu');
        sprite.anchor.set(0.5, 1);
        sprite.scale.set(0.7);
        this.logos[extInd] = sprite;
        this.level.zoom.add(sprite);
    };

    /**
     * 取得终点位置
     *
     * @public
     * @return {Object} 终点位置
     */
    proto.getTerminal = function () {
        var lastPoint = this.extremums[NUM_EXTREMUM - 1];

        return {
            x: lastPoint.x - 300,
            y: lastPoint.y
        };
    };

    /**
     * 取得最近坠落点
     *
     * @public
     * @param {Hero} hero 主角
     * @return {?Object} 最近坠落点位置
     */
    proto.getNearestPoint = function (hero) {
        var edgePoints = this.edgePoints;
        var heroX = hero.body.x;

        for (var extInd = this.prevExtremumIndex; extInd <= this.nextExtremumIndex; ++extInd) {
            var points = edgePoints[extInd];
            for (var pointInd = 0, pointsLen = points.length - 1; pointInd <= pointsLen; ++pointInd) {
                var point = points[pointInd];
                var distanceX = point.x - heroX;
                if (distanceX >= 0 && distanceX < 10) {
                    return util.extend({}, point);
                }
            }
        }

        return null;
    };

    return Terrain;

});
