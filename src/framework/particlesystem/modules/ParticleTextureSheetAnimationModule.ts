/**
@license
Copyright (c) 2022 meta4d.me Authors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */
namespace m4m.framework
{

    /**
     * 粒子系统纹理表动画模块。
     * 
     * @author feng3d
     */
    export class ParticleTextureSheetAnimationModule extends ParticleModule
    {
        /**
         * Defines the tiling of the texture.
         * 
         * 定义纹理的平铺。
         */

        tiles = new math.vector2(1, 1);

        /**
         * Specifies the animation type.
         * 
         * 指定动画类型。
         */

        animation = ParticleSystemAnimationType.WholeSheet;

        /**
         * Curve to control which frame of the texture sheet animation to play.
         * 
         * 曲线控制哪个帧的纹理表动画播放。
         */

        frameOverTime = serialization.setValue(new MinMaxCurve(), { mode: MinMaxCurveMode.Curve, curveMin: { keys: [{ time: 0, value: 0, inTangent: 1, outTangent: 1 }, { time: 1, value: 1, inTangent: 1, outTangent: 1 }] } });

        /**
         * Use a random row of the texture sheet for each particle emitted.
         * 
         * 对每个发射的粒子使用纹理表的随机行。
         */

        useRandomRow = true;

        /**
         * Explicitly select which row of the texture sheet is used, when useRandomRow is set to false.
         * 
         * 当useRandomRow设置为false时，显式选择使用纹理表的哪一行。
         */

        get rowIndex() { return this._rowIndex; }
        set rowIndex(v)
        {
            this._rowIndex = math.floatClamp(v, 0, this.tiles.y - 1);
        }
        private _rowIndex = 0;

        /**
         * Define a random starting frame for the texture sheet animation.
         * 
         * 为纹理表动画定义一个随机的起始帧。
         */

        startFrame = new MinMaxCurve();

        /**
         * Specifies how many times the animation will loop during the lifetime of the particle.
         * 
         * 指定在粒子的生命周期内动画将循环多少次。
         */

        cycleCount = 1;

        /**
         * Flip the UV coordinate on particles, causing them to appear mirrored.
         * 
         * 在粒子上翻转UV坐标，使它们呈现镜像翻转。
         */

        flipUV = new math.vector2();

        /**
         * Choose which UV channels will receive texture animation.
         * 
         * 选择哪个UV通道将接收纹理动画。
         * 
         * todo 目前引擎中只有一套UV
         */

        uvChannelMask = UVChannelFlags.Everything;

        /**
         * Flip the U coordinate on particles, causing them to appear mirrored horizontally.
         * 
         * 在粒子上翻转U坐标，使它们呈现水平镜像。
         */
        get flipU()
        {
            return this.flipUV.x;
        }

        set flipU(v)
        {
            this.flipUV.x = v;
        }

        /**
         * Flip the V coordinate on particles, causing them to appear mirrored vertically.
         * 
         * 在粒子上翻转V坐标，使它们垂直镜像。
         */
        get flipV()
        {
            return this.flipUV.y;
        }

        set flipV(v)
        {
            this.flipUV.y = v;
        }

        /**
         * Frame over time mutiplier.
         * 
         * 帧随时间变化的乘数。
         */
        get frameOverTimeMultiplier()
        {
            return this.frameOverTime.curveMultiplier;
        }

        set frameOverTimeMultiplier(v)
        {
            this.frameOverTime.curveMultiplier = v;
        }

        /**
         * Defines the tiling of the texture in the X axis.
         * 
         * 定义纹理在X轴上的平铺。
         */
        get numTilesX()
        {
            return this.tiles.x;
        }

        set numTilesX(v)
        {
            this.tiles.x = v;
        }

        /**
         * Defines the tiling of the texture in the Y axis.
         * 
         * 定义纹理在Y轴上的平铺。
         */
        get numTilesY()
        {
            return this.tiles.y;
        }

        set numTilesY(v)
        {
            this.tiles.y = v;
        }

        /**
         * Starting frame multiplier.
         * 
         * 起始帧乘数。
         */
        get startFrameMultiplier()
        {
            return this.startFrame.curveMultiplier;
        }

        set startFrameMultiplier(v)
        {
            this.startFrame.curveMultiplier = v;
        }

        /**
         * 初始化粒子状态
         * @param particle 粒子
         */
        initParticleState(particle: Particle1)
        {
            particle[_TextureSheetAnimation_frameOverTime] = Math.random();
            particle[_TextureSheetAnimation_startFrame] = Math.random();
            particle[_TextureSheetAnimation_randomRow] = Math.random();
        }

        /**
         * 更新粒子状态
         * @param particle 粒子
         */
        updateParticleState(particle: Particle1)
        {
            math.vec4Set(particle.tilingOffset, 1, 1, 0, 0);
            particle.flipUV.x = 0;
            particle.flipUV.y = 0;
            if (!this.enabled) return;

            var segmentsX = this.tiles.x;
            var segmentsY = this.tiles.y;
            var step = new math.vector2(1 / segmentsX, 1 / segmentsY);
            var uvPos = new math.vector2();
            var frameOverTime = this.frameOverTime.getValue(particle.rateAtLifeTime, particle[_TextureSheetAnimation_frameOverTime]);
            var frameIndex = this.startFrame.getValue(particle.rateAtLifeTime, particle[_TextureSheetAnimation_startFrame]);
            var rowIndex = this.rowIndex;
            var cycleCount = this.cycleCount;

            if (this.animation == ParticleSystemAnimationType.WholeSheet)
            {
                frameIndex = Math.round(frameIndex + frameOverTime * segmentsX * segmentsY * cycleCount);
                uvPos.x = (frameIndex % segmentsX) * step.x;
                uvPos.y = (Math.floor(frameIndex / segmentsX) % segmentsY) * step.y;
            } else if (this.animation == ParticleSystemAnimationType.SingleRow)
            {
                frameIndex = Math.round(frameIndex + frameOverTime * segmentsX * cycleCount);
                if (this.useRandomRow)
                {
                    rowIndex = Math.round(segmentsY * particle[_TextureSheetAnimation_randomRow]);
                }
                uvPos.x = (frameIndex % segmentsX) * step.x;
                uvPos.x = rowIndex * step.y;
            }

            math.vec4Set(particle.tilingOffset, step.x, step.y, uvPos.x, uvPos.y);
            particle.flipUV = this.flipUV;
        }

    }

    var _TextureSheetAnimation_frameOverTime = "_TextureSheetAnimation_rateAtLifeTime";
    var _TextureSheetAnimation_startFrame = "_TextureSheetAnimation_startFrame";
    var _TextureSheetAnimation_randomRow = "_TextureSheetAnimation_randomRow";
}