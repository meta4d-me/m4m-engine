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
    export class Particle_new
    {
        public gameObject: gameObject;
        private emisson:EffectElementEmission;
        private batcher: EmissionBatcher_new;

        private startScale: math.vector3 = new m4m.math.vector3();
        public startRotation: m4m.math.quaternion = new m4m.math.quaternion();
        public rotationByShape: math.quaternion = new math.quaternion();
        public Starteuler: math.vector3;
        public rotAngle:number=0;
        public eulerSpeed:number;
        public rotationByEuler: math.quaternion = new math.quaternion();

        public localMatrix: math.matrix = new math.matrix();

        public localTranslate: math.vector3=new math.vector3();
        public localRotation: math.quaternion = new math.quaternion();
        public localScale: math.vector3=new math.vector3(1,1,1);
        public startColor:math.color;
        public color: math.vector3=new math.vector3(1,1,1);
        public alpha: number;
        public tex_ST:math.vector4=new m4m.math.vector4(1,1,0,0);

        private totalLife:number;//总生命
        private curLife: number=0;//当前经过的生命周期
        private life:number=0;//(0---1)
        private speedDir: m4m.math.vector3 = new m4m.math.vector3(0, 0, 0);
        private movespeed:m4m.math.vector3;
        private simulationSpeed: number;

        public sourceVbo: Float32Array;
        public vertexStartIndex: number;
        public dataForVbo: Float32Array; //自己维护一个顶点数据的数组
        public dataForEbo: Uint16Array;

        //在emission是在simulate in world space 时候,将发射器的这个矩阵保存起来,为静态的
        //在emission是在simulate in local space 时候，为动态的
        private emissionMatToWorld:m4m.math.matrix;
        private emissionWorldRotation:m4m.math.quaternion;

        private sizeNodes:NumberKey[];
        private colorNodes:Vector3Key[];
        private alphaNodes:NumberKey[];
        /**
         * 根据发射器定义 初始化
         * @param batcher 发射器合批
         */
        constructor(batcher: EmissionBatcher_new)//, _data: EmissionNew, startIndex: number, format: number
        {
            this.batcher = batcher;
            this.emisson=batcher.emission;
            this.gameObject = this.emisson.gameObject;
            this.vertexStartIndex = batcher.curVerCount;

            this.dataForVbo=this.emisson.cloneMeshVBO();
            this.dataForEbo=this.emisson.cloneMeshEBO();
            this.sourceVbo = this.emisson.vbo;

            this.initByData();
            //计算得出初始vbo ebo
        }

        /**
         * 更新数据
         * @param array 数据
         */
        public uploadData(array: Float32Array)
        {
            array.set(this.dataForVbo, this.vertexStartIndex * this.emisson.vertexSize);
        }
        /**
         * 初始化数据
         */
        initByData()
        {
            this.totalLife=this.emisson.lifeTime.getValue();
            //--------------location speed
            effTools.getRandomDirAndPosByZEmission(this.emisson,this.speedDir,this.localTranslate);
            this.simulationSpeed=this.emisson.simulationSpeed.getValue();
            //--------------rotation
            this.Starteuler=this.emisson.startEuler.getValue();
            m4m.math.quatFromEulerAngles(this.Starteuler.x, this.Starteuler.y, this.Starteuler.z, this.rotationByEuler);
            //--------------scale
            this.localScale=this.emisson.startScale.getValue();
            //--------------color
            this.startColor=this.emisson.startColor;

            //-------------------------------------------------可选类型----------------------
            this.sizeNodes=this.emisson.sizeNodes;
            this.colorNodes=this.emisson.colorNodes;
            this.alphaNodes=this.emisson.alphaNodes;

            if(this.emisson.enableVelocityOverLifetime)
            {
                this.movespeed=this.emisson.moveSpeed.getValue();
            }
            if(this.emisson.enableRotOverLifeTime)
            {
                this.eulerSpeed=this.emisson.angleSpeed.getValue();
            }


            if(this.emisson.rendermodel==RenderModel.StretchedBillBoard)
            {
                let localOrgin = m4m.math.pool.vector3_zero;
                m4m.math.quatLookat(localOrgin, this.speedDir, this.rotationByShape);
                let initRot = m4m.math.pool.new_quaternion();
                m4m.math.quatFromEulerAngles(90, 0, 90, initRot);
                m4m.math.quatMultiply(this.rotationByShape, initRot, this.rotationByShape);
                m4m.math.quatClone(this.rotationByShape,this.localRotation);
                m4m.math.pool.delete_quaternion(initRot);   
            }
            if(!this.emisson.simulateInLocalSpace)
            {
                this.emissionMatToWorld=new m4m.math.matrix();
                var mat=this.emisson.getmatrixToWorld();
                m4m.math.matrixClone(mat,this.emissionMatToWorld);
                this.emissionWorldRotation=new m4m.math.quaternion();
                var quat=this.emisson.getWorldRotation();
                m4m.math.quatClone(quat,this.emissionWorldRotation);
            }
        }
        actived:boolean=true;
        /**
         * 更新
         * @param delta 
         */
        update(delta: number)
        {
            if(!this.actived) return;
            this.curLife += delta;
            this.life=this.curLife/this.totalLife;
            math.floatClamp(this.life,0,1);
            if (this.curLife >= this.totalLife)
            {
                //矩阵置零
                m4m.math.matrixZero(this.transformVertex);
                this._updateVBO();
                this.emisson.deadParticles.push(this);
                this.curLife=0;
                this.actived=false;
                return;
            }
            this._updatePos(delta);
            this._updateScale(delta);
            this._updateEuler(delta);
            this._updateRotation(delta);
            this._updateLocalMatrix(delta);
            this._updateColor(delta);
            this._updateUV(delta);
            this._updateVBO();
        }
        /**
         * 在emission是在simulate in local space 时候，为matTobathcer
         * 在emission是在simulate in world space 时候，为matToWorld
         */
        private transformVertex:m4m.math.matrix=new m4m.math.matrix();
        /**
         * 更新本地矩阵
         * @param delta 
         */
        private _updateLocalMatrix(delta: number)
        {
            m4m.math.matrixMakeTransformRTS(this.localTranslate, this.localScale, this.localRotation, this.localMatrix);
            if(this.emisson.simulateInLocalSpace)
            {
                m4m.math.matrixMultiply(this.emisson.matToObj,this.localMatrix,this.transformVertex);
            }
            else
            {
                m4m.math.matrixMultiply(this.emissionMatToWorld,this.localMatrix,this.transformVertex);
            }
        }

        private matToworld:m4m.math.matrix=new m4m.math.matrix();
        /**
         * 刷新粒子发射数据
         */
        private refreshEmissionData()
        {
            if(this.emisson.simulateInLocalSpace)
            {
                this.emissionMatToWorld=this.emisson.getmatrixToWorld();
                this.emissionWorldRotation=this.emisson.getWorldRotation();
            }
        }
        /**
         * 更新旋转
         * @param delta 
         */
        private _updateRotation(delta: number)
        {
            if(this.emisson.rendermodel==RenderModel.Mesh)
            {
                m4m.math.quatFromAxisAngle(m4m.math.pool.vector3_up,this.rotAngle,this.rotationByEuler);
                m4m.math.quatClone(this.rotationByEuler,this.localRotation);
            }else
            {
                m4m.math.quatFromAxisAngle(m4m.math.pool.vector3_forward,this.rotAngle,this.rotationByEuler);
                this.refreshEmissionData();
                let translation = m4m.math.pool.new_vector3();
                let worldTranslation = m4m.math.pool.new_vector3();
                let worldRotation = m4m.math.pool.new_quaternion();
                let invTransformRotation = m4m.math.pool.new_quaternion();

                m4m.math.vec3Clone(this.localTranslate, translation);

                var cam=this.emisson.renderCamera;
                var camPosInWorld=cam.gameObject.transform.getWorldTranslate();

                m4m.math.matrixTransformVector3(translation, this.emissionMatToWorld, worldTranslation);
                if (this.emisson.rendermodel == RenderModel.BillBoard)
                {
                    m4m.math.quatLookat(worldTranslation, camPosInWorld, worldRotation);
                }
                else if (this.emisson.rendermodel == RenderModel.HorizontalBillBoard)
                {
                    worldRotation.x = -0.5;
                    worldRotation.y = 0.5;
                    worldRotation.z = 0.5;
                    worldRotation.w = 0.5;
                }
                else if (this.emisson.rendermodel == RenderModel.VerticalBillBoard)
                {
                    let forwardTarget = m4m.math.pool.new_vector3();
                    m4m.math.vec3Clone(camPosInWorld, forwardTarget);
                    forwardTarget.y = worldTranslation.y;
                    m4m.math.quatLookat(worldTranslation, forwardTarget, worldRotation);
                    m4m.math.pool.delete_vector3(forwardTarget);

                }
                else if (this.emisson.rendermodel == RenderModel.StretchedBillBoard)
                {
                    m4m.math.matrixMakeTransformRTS(this.localTranslate, this.localScale, this.localRotation, this.localMatrix);
                    m4m.math.matrixMultiply(this.emissionMatToWorld,this.localMatrix,this.matToworld);

                    var xaxis=m4m.math.pool.new_vector3();
                    var yaxis=m4m.math.pool.new_vector3();
                    var zaxis=m4m.math.pool.new_vector3();
                    m4m.math.matrixTransformNormal(m4m.math.pool.vector3_right,this.matToworld,xaxis);
                    m4m.math.vec3Normalize(xaxis,xaxis);
                    m4m.math.matrixTransformNormal(m4m.math.pool.vector3_up,this.matToworld,yaxis);
                    m4m.math.vec3Normalize(yaxis,yaxis);
                    m4m.math.matrixTransformNormal(m4m.math.pool.vector3_forward,this.matToworld,zaxis);
                    m4m.math.vec3Normalize(zaxis,zaxis);
                    
                    EffectUtil.lookatbyXAxis(worldTranslation,xaxis,yaxis,zaxis,camPosInWorld,worldRotation);
                    m4m.math.quatMultiply(this.localRotation,worldRotation,this.localRotation);
                    
                    m4m.math.pool.delete_quaternion(worldRotation);
                    m4m.math.pool.delete_vector3(translation);
                    m4m.math.pool.delete_quaternion(invTransformRotation);
                    m4m.math.pool.delete_vector3(xaxis);
                    m4m.math.pool.delete_vector3(yaxis);                    
                    m4m.math.pool.delete_vector3(zaxis);
                    return;
                }
                
                //消除transform组件对粒子本身的影响
                m4m.math.quatClone(this.emissionWorldRotation, invTransformRotation);
                m4m.math.quatInverse(invTransformRotation, invTransformRotation);
                m4m.math.quatMultiply(invTransformRotation, worldRotation, this.localRotation);
                
                m4m.math.quatMultiply(this.localRotation, this.rotationByEuler, this.localRotation);//eulerrot有的不是必要的，todo

                m4m.math.pool.delete_vector3(translation);
                m4m.math.pool.delete_vector3(worldTranslation);
                m4m.math.pool.delete_quaternion(worldRotation);
                m4m.math.pool.delete_quaternion(invTransformRotation);
            }
        }
        /**
         * 更新位置
         * @param delta 
         */
        private _updatePos(delta: number)
        {
            let currentTranslate = EffectUtil.vecMuliNum(this.speedDir, this.simulationSpeed);
            m4m.math.vec3Add(this.localTranslate, currentTranslate, this.localTranslate);
            if(this.emisson.enableVelocityOverLifetime)
            {
                this.localTranslate.x += this.movespeed.x * delta;
                this.localTranslate.y += this.movespeed.y* delta;
                this.localTranslate.z += this.movespeed.z * delta;
            }

        }
        /**
         * 更新欧拉旋转
         * @param delta 
         */
        private _updateEuler(delta: number)
        {
            if(this.emisson.enableRotOverLifeTime)
            {
                this.rotAngle= this.eulerSpeed * this.curLife;
            }
        }
        /**
         * 更新缩放
         * @param delta 
         */
        private _updateScale(delta: number)
        {
            if(this.emisson.enableSizeOverLifetime)
            {
                for (var i = 0; i < this.sizeNodes.length-1; i++)
                {
                    if(this.sizeNodes[i].key<=this.life&&this.sizeNodes[i+1].key>=this.life)
                    {
                        var target=math.numberLerp(this.sizeNodes[i].value,this.sizeNodes[i+1].value,(this.life-this.sizeNodes[i].key)/(this.sizeNodes[i+1].key-this.sizeNodes[i].key));
                        m4m.math.vec3ScaleByNum(this.startScale,target,this.localScale);
                        break;
                    }
                }
            }
        }
        /**
         * 更新颜色
         * @param delta 
         */
        private _updateColor(delta: number)
        {
            if(this.emisson.enableColorOverLifetime)
            {
                if(this.colorNodes!=null)
                {
                    for (var i = 0; i < this.colorNodes.length-1; i++)
                    {
                        if(this.colorNodes[i].key<=this.life&&this.colorNodes[i+1].key>=this.life)
                        {
                            math.vec3SLerp(this.colorNodes[i].value,this.colorNodes[i+1].value,(this.life-this.colorNodes[i].key)/(this.colorNodes[i+1].key-this.colorNodes[i].key),this.color);
                            break;
                        }
                    }
                }
                if(this.alphaNodes!=null)
                {
                    for (var i = 0; i < this.alphaNodes.length-1; i++)
                    {
                        if(this.alphaNodes[i].key<=this.life&&this.alphaNodes[i+1].key>=this.life)
                        {
                            this.alpha=math.numberLerp(this.alphaNodes[i].value,this.alphaNodes[i+1].value,(this.life-this.colorNodes[i].key)/(this.colorNodes[i+1].key-this.colorNodes[i].key));
                            break;
                        }
                    }
                }
            }
        }

        private spriteIndex: number;
        /**
         * 更新UV
         * @param delta 
         */
        private _updateUV(delta: number)
        {
            if(this.emisson.uvType==UVTypeEnum.UVRoll)
            {
                this.tex_ST.z=this.emisson.uSpeed*this.curLife;
                this.tex_ST.w=this.emisson.vSpeed*this.curLife;
            }else if(this.emisson.uvType==UVTypeEnum.UVSprite)
            {
                var spriteindex=Math.floor(this.life*this.emisson.count);
                m4m.math.spriteAnimation(this.emisson.row,this.emisson.column,spriteindex,this.tex_ST);
            }
        }
        /**
         * 更新VBO
         */
        private _updateVBO()
        {
            let vertexSize = this.emisson.vertexSize;

            for (let i = 0; i < this.emisson.perVertexCount; i++)
            {
                {//postion
                    let vertex = m4m.math.pool.new_vector3();
                    vertex.x = this.sourceVbo[i * vertexSize + 0];
                    vertex.y = this.sourceVbo[i * vertexSize + 1];
                    vertex.z = this.sourceVbo[i * vertexSize + 2];

                    m4m.math.matrixTransformVector3(vertex, this.transformVertex, vertex); 

                    this.dataForVbo[i * vertexSize + 0] = vertex.x;
                    this.dataForVbo[i * vertexSize + 1] = vertex.y;
                    this.dataForVbo[i * vertexSize + 2] = vertex.z;
                    m4m.math.pool.delete_vector3(vertex);
                }

                {//color
                    //处理一下颜色，以防灰度值 > 1
                    let r = this.sourceVbo[i * vertexSize + 3]*this.startColor.r;
                    let g = this.sourceVbo[i * vertexSize + 4]*this.startColor.g;
                    let b = this.sourceVbo[i * vertexSize + 5]*this.startColor.b;
                    let a = this.sourceVbo[i * vertexSize + 6]*this.startColor.a;
                    if (this.colorNodes!=null)
                    {
                        r = this.color.x;
                        g = this.color.y;
                        b = this.color.z;
                    }
                    if (this.alphaNodes !=null)
                    {
                        a = this.alpha;
                    }
                    r *= this.emisson.colorRate;
                    g *= this.emisson.colorRate;
                    b *= this.emisson.colorRate;
                    a *= this.emisson.colorRate;
                    r = math.floatClamp(r, 0, 3);
                    g = math.floatClamp(g, 0, 3);
                    b = math.floatClamp(b, 0, 3);
                    a = math.floatClamp(a, 0, 3);
                    this.dataForVbo[i * this.emisson.vertexSize + 3] = r;
                    this.dataForVbo[i * this.emisson.vertexSize + 4] = g;
                    this.dataForVbo[i * this.emisson.vertexSize + 5] = b;
                    this.dataForVbo[i * this.emisson.vertexSize + 6] = a;
                }
                {
                    //uv
                    this.dataForVbo[i * vertexSize + 7] = this.sourceVbo[i * vertexSize + 7] *this.tex_ST.x + this.tex_ST.z;
                    this.dataForVbo[i * vertexSize + 8] = this.sourceVbo[i * vertexSize + 8] * this.tex_ST.y + this.tex_ST.w;
                }
            }
        }
        /** 销毁 */
        dispose()
        {
            this.dataForVbo = null;
            this.dataForEbo = null;
            this.startRotation = null;
            this.localRotation = null;
            this.rotationByEuler = null;
            this.rotationByShape = null;
            this.tex_ST = null;
            this.localMatrix = null;
            this.localTranslate = null;
            this.Starteuler = null;
            this.localScale = null;
            this.color = null;

        }
    }
}