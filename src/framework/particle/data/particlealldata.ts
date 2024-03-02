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
     * @private
     */
    export class Emission
    {
        /**
         * 发射器类型
         */
        emissionType: ParticleEmissionType;

        simulateInLocalSpace:boolean=true;

        rootpos:m4m.math.vector3;
        rootRotAngle:m4m.math.vector3;
        rootScale:m4m.math.vector3;

        /**
         * 最大发射粒子数（全类型）
         */
        maxEmissionCount: number;
        /**
         * 发射数量（全类型）
         */
        emissionCount: number;
        /**
         * 发射时间（continue类型时表示持续发射时间，burst时表示延时发射时间）
         */
        time: number;
        /**
         * 位置相关
         * 
         * @type {m4m.math.vector3}
         * @memberof EmissionNew
         */

        /**
         * 沿着本地坐标轴不同方向的速度
         * 
         * @type {number}
         * @memberof EmissionNew
         */
        moveSpeed: ParticleNode;
        /**
         * 重力
         * 
         * @type {number}
         * @memberof EmissionNew
         */
        gravity: number;

        /**
         * 旋转相关
         * 
         * @type {ParticleNode}
         * @memberof EmissionNew
         */
        euler: ParticleNode;
        eulerNodes: Array<ParticleNode>;
        eulerSpeed: ParticleNode;

        /**
         * 缩放相关
         * 
         * @type {ParticleNode}
         * @memberof EmissionNew
         */
        scale: ParticleNode;
        scaleNodes: Array<ParticleNodeNumber>;
        scaleSpeed: ParticleNode;

        /**
         * 颜色相关
         * 
         * @type {ParticleNode}
         * @memberof EmissionNew
         */
        color: ParticleNode;
        colorRate: number;
        colorNodes: Array<ParticleNode>;
        colorSpeed: ParticleNode;
        /**
         * 随机方向上的速度
         * 
         * @type {number}
         * @memberof EmissionNew
         */
        simulationSpeed: ParticleNodeNumber;
        /**
         * 透明度相关
         * 
         * @type {AlphaNode}
         * @memberof EmissionNew
         */
        alpha: ParticleNodeNumber;
        alphaNodes: Array<ParticleNodeNumber>;
        alphaSpeed: ParticleNodeNumber;

        /**
         * uv相关
         * 
         * @type {UVSpeedNode}
         * @memberof EmissionNew
         */
        uv: ParticleNodeVec2;
        uvType: UVTypeEnum;
        uvRoll: UVRoll;
        uvSprite: UVSprite;

        tilling: math.vector2;
        /**
         * 材质相关
         * 
         * @type {EffectMatData}
         * @memberof EmissionNew
         */
        mat: EffectMatData;

        /**
         * 生命周期x
         * 
         * @type {ValueData}
         * @memberof EmissionNew
         */
        life: ValueData;
        renderModel: RenderModel = RenderModel.Mesh;
        mesh: mesh;

        particleStartData: m4m.framework.ParticleStartData = new m4m.framework.ParticleStartData();
        private dataForVbo: Float32Array;
        /**
         * 获取 vbo 数据
         * @param vf 顶点格式数据
         * @returns vbo 数据
         */
        getVboData(vf: number): Float32Array
        {
            if (this.dataForVbo == undefined)
            {
                this.dataForVbo = this.mesh.data.genVertexDataArray(vf);
            }
            return this.dataForVbo;
        }

        /** 克隆 */
        clone()
        {
            let emission = new Emission();
            if (this.emissionType != undefined)
                emission.emissionType = this.emissionType;
            emission.simulateInLocalSpace=this.simulateInLocalSpace;
            if(this.rootpos!=undefined)
            {
                emission.rootpos=m4m.math.pool.clone_vector3(this.rootpos);
            }
            if(this.rootRotAngle!=undefined)
            {
                emission.rootRotAngle=m4m.math.pool.clone_vector3(this.rootRotAngle);
            }
            if(this.rootScale!=undefined)
            {
                emission.rootScale=m4m.math.pool.clone_vector3(this.rootScale);
            }
            if (this.maxEmissionCount != undefined)
                emission.maxEmissionCount = this.maxEmissionCount;
            if (this.emissionCount != undefined)
                emission.emissionCount = this.emissionCount;
            if (this.time != undefined)
                emission.time = this.time;

            if (this.simulationSpeed != undefined)
            {
                emission.simulationSpeed = this.simulationSpeed.clone();
            }
            if (this.moveSpeed != undefined)
                emission.moveSpeed = this.moveSpeed.clone();
            if (this.gravity != undefined)
                emission.gravity = this.gravity;
            if (this.euler != undefined)
                emission.euler = this.euler.clone();
            if (this.eulerNodes != undefined)
                emission.eulerNodes = this.cloneParticleNodeArray(this.eulerNodes);
            if (this.eulerSpeed != undefined)
                emission.eulerSpeed = this.eulerSpeed.clone();
            if (this.scale != undefined)
                emission.scale = this.scale.clone();
            if (this.scaleNodes != undefined)
                emission.scaleNodes = this.cloneParticleNodeNumberArray(this.scaleNodes);
            if (this.scaleSpeed != undefined)
                emission.scaleSpeed = this.scaleSpeed.clone();
            if (this.color != undefined)
                emission.color = this.color.clone();
            if (this.colorRate != undefined)
                emission.colorRate = this.colorRate;
            if (this.colorNodes != undefined)
                emission.colorNodes = this.cloneParticleNodeArray(this.colorNodes);
            if (this.colorSpeed != undefined)
                emission.colorSpeed = this.colorSpeed.clone();
            if (this.simulationSpeed != undefined)
                emission.simulationSpeed = this.simulationSpeed.clone();
            if (this.alpha != undefined)
                emission.alpha = this.alpha.clone();
            if (this.alphaNodes != undefined)
                emission.alphaNodes = this.cloneParticleNodeNumberArray(this.alphaNodes);
            if (this.alphaSpeed != undefined)
                emission.alphaSpeed = this.alphaSpeed.clone();

            if (this.uv != undefined)
                emission.uv = this.uv.clone();
            if (this.uvType != undefined)
                emission.uvType = this.uvType;
            if (this.uvRoll != undefined)
                emission.uvRoll = this.uvRoll.clone();
            if (this.uvSprite != undefined)
                emission.uvSprite = this.uvSprite.clone();

            if (this.mat != undefined)
                emission.mat = this.mat.clone();
            if (this.life != undefined)
                emission.life = this.life.clone();
            if (this.renderModel != undefined)
                emission.renderModel = this.renderModel;
            if (this.mesh != undefined)
                emission.mesh = this.mesh;
            if (this.dataForVbo != undefined)
                emission.dataForVbo = this.dataForVbo;
            if (this.particleStartData != undefined)
                emission.particleStartData = this.particleStartData.clone();
            return emission;
        }
        /**
         * 获取世界旋转
         */
        getworldRotation()
        {
            
        }
        /**
         * 克隆例子节点数组
         * @param _array 例子节点数组
         * @returns 输出克隆
         */
        cloneParticleNodeArray(_array: Array<ParticleNode>)
        {
            let array = new Array<ParticleNode>();
            for (let i in _array)
            {
                array.push(_array[i].clone());
            }
            return array;
        }
        /**
         * 克隆例子节点值数组
         * @param _array 例子节点值数组
         * @returns 输出克隆
         */
        cloneParticleNodeNumberArray(_array: Array<ParticleNodeNumber>)
        {
            let array = new Array<ParticleNodeNumber>();
            for (let i in _array)
            {
                array.push(_array[i].clone());
            }
            return array;
        }
    }

    export class UVSprite
    {
        //uv序列帧动画
        public row: number;
        public column: number;
        public totalCount: number;
        /** 克隆 */
        clone()
        {
            let sprite = new UVSprite();
            sprite.row = this.row;
            sprite.column = this.column;
            sprite.totalCount = this.totalCount;
            return sprite;
        }
    }

    export class UVRoll
    {
        /**
        * uv滚动
        */
        public uvSpeed: UVSpeedNode;
        public uvSpeedNodes: Array<UVSpeedNode>;
        /** 克隆 */
        clone()
        {
            let roll = new UVRoll();
            if (this.uvSpeed != undefined)
                roll.uvSpeed = this.uvSpeed;
            if (this.uvSpeedNodes != undefined)
            {
                let array = new Array<UVSpeedNode>();
                for (let i in this.uvSpeedNodes)
                {
                    array.push(this.uvSpeedNodes[i].clone())
                }
                roll.uvSpeedNodes = array;
            }
            return roll;
        }
    }

    export enum UVTypeEnum
    {
        NONE,
        UVRoll,
        UVSprite
    }
}