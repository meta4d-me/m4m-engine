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

    //还是要抽象出粒子的概念
    //这里根据发射器定义的初始参数  计算当前要提交的数据
    /**
     * @private
     */
    export class Particle
    {
        private batcher: EmissionBatcher;
        public gameObject: gameObject;
        private emisson:EmissionElement;
        private vf: number;

        public renderModel: RenderModel = RenderModel.Mesh;

        private startScale: math.vector3 = new m4m.math.vector3();
        public startRotation: m4m.math.quaternion = new m4m.math.quaternion();
        public rotationByShape: math.quaternion = new math.quaternion();
        public euler: math.vector3;
        public rotationByEuler: math.quaternion = new math.quaternion();

        public localMatrix: math.matrix = new math.matrix();


        public localTranslate: math.vector3;
        public localRotation: math.quaternion = new math.quaternion();
        public localScale: math.vector3;
        public color: math.vector3;
        public colorRate: number;
        public uv: math.vector2;
        public alpha: number;
        public tilling: math.vector2 = new math.vector2(1, 1);


        private totalLife:number;//总生命
        private curLife: number;//当前经过的生命周期
        private speedDir: m4m.math.vector3 = new m4m.math.vector3(0, 0, 0);
        private movespeed:m4m.math.vector3;
        private simulationSpeed: number;
       // private uvSpriteFrameInternal: number;

        public data: Emission;
        private vertexSize: number;//单个顶点大小
        private vertexCount: number;//顶点数量
        public sourceVbo: Float32Array;
        public vertexStartIndex: number;
        public dataForVbo: Float32Array; //自己维护一个顶点数据的数组
        public dataForEbo: Uint16Array;

        //在emission是在simulate in world space 时候,将发射器的这个矩阵保存起来,为静态的
        //在emission是在simulate in local space 时候，为动态的
        private emissionMatToWorld:m4m.math.matrix;
        private emissionWorldRotation:m4m.math.quaternion;
        /**
         * 根据发射器定义 初始化
         * @param batcher 发射器合批
         */
        constructor(batcher: EmissionBatcher)//, _data: EmissionNew, startIndex: number, format: number
        {
            this.batcher = batcher;
            this.gameObject = batcher.gameObject;
            this.emisson=batcher.emissionElement;
            this.vf = batcher.vf;
            this.data = batcher.data.clone();//--------------------todo
            
            this.vertexSize = m4m.render.meshData.calcByteSize(this.vf) / 4;
            this.vertexStartIndex = batcher.curVerCount;
            this.vertexCount = this.emisson.perVertexCount;

            this.dataForVbo = new Float32Array(this.vertexCount * this.vertexSize);
            this.dataForEbo = this.data.mesh.data.genIndexDataArray() as Uint16Array;
            this.dataForVbo.set(this.data.mesh.data.genVertexDataArray(this.vf), 0);
            this.sourceVbo = this.data.getVboData(this.vf);

            this.initByData();
            //计算得出初始vbo ebo
        }

        /**
         * 更新数据
         * @param array 数据 
         */
        public uploadData(array: Float32Array)
        {
            array.set(this.dataForVbo, this.vertexStartIndex * this.vertexSize);
        }
        /**
         * 初始化
         */
        initByData()
        {
            this.totalLife=this.data.life.getValueRandom();
            this.renderModel=this.data.renderModel;
            this.curLife = 0;

            //box方向随着中心轴朝向
            let localRandomDirection = this.data.particleStartData.randomDirection;
            this.speedDir = m4m.math.pool.clone_vector3(localRandomDirection);

            let localRandomTranslate = this.data.particleStartData.position;
            this.localTranslate=m4m.math.pool.clone_vector3(localRandomTranslate);

            this.simulationSpeed = this.data.simulationSpeed != undefined ? this.data.simulationSpeed.getValue() : 0;

            if (this.data.euler == undefined)
                this.euler = new m4m.math.vector3(0, 0, 0);
            else
                this.euler = this.data.euler.getValueRandom();
            if (this.data.scale == undefined)
                this.localScale = new m4m.math.vector3(1, 1, 1);
            else
                this.localScale = this.data.scale.getValueRandom();
            if (this.data.color == undefined)
                this.color = new m4m.math.vector3(0, 0, 0);
            else
                this.color = this.data.color.getValueRandom();
            if (this.data.alpha == undefined)
                this.alpha = 1;
            else
                this.alpha = this.data.alpha.getValueRandom();
            if (this.data.uv == undefined)
                this.uv = new m4m.math.vector2();
            else
                this.uv = this.data.uv.getValueRandom();

            if(this.data.moveSpeed!=undefined)
            {
                this.movespeed=this.data.moveSpeed.getValue();
            }
            else
            {
                this.movespeed=new m4m.math.vector3();
            }
            if (this.data.colorRate == undefined)
                this.colorRate = this.data.colorRate;
            else
                this.colorRate = 1;
            //记下初始scale
            m4m.math.vec3Clone(this.localScale, this.startScale);

            m4m.math.quatFromEulerAngles(this.euler.x, this.euler.y, this.euler.z, this.rotationByEuler);
            //模型初始旋转量
            if (this.renderModel == RenderModel.None || this.renderModel == RenderModel.StretchedBillBoard)
            {
                if (this.data.particleStartData.shapeType != ParticleSystemShape.NORMAL)
                {
                    let localOrgin = m4m.math.pool.vector3_zero;
                    m4m.math.quatLookat(localOrgin, localRandomDirection, this.rotationByShape);

                    let initRot = m4m.math.pool.new_quaternion();
                    m4m.math.quatFromEulerAngles(90, 0, 90, initRot);
                    m4m.math.quatMultiply(this.rotationByShape, initRot, this.rotationByShape);
                    m4m.math.quatClone(this.rotationByShape,this.localRotation);
                    
                    m4m.math.pool.delete_quaternion(initRot);
                }
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
            this._updateAlpha(delta);
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
                m4m.math.matrixMultiply(this.emisson.matToBatcher,this.localMatrix,this.transformVertex);
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
            this._updateElementRotation();
        }

        /**
         * 更新元素旋转
         */
        private _updateElementRotation()
        {
            if (this.renderModel != RenderModel.Mesh)
            {
                this.refreshEmissionData();

                let translation = m4m.math.pool.new_vector3();
                let worldTranslation = m4m.math.pool.new_vector3();
                let worldRotation = m4m.math.pool.new_quaternion();
                let invTransformRotation = m4m.math.pool.new_quaternion();

                m4m.math.vec3Clone(this.localTranslate, translation);
                //var cam = m4m.framework.sceneMgr.app.getScene().mainCamera;
                //var cam = m4m.framework.sceneMgr.camera;
                var cam=this.batcher.emissionElement.renderCamera;
                if(cam==null)
                {
                    cam = m4m.framework.sceneMgr.app.getScene().mainCamera;
                }
                var camPosInWorld=cam.gameObject.transform.getWorldTranslate();

                m4m.math.matrixTransformVector3(translation, this.emissionMatToWorld, worldTranslation);
                if (this.renderModel == RenderModel.BillBoard)
                {
                    m4m.math.quatLookat(worldTranslation, camPosInWorld, worldRotation);
                }
                else if (this.renderModel == RenderModel.HorizontalBillBoard)
                {
                    worldRotation.x = -0.5;
                    worldRotation.y = 0.5;
                    worldRotation.z = 0.5;
                    worldRotation.w = 0.5;
                }
                else if (this.renderModel == RenderModel.VerticalBillBoard)
                {
                    let forwardTarget = m4m.math.pool.new_vector3();
                    m4m.math.vec3Clone(camPosInWorld, forwardTarget);
                    forwardTarget.y = worldTranslation.y;
                    m4m.math.quatLookat(worldTranslation, forwardTarget, worldRotation);
                    m4m.math.pool.delete_vector3(forwardTarget);

                }
                else if (this.renderModel == RenderModel.StretchedBillBoard)
                {
                    m4m.math.matrixMakeTransformRTS(this.localTranslate, this.localScale, this.localRotation, this.localMatrix);
                    m4m.math.matrixMultiply(this.emissionMatToWorld,this.localMatrix,this.matToworld);
                    //-------------------------------------------------------------------------------
                    // m4m.math.quatClone(this.rotationByShape, this.localRotation);
                    // m4m.math.quatLookat(worldTranslation, camPosInWorld, worldRotation);
                    // let lookRot = new m4m.math.quaternion();
                    // m4m.math.quatClone(this.emisson.getWorldRotation(), invTransformRotation);
                    // m4m.math.quatInverse(invTransformRotation, invTransformRotation);
                    // m4m.math.quatMultiply(invTransformRotation, worldRotation, lookRot);

                    // let inverRot = m4m.math.pool.new_quaternion();
                    // m4m.math.quatInverse(this.localRotation, inverRot);
                    // m4m.math.quatMultiply(inverRot, lookRot, lookRot);

                    // let angle = m4m.math.pool.new_vector3();
                    // m4m.math.quatToEulerAngles(lookRot, angle);
                    // m4m.math.quatFromEulerAngles(0, angle.x, 0, lookRot);
                    // m4m.math.quatMultiply(this.localRotation, lookRot, this.localRotation);
                    //----------------------------------------------------------------------------
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
            } else
            {
                m4m.math.quatClone(this.rotationByEuler,this.localRotation);
            }


        }
        /**
         * 更新位置
         * @param delta 
         */
        private _updatePos(delta: number)
        {

            if (this.data.moveSpeed != undefined)
            {
                this.localTranslate.x += this.movespeed.x * delta;
                this.localTranslate.y += this.movespeed.y* delta;
                this.localTranslate.z += this.movespeed.z * delta;
            }

            let currentTranslate = EffectUtil.vecMuliNum(this.speedDir, this.simulationSpeed);
            m4m.math.vec3Add(this.localTranslate, currentTranslate, this.localTranslate);

        }
        /**
         * 更新欧拉旋转
         * @param delta 
         * @returns 
         */
        private _updateEuler(delta: number)
        {
            let index = 0;
            if (this.data.eulerNodes != undefined && this.data.eulerSpeed != undefined)
            {
                console.error("scale只能通过插值或者speed来修改，不能两个同时存在！");
                return;
            }
            if (this.data.eulerNodes != undefined)
            {
                this._updateNode(this.data.eulerNodes, this.totalLife, this.euler);
                m4m.math.quatFromEulerAngles(this.euler.x, this.euler.y, this.euler.z, this.rotationByEuler);
            } else if (this.data.eulerSpeed != undefined)
            {
                if (this.data.eulerSpeed.x != undefined)
                    this.euler.x += this.data.eulerSpeed.x.getValue() * delta;
                if (this.data.eulerSpeed.y != undefined)
                    this.euler.y += this.data.eulerSpeed.y.getValue() * delta;
                if (this.data.eulerSpeed.z != undefined)
                    this.euler.z += this.data.eulerSpeed.z.getValue() * delta;
                m4m.math.quatFromEulerAngles(this.euler.x, this.euler.y, this.euler.z, this.rotationByEuler);
            }
        }
        private _startNode: ParticleNode;
        private endNode: ParticleNode;
        /**
         * 更新缩放
         * @param delta 
         */
        private _updateScale(delta: number)
        {
            let index = 0;
            if (this.data.scaleNodes != undefined && this.data.scaleSpeed != undefined)
            {
                console.error("scale只能通过插值或者speed来修改，不能两个同时存在！");
                return;
            }
            if (this.data.scaleNodes != undefined)
            {
                this._updateNode(this.data.scaleNodes, this.totalLife, this.localScale, nodeType.scale);
            } else if (this.data.scaleSpeed != undefined)
            {
                if (this.data.scaleSpeed.x != undefined)
                    this.localScale.x += this.data.scaleSpeed.x.getValue() * delta;
                if (this.data.scaleSpeed.y != undefined)
                    this.localScale.y += this.data.scaleSpeed.y.getValue() * delta;
                if (this.data.scaleSpeed.z != undefined)
                    this.localScale.z += this.data.scaleSpeed.z.getValue() * delta;
            }
        }
        /**
         * 更新颜色
         * @param delta 
         */
        private _updateColor(delta: number)
        {
            let index = 0;
            if (this.data.colorNodes != undefined && this.data.colorSpeed != undefined)
            {
                console.error("color只能通过插值或者speed来修改，不能两个同时存在！");
                return;
            }
            if (this.data.colorNodes != undefined)
            {
                this._updateNode(this.data.colorNodes, this.totalLife, this.color);
            } else if (this.data.colorSpeed != undefined)
            {
                if (this.data.colorSpeed.x != undefined)
                    this.color.x += this.data.colorSpeed.x.getValue() * delta;
                if (this.data.colorSpeed.y != undefined)
                    this.color.y += this.data.colorSpeed.y.getValue() * delta;
                if (this.data.colorSpeed.z != undefined)
                    this.color.z += this.data.colorSpeed.z.getValue() * delta;
            }
        }

        private tempStartNode: any;
        private tempEndNode: any;
        /**
         * 更新节点
         * @param nodes 节点列表
         * @param life 生命时长
         * @param out 出书数据
         * @param nodetype 节点类型
         */
        private _updateNode(nodes: any, life: number, out: any, nodetype: nodeType = nodeType.none)
        {
            let index = 0;
            var duration = 0;
            if (nodes != undefined)
            {
                for (var i = 0; i < nodes.length; i++)
                {
                    if (i + 1 < nodes.length)
                    {
                        if (nodes[i].key * life <= this.curLife && nodes[i + 1].key * life >= this.curLife)
                        {
                            this.tempStartNode = nodes[i];
                            this.tempEndNode = nodes[i + 1];
                            index++;
                            duration = (this.tempEndNode.key - this.tempStartNode.key) * life;
                            break;
                        }
                    } else
                    {
                        if (this.curLife < nodes[i].key * life)
                        {
                            this.tempStartNode = nodes[i - 1];
                            this.tempEndNode = nodes[i];
                            duration = (this.tempEndNode.key - this.tempStartNode.key) * life;
                        }
                    }
                }
                if (this.tempStartNode instanceof ParticleNode)
                {
                    if (duration > 0)
                    {
                        m4m.math.vec3SLerp(this.tempStartNode.getValue(), this.tempEndNode.getValue(), (this.curLife - this.tempStartNode.key * life) / duration, out);

                    }
                } else if (this.tempStartNode instanceof ParticleNodeNumber)
                {
                    //目前这里只刷了alpha值，
                    if (duration > 0)
                    {
                        if (nodetype == nodeType.alpha)
                        {
                            this.alpha = m4m.math.numberLerp(this.tempStartNode.getValue(), this.tempEndNode.getValue(), (this.curLife - this.tempStartNode.key * life) / duration);
                        }
                        else if (nodetype = nodeType.scale)
                        {
                            var targetscale = m4m.math.numberLerp(this.tempStartNode.getValue(), this.tempEndNode.getValue(), (this.curLife - this.tempStartNode.key * life) / duration);
                            m4m.math.vec3ScaleByNum(this.startScale, targetscale, out);
                        }
                    }
                } else if (this.tempStartNode instanceof UVSpeedNode)
                {
                    if (duration > 0)
                    {
                        m4m.math.vec2SLerp(this.tempStartNode.getValue(), this.tempEndNode.getValue(), (this.curLife - this.tempStartNode.key * life) / duration, out);
                    }
                }

            }

        }

        private _startNodeNum: ParticleNodeNumber;
        private _curNodeNum: ParticleNodeNumber;
        /**
         * 更新 半透值
         * @param delta 
         */
        private _updateAlpha(delta: number)
        {
            let index = 0;
            if (this.data.alphaNodes != undefined && this.data.alphaSpeed != undefined)
            {
                console.error("color只能通过插值或者speed来修改，不能两个同时存在！");
                return;
            }
            if (this.data.alphaNodes != undefined)
            {
                this._updateNode(this.data.alphaNodes, this.totalLife, this.alpha, nodeType.alpha);
            } else if (this.data.alphaSpeed != undefined)
            {
                this.alpha += this.data.alphaSpeed.getValue() * delta;
            }
        }
        private _startUVSpeedNode: UVSpeedNode;
        private _curUVSpeedNode: UVSpeedNode;
        private spriteIndex: number;
        /**
         * 更新UV
         * @param delta 
         */
        private _updateUV(delta: number)
        {
            if (this.uv == undefined)
                this.uv = new m4m.math.vector2();
            if (this.data.uvType == UVTypeEnum.NONE)
            {
                this.uv = this.data.uv.getValue();
            } else if (this.data.uvType == UVTypeEnum.UVRoll)
            {
                if (this.data.uvRoll != undefined)
                {
                    if (this.data.uvRoll.uvSpeedNodes != undefined && this.data.uvRoll.uvSpeed != undefined)
                    {
                        console.error("uv只能通过插值或者speed来修改，不能两个同时存在！");
                        return;
                    }
                    let index = 0;
                    if (this.data.uvRoll.uvSpeedNodes != undefined)
                    {
                        this._updateNode(this.data.uvRoll.uvSpeedNodes, this.totalLife, this.uv);
                    } else if (this.data.uvRoll.uvSpeed != undefined)
                    {
                        if (this.data.uvRoll.uvSpeed.u != undefined)
                            this.tex_ST.z += this.data.uvRoll.uvSpeed.u.getValue() * delta;
                        if (this.data.uvRoll.uvSpeed.v != undefined)
                            this.tex_ST.w += this.data.uvRoll.uvSpeed.v.getValue() * delta;
                    }
                }
            } else if (this.data.uvType == UVTypeEnum.UVSprite)
            {
                if (this.data.uvSprite != undefined)
                {

                    var spriteindex=Math.floor(this.curLife/this.totalLife*this.data.uvSprite.totalCount);

                    m4m.math.spriteAnimation(this.data.uvSprite.row,this.data.uvSprite.column,spriteindex,this.tex_ST);
                }
            }

        }
        private tex_ST:m4m.math.vector4=new m4m.math.vector4(1,1,0,0);
        /**
         * 更新VBO
         */
        private _updateVBO()
        {
            let vertexSize = this.vertexSize;

            for (let i = 0; i < this.vertexCount; i++)
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
                    let r = math.floatClamp(this.sourceVbo[i * vertexSize + 3], 0, 1);
                    let g = math.floatClamp(this.sourceVbo[i * vertexSize + 4], 0, 1);
                    let b = math.floatClamp(this.sourceVbo[i * vertexSize + 5], 0, 1);
                    let a = math.floatClamp(this.sourceVbo[i * vertexSize + 6], 0, 1);
                    if (this.color != undefined)
                    {
                        r = this.color.x;
                        g = this.color.y;
                        b = this.color.z;
                    }
                    if (this.alpha != undefined)
                        a = this.alpha;
                    if (this.colorRate != undefined)
                    {
                        r *= this.colorRate;
                        g *= this.colorRate;
                        b *= this.colorRate;
                        a *= this.colorRate;
                    }
                    r = math.floatClamp(r, 0, 3);
                    g = math.floatClamp(g, 0, 3);
                    b = math.floatClamp(b, 0, 3);
                    a = math.floatClamp(a, 0, 3);
                    this.dataForVbo[i * this.vertexSize + 3] = r;
                    this.dataForVbo[i * this.vertexSize + 4] = g;
                    this.dataForVbo[i * this.vertexSize + 5] = b;
                    this.dataForVbo[i * this.vertexSize + 6] = a;
                }
                {
                    //uv
                    this.dataForVbo[i * vertexSize + 7] = this.sourceVbo[i * vertexSize + 7] *this.tex_ST.x + this.tex_ST.z;
                    this.dataForVbo[i * vertexSize + 8] = this.sourceVbo[i * vertexSize + 8] * this.tex_ST.y + this.tex_ST.w;
                }
            }
        }
        /**
         * 销毁
         */
        dispose()
        {
            this.dataForVbo = null;
            this.dataForEbo = null;
            this.startRotation = null;
            this.localRotation = null;
            //this.startPitchYawRoll = null;
            this.rotationByEuler = null;
            this.rotationByShape = null;
            this.tilling = null;
            this.localMatrix = null;
            this.localTranslate = null;
            this.euler = null;
            this.localScale = null;
            this.colorRate = 1;
            this.color = null;
            this.uv = null;
        }
    }
    /**
     * @private
     */
    export enum nodeType
    {
        none,
        alpha,
        scale

    }
}