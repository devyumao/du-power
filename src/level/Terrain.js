/**
 * @file 地面
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var color = require('common/color');

    var NUM_EXTREMUM = 200;
    var SEGMENT_WIDTH = 10;
    var SPRITE_INDEX = {
        tube: 0,
        current: 1
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

        this.spriteGroup = game.add.group();

        this.prevExtremumIndex = 0;
        this.nextExtremumIndex = 0;

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
        var worldHeight = 720; // FIX: config
        var extremums = this.extremums;

        extremums[0] = {
            x: 0,
            y: worldHeight - 240
        };

        var game = this.game;

        var minDX = 180;
        var minDY = 80;
        var rangeDX = 140;
        var rangeDY = 120;
        var minHeight = 30;
        var maxHeight = 360;

        for (var i = 1; i < NUM_EXTREMUM; ++i) {
            var pointA = extremums[i - 1];

            var bY;
            var sign = i % 2 ? 1 : -1;
            do {
                bY = pointA.y + sign * (minDY + game.rnd.between(0, rangeDY));
            } while (bY > worldHeight - minHeight || bY < worldHeight - maxHeight);

            var pointB = {
                x: pointA.x + minDX + game.rnd.between(0, rangeDX),
                y: bY
            };
            extremums.push(pointB);
        }

        game.world.setBounds(0, 0, extremums[NUM_EXTREMUM - 1].x, worldHeight);
    };

    proto.update = function () {
        this.updateEdges();
    };

    proto.updateEdges = function () {
        this.clearPrevEdges();
        this.drawNextEdges();
        this.renderCurrents();
    };

    proto.clearPrevEdges = function () {
        var game = this.game;
        var body = this.body;
        var extremums = this.extremums;
        var edges = this.edges;
        var spriteGroup = this.spriteGroup;
        var zoom = this.level.zoom;

        var removeEdge = function (edge) {
            body.removeFixture(edge);
        };

        var destroySprite = function (sprite) {
            sprite.key.destroy();
            sprite.destroy();
        };

        for (var prevI = this.nextExtremumIndex; prevI > this.prevExtremumIndex; --prevI) {
            var boundsLeft = game.camera.x / zoom.scale.x - 400;
            if (extremums[prevI].x < boundsLeft) {
                edges[prevI].forEach(removeEdge);
                edges[prevI] = null;

                var childGroup = spriteGroup.getAt(prevI);
                childGroup.forEach(destroySprite);

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
        var spriteGroup = this.spriteGroup;
        var tubeWidth = 14;
        var zoom = this.level.zoom;

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
            var childGroup = game.add.group();
            childGroup.addAt(sprite, SPRITE_INDEX.tube);
            spriteGroup.addAt(childGroup, i);

            var points = [p0];
            // var points = [{x: p0.x - sprite.x, y: p0.y}];
            // var points = [p0];

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

                // points.push({x: p1xRel, y: p1.y});
            }

            ctx.stroke();
            ctx.closePath();

            // this.drawCurrents(sprite, points);

            edgePoints[i] = points;
            edges.push(edgeGroup);
        }

        if (this.nextExtremumIndex !== i) {
            this.nextExtremumIndex = i;
        }
    };

    proto.renderCurrents = function () {
        var game = this.game;
        var extremums = this.extremums;
        var spriteGroup = this.spriteGroup;
        var edgePoints = this.edgePoints;
        var level = this.level;
        var zoom = level.zoom;

        for (var extInd = this.prevExtremumIndex; extInd <= this.nextExtremumIndex; ++extInd) {
            var pointA = extremums[extInd];
            // if (pointA.x + SEGMENT_WIDTH <= game.camera.x / zoom.scale.x) {
            //     continue;
            // }
            if (pointA.x > game.camera.x / zoom.scale.x + level.power) {
                break;
            }

            var pointB = extremums[extInd + 1];

            var childGroup = spriteGroup.getAt(extInd);
            var sprite = childGroup.getAt(SPRITE_INDEX.current);
            if (sprite === -1) {
                var bitmap = game.add.bitmapData(pointB.x - pointA.x, game.world.height);
                sprite = game.add.sprite(pointA.x, 0, bitmap);
                childGroup.addAt(sprite, SPRITE_INDEX.current);
            }
            this.drawCurrents(sprite, edgePoints[extInd]);
        }
    };

    proto.drawCurrents = function (sprite, points) {
        var game = this.game;
        var currentWidth = 8;
        var bitmap = sprite.key;
        var ctx = bitmap.ctx;
        var level = this.level;
        var zoom = level.zoom;

        bitmap.clear();

        ctx.beginPath();
        ctx.lineWidth = currentWidth;
        ctx.lineCap = 'round';
        ctx.strokeStyle = color.get('electric');

        for (var pointInd = 1, len = points.length; pointInd < len; ++pointInd) {
            var p1 = points[pointInd];
            if (p1.x > game.camera.x / zoom.scale.x + level.power) {
                break;
            }
            // if (pointInd === 1) {
            //     bitmap.clear();
            // }
            var p0 = points[pointInd - 1];

            var angle = Phaser.Math.angleBetween(p0.x, p0.y, p1.x, p1.y);
            var cos = Math.cos(angle);
            var sin = Math.sin(angle);

            var ix = -(currentWidth - 1) * sin;
            var iy = (currentWidth - 1) * cos;
            ctx.moveTo(p0.x + ix - sprite.x, p0.y + iy);
            ctx.lineTo(p1.x + ix - sprite.x, p1.y + iy);
        }

        ctx.stroke();
        ctx.closePath();
    };

    return Terrain;

});
