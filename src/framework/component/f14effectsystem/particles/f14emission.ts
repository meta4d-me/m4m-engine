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
namespace m4m.framework {
    export class F14Emission implements F14Element {
        type: F14TypeEnum;
        layer: F14Layer;
        drawActive: boolean;
        public effect: f14EffectSystem;

        public baseddata: F14EmissionBaseData;
        public currentData: F14EmissionBaseData;
        //-------------------------数据------------------------------------
        public particlelist: F14Particle[] = [];
        public deadParticles: F14Particle[] = [];


        //--------------------------------------------------------
        private frameLife: number = 0;

        private TotalTime: number = 0;
        private newStartDataTime: number = 0;//改变currentdata的时间
        public curTime: number = 0;//减去dely剩下的
        private beover: boolean = false;
        //private bool beBurst = false;
        private numcount: number = 0;

        //--------------------
        localMatrix: math.matrix = new math.matrix();
        private _worldMatrix: math.matrix = new math.matrix();
        private localrot = new math.quaternion();
        private worldRot = new math.quaternion();

        vertexCount: number;
        vertexLength: number;
        dataforvboLen: number;
        dataforebo: Uint16Array;
        posArr: math.vector3[];
        colorArr: math.color[];
        uvArr: math.vector2[];

        private frameGap: number;
        /**
         * F14 发射器
         * @param effect F14特效系统 
         * @param layer F14 层
         */
        constructor(effect: f14EffectSystem, layer: F14Layer) {
            this.type = F14TypeEnum.particlesType;
            this.effect = effect;
            this.layer = layer;
            this.baseddata = layer.data.elementdata as F14EmissionBaseData;
            this.currentData = this.baseddata;

            this.newStartDataTime = this.baseddata.delayTime;

            this.initBycurrentdata();
            if (this.currentData.mesh.data) {
                this.vertexCount = this.currentData.mesh.data.getVertexCount();
                this.posArr = this.currentData.mesh.data.pos;
                this.colorArr = this.currentData.mesh.data.color;
                this.uvArr = this.currentData.mesh.data.uv;
                this.dataforebo = this.currentData.mesh.data.genIndexDataArray() as Uint16Array;
                this.vertexLength = m4m.render.meshData.calcByteSize(this.effect.VF) / 4;
                this.dataforvboLen = this.vertexCount * this.vertexLength;
            } else {
                this.vertexCount = 0;
                this.posArr = [];
                this.colorArr = [];
                this.uvArr = [];
                this.dataforebo = new Uint16Array(0);
            }
        }

        private lastFrame: number = 0;
        /**
         * 执行更新
         * @param deltaTime 上一帧时间 
         * @param frame 
         * @param fps 帧率
         */
        public update(deltaTime: number, frame: number, fps: number) {
            // if(!this.effect.gameObject.transform.inCameraVisible)
            //     return;
            //this.drawActive = true;
            this.TotalTime += deltaTime;
            if (this.frameGap == undefined) {
                this.frameGap = 1/fps;
            }

            this.refreshByFrameData(fps);
            this.updateLife();
            for (let i = 0; i < this.particlelist.length; i++) {
                this.particlelist[i].update(deltaTime);
            }
        }

        /**
         * 刷新
         * @param fps 帧率
         */
        private refreshByFrameData(fps: number) {
            this.frameLife = Math.floor(this.baseddata.duration * fps);
            if (this.frameLife == 0) this.frameLife = 1;
            let frame = Math.floor(this.TotalTime * fps) % this.frameLife;
            //-------------------------------change current basedata------------------------------------------------------------
            if (frame != this.lastFrame && this.layer.frames[frame]) {
                if (frame == this.layer.frameList[0]) {
                    this.currentData = this.baseddata;
                }
                if (this.layer.frames[frame].data.EmissionData != this.currentData) {
                    this.changeCurrentBaseData(this.layer.frames[frame].data.EmissionData);
                }
            }
            this.lastFrame = frame;
        }

        /**
         * 改变当前的基础数据
         * @param data 数据
         */
        public changeCurrentBaseData(data: F14EmissionBaseData) {
            this.currentData = data;
            this.newStartDataTime = this.TotalTime;
            this.numcount = 0;
            this.initBycurrentdata();
        }

        /**
         * 初始化当前数据
         */
        private initBycurrentdata() {
            math.quatFromEulerAngles(this.currentData.rotEuler.x, this.currentData.rotEuler.y, this.currentData.rotEuler.z, this.localrot);
            math.matrixMakeTransformRTS(this.currentData.rotPosition, this.currentData.rotScale, this.localrot, this.localMatrix);
        }

        /**
         * 获取世界变换矩阵
         * @returns 世界变换矩阵
         */
        getWorldMatrix(): math.matrix {
            let mat = this.effect.root.getWorldMatrix();
            math.matrixMultiply(mat, this.localMatrix, this._worldMatrix);
            return this._worldMatrix;
        }

