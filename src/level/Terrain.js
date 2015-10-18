/**
 * @file 地面
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var color = require('common/color');
    var util = require('common/util');

    var NUM_EXTREMUM = 20; // 偶数为佳
    var SEGMENT_WIDTH = 10;
    var SPRITE_INDEX = {
        tube: 0,
        current: 1,
        logo: 2
    };

    /**
     * 地面类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     * @param {Object} options 参数项
     */
    function Terrain(game, options) {
        /**
         * 游戏
         *
         * @type {Phaser.Game}
         */
        this.game = game;

        this.level = options.level;

        this.extremums = [];

        this.body = null;

        this.edges = []; // FIX: 重命名为曲线

        this.edgePoints = [];

        this.tubes = [];

        this.currents = [];

        this.flag = null;

        this.hasFlag = false;

        this.prevExtremumIndex = 0;
        this.nextExtremumIndex = 0;

        this.currentColor = color.get('electric');

        this.cAlpha = 1;

        this.cAlphaDeltaSign = -1;

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
        // this.initFlag();
    };

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
     * 初始化主体
     *
     * @private
     */
    proto.initBody = function () {
        var game = this.game;

        var body = new Phaser.Physics.Box2D.Body(game, null, 0, 0);
        body.static = true;
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
            {x: 100, y: worldHeight - 160}, // TODO: config
            {x: 320, y: worldHeight - 40},
            {x: 600, y: worldHeight - 200}
        ];

        // extremums[0] = {
        //     x: 0,
        //     y: worldHeight - 240
        // };

        var minDX = 190;
        var minDY = 80;
        var rangeDX = 130;
        var rangeDY = 120;
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
        // TODO: 路程去前
        this.distance = penult.x;

        game.world.width = extremums[NUM_EXTREMUM - 1].x;
        // game.world.setBounds(0, 0, extremums[NUM_EXTREMUM - 1].x, worldHeight);
    };

    proto.update = function () {
        this.updateEdges();
        this.updateCurrents();
        this.updateFlag();
        // this.updateLogos();
    };

    proto.updateFlag = function () {
        if (this.hasFlag) {
            return;
        }

        var game = this.game;
        var boundsLeft = this.getPenult().x - 600;
        if (game.camera.x / this.level.zoom.scale.x > boundsLeft) {
            this.initFlag();
        }
    };

    proto.pauseAnim = function () {
        this.hasFlag && this.flag.pauseAnim();
    };

    proto.resumeAnim = function () {
        this.hasFlag && this.flag.resumeAnim();
    };

    proto.getPenult = function () {
        return this.extremums[NUM_EXTREMUM - 2];
    };

    proto.updateEdges = function () {
        this.clearPrevEdges();
        this.drawNextEdges();
    };

    proto.updateCurrents = function () {
        this.updateCurrentColor();
        this.renderCurrents();
    };

    proto.clearPrevEdges = function () {
        var game = this.game;
        var body = this.body;
        var extremums = this.extremums;
        var edges = this.edges;
        var currents = this.currents;
        var tubes = this.tubes;
        var zoom = this.level.zoom;

        var removeEdge = function (edge) {
            body.removeFixture(edge);
        };

        for (var prevI = this.nextExtremumIndex; prevI > this.prevExtremumIndex; --prevI) {
            var boundsLeft = game.camera.x / zoom.scale.x - 400;
            if (extremums[prevI].x < boundsLeft) {
                edges[prevI].forEach(removeEdge);
                edges[prevI] = null;

                var current = currents[prevI];
                current.key.destroy();
                current.destroy();
                currents[prevI] = null;

                var tube = tubes[prevI];
                tube.key.destroy();
                tube.destroy();
                tube[prevI] = null;

                this.prevExtremumIndex = prevI;

                break;
            }
        }
    };

    proto.drawNextEdges = function () {
        var game = this.game;
        var body = this.body;
        var extremums = this.extremums;
        var edges = this.edges;
        var edgePoints = this.edgePoints;
        var tubeWidth = 12;
        var zoom = this.level.zoom;
        var tubes = this.tubes;

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

            // var p0 = Phaser.Utils.extend(pointA);
            var p0 = {x: pointA.x, y: pointA.y};
            var edgeGroup = [];

            var bitmap = game.add.bitmapData(pointB.x - pointA.x, game.world.height);
            var sprite = game.add.sprite(pointA.x, 0, bitmap);
            sprite.terrainType = 'tube'; // for test
            tubes[i] = sprite;
            zoom.add(sprite);

            var points = [p0];

            var ctx = bitmap.ctx;
            ctx.beginPath();
            // ctx.lineJoin = 'miter';
            ctx.lineCap = 'round';
            ctx.lineWidth = 2;
            ctx.strokeStyle = color.get('electric');

            for (var j = 1; j < segmentCount + 1; ++j) {
                var p1 = {
                    x: pointA.x + j * dx,
                    y: ymid + ampl * Math.cos(da * j)
                };

                points.push(p1);
                edgeGroup.push(body.addEdge(p0.x, p0.y, p1.x, p1.y));

                var p0xRel = p0.x - sprite.x;
                var p1xRel = p1.x - sprite.x;

                ctx.moveTo(p0xRel, p0.y);
                ctx.lineTo(p1xRel, p1.y);

                var angle = Phaser.Math.angleBetween(p0xRel, p0.y, p1xRel, p1.y);
                var cos = Math.cos(angle);
                var sin = Math.sin(angle);

                // TODO: 解决不连续
                var iy = tubeWidth * cos;
                var ix = -tubeWidth * sin;
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

    proto.updateCurrentColor = function () {
        var power = this.level.power;
        var POWER_STATUS = power.STATUS;

        // TODO: 充电闪烁效果
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

    proto.renderCurrents = function () {
        var game = this.game;
        var extremums = this.extremums;
        var edgePoints = this.edgePoints;
        var level = this.level;
        var zoom = level.zoom;
        var power = level.power;
        var currents = this.currents;

        if (this.cAlpha >= 1) {
            this.cAlphaDeltaSign = -1;
        }
        else if (this.cAlpha <= 0.5) {
            this.cAlphaDeltaSign = 1;
        }
        this.cAlpha += this.cAlphaDeltaSign * 0.02;

        for (var extInd = this.prevExtremumIndex; extInd < this.nextExtremumIndex; ++extInd) {
            var pointA = extremums[extInd];
            // if (pointA.x + SEGMENT_WIDTH <= game.camera.x / zoom.scale.x) {
            //     continue;
            // }
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
                zoom.add(sprite);
            }
            this.drawCurrents(sprite, edgePoints[extInd]);
        }
    };

    proto.updateLogos = function () {
        var game = this.game;
        var extremums = this.extremums;
        var spriteGroup = this.spriteGroup;

        for (var extInd = this.prevExtremumIndex; extInd <= this.nextExtremumIndex; ++extInd) {
            if ((extInd === 3 || (extInd % 2 && util.proba(0.25)))
                && extInd !== NUM_EXTREMUM - 1) {

                var childGroup = spriteGroup.getAt(extInd);
                if (childGroup === -1) {
                    break;
                }

                var sprite = childGroup.getAt(SPRITE_INDEX.logo);
                if (sprite === -1) {
                    var ext = extremums[extInd];
                    console.log(ext);
                }
            }
        }
    };

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

    proto.getTerminal = function () {
        var lastPoint = this.extremums[NUM_EXTREMUM - 1];

        return {
            x: lastPoint.x - 300,
            y: lastPoint.y
        };
    };

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
