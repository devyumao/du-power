/**
 * @file 地面
 * @author yumao [zhangyu38@baidu.com]
 */

define(function (require) {

    var NUM_EXTREMUM = 500;

    /**
     * 地面类
     *
     * @class
     * @param {Phaser.Game} game 游戏
     */
    function Terrain(game) {
        /**
         * 游戏
         *
         * @type {Phaser.Game}
         */
        this.game = game;

        this.extremums = [];

        this.body = null;

        this.edges = []; // FIX: 重命名为曲线

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
    };

    proto.clearPrevEdges = function () {
        var game = this.game;
        var body = this.body;
        var extremums = this.extremums;
        var edges = this.edges;
        var spriteGroup = this.spriteGroup;
        var boundsLeft = game.camera.x - 400;
        var removeEdge = function (edge) {
            body.removeFixture(edge);
        };

        for (var prevI = this.nextExtremumIndex; prevI > this.prevExtremumIndex; --prevI) {
            if (extremums[prevI].x < boundsLeft) {
                edges[prevI].forEach(removeEdge);
                edges[prevI] = null;

                var sprite = spriteGroup.getAt(prevI);
                sprite.key.destroy(); // FIX: destroy sprite
                // if (prevI > 0) {
                //     spriteGroup.addAt(spriteGroup.getAt(0), prevI);
                //     sprite.destroy();
                // }

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
        var spriteGroup = this.spriteGroup;
        var boundsRight = game.camera.x + 2000;

        for (var i = this.nextExtremumIndex; i < NUM_EXTREMUM - 1; ++i) {
            var pointA = extremums[i];
            if (pointA.x > boundsRight) {
                break;
            }

            var pointB = extremums[i + 1];

            var segmentWidth = 10;
            var segmentCount = Math.floor((pointB.x - pointA.x) / segmentWidth);
            var dx = (pointB.x - pointA.x) / segmentCount;
            var da = Math.PI / segmentCount;
            var ymid = (pointA.y + pointB.y) / 2;
            var ampl = (pointA.y - pointB.y) / 2;

            var p0 = Phaser.Utils.extend(pointA);
            var edgeGroup = [];

            var bitmap = game.add.bitmapData(pointB.x - pointA.x, game.world.height);
            var sprite = game.add.sprite(pointA.x, 0, bitmap);
            spriteGroup.addAt(sprite, i);

            for (var j = 0; j < segmentCount + 1; ++j) {
                var p1 = {
                    x: pointA.x + j * dx,
                    y: ymid + ampl * Math.cos(da * j)
                };

                edgeGroup.push(body.addEdge(p0.x, p0.y, p1.x, p1.y));

                bitmap.line(
                    p0.x - sprite.x, p0.y,
                    p1.x - sprite.x, p1.y,
                    '#fff', 4
                );

                p0 = Phaser.Utils.extend(p1);
            }

            edges.push(edgeGroup);
        }

        if (this.nextExtremumIndex !== i) {
            this.nextExtremumIndex = i;
        }
    };

    return Terrain;

});