        /**
         * 获取世界旋转
         * @returns 世界旋转四元数
         */
        getWorldRotation(): math.quaternion {
            let rot = this.effect.root.getWorldRotate();
            m4m.math.quatMultiply(rot, this.localrot, this.worldRot);
            return this.worldRot;
        }
        
        /**
         * 更新生存时间
         * @returns 
         */
        private updateLife() {
            if (this.beover) return;
            this.curTime = this.TotalTime - this.baseddata.delayTime;
            if (this.curTime <= 0) return;
            //--------------update in Livelife-------------------
            this.updateEmission();

            if (this.curTime > this.baseddata.duration) {
                if (this.baseddata.beloop) {
                    switch (this.baseddata.loopenum) {
                        case LoopEnum.Restart:
                            this.reInit();
                            break;
                        case LoopEnum.TimeContinue:
                            this.beover = true;
                            break;
                    }
                }
                else {
                    this.beover = true;
                }
            }
        }

        /**
         * 再次初始化
         */
        private reInit() {
            this.currentData = this.baseddata;
            this.newStartDataTime = this.baseddata.delayTime;
            this.beover = false;
            this.TotalTime = 0;
            this.numcount = 0;

            this.currentData.rateOverTime.getValue(true);//重新随机

            if (this.settedAlpha != null) {
                this.currentData.startAlpha = new NumberData(this.baseddata.startAlpha._value * this.settedAlpha);
            }
            // for (let i = 0; i < this.baseddata.bursts.length; i++)
            // {
            //     this.baseddata.bursts[i].burst(false);
            // }
            this.bursts = [];
        }

        private bursts: number[] = [];
        
        /**
         * 更新粒子发射
         */
        private updateEmission() {
            let maxLifeTime = this.baseddata.lifeTime.isRandom
                ? this.baseddata.lifeTime._valueLimitMax
                : this.baseddata.lifeTime._value;
            var needCount = Math.floor(this.currentData.rateOverTime.getValue() * ((this.TotalTime - this.newStartDataTime) % (maxLifeTime + this.frameGap)));

            // var needCount = Math.floor(this.currentData.rateOverTime.getValue() * (this.TotalTime - this.newStartDataTime));

            let realcount = needCount - this.numcount;
            if (realcount > 0) {
                this.addParticle(realcount);
            }
            this.numcount += realcount;

            if (this.baseddata.bursts.length > 0) {
                for (let i = 0; i < this.baseddata.bursts.length; i++) {
                    let index = this.bursts.indexOf(this.baseddata.bursts[i].time);
                    if (index < 0 && this.baseddata.bursts[i].time <= this.TotalTime) {
                        let count = this.baseddata.bursts[i].count.getValue(true);
                        this.baseddata.bursts[i].burst();
                        this.bursts.push(this.baseddata.bursts[i].time);
                        this.addParticle(count);
                    }
                    // if(!this.baseddata.bursts[i].beburst()&&this.baseddata.bursts[i].time<=this.TotalTime)
                    // {
                    //     let count = this.baseddata.bursts[i].count.getValue(true);
                    //     this.baseddata.bursts[i].burst();
                    //     this.addParticle(count);
                    // }
                }
            }
        }

        /**
         * 添加 粒子
         * @param count 粒子数量
         */
        private addParticle(count: number = 1) {
            if (count > 150)
                count = 150;

            for (let i = 0; i < count; i++) {
                if (this.deadParticles.length > 0) {
                    let pp = this.deadParticles.pop();
                    pp.initByEmissionData(this.currentData);
                }
                else {
                    let pp = new F14Particle(this, this.currentData);
                    this.particlelist.push(pp);
                }
            }
        }
        
        /**
         * 重置，例子啥的消失
         */
        reset() {
            this.reInit();
            //----------------
            for (let i = 0; i < this.particlelist.length; i++) {
                if (this.particlelist[i].actived) {
                    this.particlelist[i].actived = false;
                    this.deadParticles.push(this.particlelist[i]);
                }
            }
        }

        /**
         * 改变颜色
         * @param value 颜色
         */
        changeColor(value: math.color) {
            this.currentData.startColor = new Vector3Data(value.r, value.g, value.b);
            this.currentData.startAlpha = new NumberData(value.a);
        }

        private settedAlpha: number;
        /**
         * 改变透明度
         * @param value 透明度
         */
        changeAlpha(value: number) {
            this.currentData.startAlpha = new NumberData(this.baseddata.startAlpha._value * value);
            this.settedAlpha = value;
        }

        /***
         * 当结束一次循环后执行函数
         */
        OnEndOnceLoop() {

        }

        /**
         * 销毁
         */
        dispose() {
            this.effect = null;
            this.baseddata = null;
            this.currentData = null;

            delete this.dataforebo;
            delete this.posArr;
            delete this.colorArr;
            delete this.uvArr;
            delete this.bursts;

            // for (let key in this.particlelist)
            for (var i = 0, len = this.particlelist.length; i < len; ++i)
                this.particlelist[i].dispose();

            // for (let key in this.deadParticles)
            for (var i = 0, len = this.deadParticles.length; i < len; ++i)
                this.deadParticles[i].dispose();

        }
    }

}