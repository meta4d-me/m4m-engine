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

    export interface IEffectElement
    {
        name: string;
        elementType: EffectElementTypeEnum;//singlemesh,emission....
        beloop: boolean;
        delayTime: number;
        mat: material;
        mesh: mesh;
        /** 写成josn 数据 */
        writeToJson(obj: any): any;
        /** 销毁 */
        dispose();
    }

    export enum AttributeType
    {
        PositionType = 1,
        EulerType = 2,
        ScaleType = 3,
        ColorType = 4,
        ColorRateType = 5,
        AlphaType = 6,
        TillingType = 7,
    }
    @m4m.reflect.SerializeType
    export class EffectElementSingleMesh implements IEffectElement
    {
        public name: string;
        public elementType: m4m.framework.EffectElementTypeEnum = m4m.framework.EffectElementTypeEnum.SingleMeshType;//singlemesh,emission....
        public beloop: boolean = false;
        public delayTime: number = 0;
        public life: number = 5;
        public mat: m4m.framework.material;
        public mesh: m4m.framework.mesh;
        
        public colorRate: number =1;//几倍颜色叠加
        public renderModel: m4m.framework.RenderModel = m4m.framework.RenderModel.Mesh;
        public tex_ST:math.vector4=new math.vector4(1,1,0,0);

        public position: Vector3Key[]=[];
        public euler: Vector3Key[] =[];
        public scale: Vector3Key[] =[];
        public color: Vector3Key[] =[];
        public alpha: NumberKey[] =[];

        public actions: IEffectAction[];//脚本驱动

        public curAttrData: EffectAttrsData;
        //public effectBatcher: EffectBatcherNew;

        public loopFrame: number = Number.MAX_VALUE;//循环帧数
        public active: boolean = true;//激活状态
        public transform: transform;
        private mgr: m4m.framework.assetMgr;
        private effectSys: TestEffectSystem;

        public rotationByEuler: math.quaternion = new math.quaternion();
        public localRotation: math.quaternion = new math.quaternion();
        /**
         * 特效元素
         * @param sys test特效系统
         * @param data 特效元素数据
         */
        constructor(sys: TestEffectSystem,data:EffectElementData=null)
        {
            this.effectSys = sys;
            if(data!=null)
            {
                this.initByElementdata(data);
            }
            else
            {
                this.initByDefData();
            }
        }
        /**
         * 初始化通过元素数据
         * @param data 特效元素数据
         */
        private initByElementdata(data:EffectElementData)
        {
            
        }
        /**
         * 初始化默认数据
         */
        private initByDefData()
        {
            this.mesh = this.mgr.getDefaultMesh("quad");
            var shader = this.mgr.getShader("diffuse.shader.json");
            this.mat.setShader(shader);
        }

        writeToJson(obj: any): any
        {

        }
        /** 更新 */
        update()
        {
            if (this.active)
            {
                if (this.curAttrData.euler != undefined)
                {
                    // console.log("euler:" + this.curAttrData.euler.toString());
                    m4m.math.quatFromEulerAngles(this.curAttrData.euler.x, this.curAttrData.euler.y, this.curAttrData.euler.z, this.curAttrData.rotationByEuler);
                }
                this.updateElementRotation();
                m4m.math.matrixMakeTransformRTS(this.curAttrData.pos, this.curAttrData.scale, this.curAttrData.localRotation, this.curAttrData.matrix);
            }
            else
            {
                this.curAttrData.resetMatrix();
            }
        }
        /**
         * 更新特效元素的旋转
         */
        private updateElementRotation() 
        {
            let cameraTransform = m4m.framework.sceneMgr.app.getScene().mainCamera.gameObject.transform;
            let worldRotation = m4m.math.pool.new_quaternion();
            let localRotation = m4m.math.pool.new_quaternion();

            if (this.curAttrData.renderModel != RenderModel.None) 
            {
                let invTransformRotation = m4m.math.pool.new_quaternion();
                let worldTranslation = m4m.math.pool.new_vector3();
                let translation = m4m.math.pool.new_vector3();
                m4m.math.vec3Clone(this.curAttrData.pos, translation);
                if (this.transform != undefined)
                {
                    m4m.math.matrixTransformVector3(translation, this.transform.getWorldMatrix(), worldTranslation);
                }
                if (this.curAttrData.renderModel == RenderModel.BillBoard) 
                {
                    m4m.math.quatLookat(worldTranslation, cameraTransform.getWorldTranslate(), worldRotation);
                }
                else if (this.curAttrData.renderModel == RenderModel.HorizontalBillBoard)
                {
                    worldRotation.x = -0.5;
                    worldRotation.y = 0.5;
                    worldRotation.z = 0.5;
                    worldRotation.w = 0.5;
                }
                else if (this.curAttrData.renderModel == RenderModel.VerticalBillBoard)
                {
                    let forwardTarget = m4m.math.pool.new_vector3();
                    m4m.math.vec3Clone(cameraTransform.getWorldTranslate(), forwardTarget);
                    forwardTarget.y = worldTranslation.y;
                    m4m.math.quatLookat(worldTranslation, forwardTarget, worldRotation);
                    m4m.math.pool.delete_vector3(forwardTarget);
                }
                else if (this.curAttrData.renderModel == RenderModel.StretchedBillBoard) 
                {

                    m4m.math.quatMultiply(worldRotation, this.curAttrData.rotationByEuler, this.curAttrData.localRotation);

                    m4m.math.quatLookat(worldTranslation, cameraTransform.getWorldTranslate(), worldRotation);

                    let lookRot = new m4m.math.quaternion();
                    m4m.math.quatClone(this.transform.getWorldRotate(), invTransformRotation);
                    m4m.math.quatInverse(invTransformRotation, invTransformRotation);
                    m4m.math.quatMultiply(invTransformRotation, worldRotation, lookRot);

                    let inverRot = m4m.math.pool.new_quaternion();
                    m4m.math.quatInverse(this.curAttrData.localRotation, inverRot);
                    m4m.math.quatMultiply(inverRot, lookRot, lookRot);

                    let angle = m4m.math.pool.new_vector3();
                    m4m.math.quatToEulerAngles(lookRot, angle);
                    m4m.math.quatFromEulerAngles(0, angle.y, 0, lookRot);
                    m4m.math.quatMultiply(this.curAttrData.localRotation, lookRot, this.curAttrData.localRotation);

                    m4m.math.pool.delete_quaternion(inverRot);
                    m4m.math.pool.delete_vector3(angle);
                    m4m.math.pool.delete_quaternion(lookRot);
                    return;
                }
                else if (this.curAttrData.renderModel == RenderModel.Mesh)
                {
                    EffectUtil.quatLookatZ(worldTranslation, cameraTransform.getWorldTranslate(), worldRotation);
                }

                m4m.math.quatMultiply(worldRotation, this.curAttrData.rotationByEuler, worldRotation);
                //消除transform组件对粒子本身的影响
                m4m.math.quatClone(this.transform.gameObject.transform.getWorldRotate(), invTransformRotation);
                m4m.math.quatInverse(invTransformRotation, invTransformRotation);

                m4m.math.quatMultiply(invTransformRotation, worldRotation, this.curAttrData.localRotation);

                m4m.math.pool.delete_vector3(translation);
                m4m.math.pool.delete_vector3(worldTranslation);
                m4m.math.pool.delete_quaternion(invTransformRotation);
            } else
            {
                m4m.math.quatMultiply(worldRotation, this.curAttrData.rotationByEuler, this.curAttrData.localRotation);
            }

            m4m.math.pool.delete_quaternion(localRotation);
            m4m.math.pool.delete_quaternion(worldRotation);

        }
        
        dispose()
        {

        }
    }
}

