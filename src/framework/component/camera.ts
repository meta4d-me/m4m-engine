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
/// <reference path="../../io/reflect.ts" />
namespace m4m.framework
{
    /**
     * @private
     */
    export interface ICameraPostQueue
    {
        /**
         * 执行渲染
         * @param scene 引擎场景 
         * @param context 渲染上下文
         * @param camera 相机
         */
        render(scene: scene, context: renderContext, camera: camera);
        renderTarget: render.glRenderTarget;
    }
    /**
     * @private
     */
    export class cameraPostQueue_Depth implements ICameraPostQueue
    {
        /**
         * 相机后处理 深度
         */
        constructor()
        {
            this.renderTarget = null;
        }
        render(scene: scene, context: renderContext, camera: camera)
        {

            //最后一个参数true 表示不用camera的clear 配置
            camera._targetAndViewport(this.renderTarget, scene, context, true);
            context.webgl.depthMask(true);//zwrite 會影響clear depth，這個查了好一陣
            m4m.render.glDrawPass.lastZWrite = true;


            context.webgl.clearColor(0, 0, 0, 0);
            context.webgl.clearDepth(1.0);
            context.webgl.clear(context.webgl.COLOR_BUFFER_BIT | context.webgl.DEPTH_BUFFER_BIT);
            camera._renderOnce(scene, context, "_depth");

            render.glRenderTarget.useNull(context.webgl);
        }
        renderTarget: render.glRenderTarget;
    }
    /**
     * @private
     */
    export class cameraPostQueue_Quad implements ICameraPostQueue
    {
        material: material;//shader & uniform
        /**
         * 相机后处理 方块
         */
        constructor()
        {
            this.renderTarget = null;
            this.material = new material();
        }
        render(scene: scene, context: renderContext, camera: camera)
        {

            camera._targetAndViewport(this.renderTarget, scene, context, true);

            context.webgl.depthMask(true);//zwrite 會影響clear depth，這個查了好一陣
            m4m.render.glDrawPass.lastZWrite = true;
            context.webgl.clearColor(0, 0.3, 0, 0);
            context.webgl.clearDepth(1.0);
            context.webgl.clear(context.webgl.COLOR_BUFFER_BIT | context.webgl.DEPTH_BUFFER_BIT);
            let mesh = scene.app.getAssetMgr().getDefaultMesh("quad");
            //画四边形
            context.drawtype = "";
            // mesh.glMesh.bindVboBuffer(context.webgl);
            this.material.draw(context, mesh, mesh.submesh[0], "quad");

            render.glRenderTarget.useNull(context.webgl);

        }
        renderTarget: render.glRenderTarget;
    }
    /**
     * @private
     */
    export class cameraPostQueue_Color implements ICameraPostQueue
    {
        /**
         * 相机后处理颜色队列
         */
        constructor()
        {
            this.renderTarget = null;
        }
        render(scene: scene, context: renderContext, camera: camera)
        {
            camera._targetAndViewport(this.renderTarget, scene, context, false);
            camera._renderOnce(scene, context, "");
            render.glRenderTarget.useNull(context.webgl);
        }
        renderTarget: render.glRenderTarget;
    }
    /**
     * @private
     */
    export interface IOverLay
    {
        init: boolean;
        sortOrder: number;
        /** 初始化调用一次 */
        start(camera: camera);
        /**
         * 执行渲染
         * @param context 渲染上下文
         * @param assetmgr 资源管理
         * @param camera 相机
         */
        render(context: renderContext, assetmgr: assetMgr, camera: camera);
        /**
         * 执行更新
         * @param delta 上一循环间隔时间
         */
        update(delta: number);
    }
    /**
    * @public
    * @language zh_CN
    * @classdesc
    * 视锥剔除组件，作为标记存在
    * @version m4m 1.0
    */
    @reflect.nodeComponent
    @reflect.nodeCamera
    export class camera implements INodeComponent
    {
        static readonly ClassName: string = "camera";
        /**
         * 相机
         */
        constructor()
        {
            for (let i = 0; i < 8; i++)
            {
                this.frameVecs.push(new math.vector3());
            }
        }

        private static helpv3 = new m4m.math.vector3();
        private static helpv3_1 = new m4m.math.vector3();
        private static helpv3_2 = new m4m.math.vector3();
        private static helpv3_3 = new m4m.math.vector3();
        private static helpv3_4 = new m4m.math.vector3();
        private static helpv3_5 = new m4m.math.vector3();
        private static helpv3_6 = new m4m.math.vector3();
        private static helpv3_7 = new m4m.math.vector3();

        private static helpmtx = new m4m.math.matrix();
        private static helpmtx_1 = new m4m.math.matrix();
        private static helpmtx_2 = new m4m.math.matrix();
        private static helpmtx_3 = new m4m.math.matrix();

        private static helprect = new m4m.math.rect();

        private projectMatrixDirty = true;

        /**
         * 后处理渲染颜色清理优先使用雾颜色
         */
        public postClearUseFogColor = true;

        /**
         * 相机剔除时，计算 z 轴上的平面 （far & near plane）
         */
        cullZPlane: boolean = true;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 挂载的gameobject
         * @version m4m 1.0
         */
        gameObject: gameObject;

        private _near: number = 0.01;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 相机到近裁剪面距离
         * @version m4m 1.0
         */
        @m4m.reflect.UIStyle("rangeFloat", 1, 1000, 2)//加上这个标记，编辑器就能读取这个显示ui了
        @m4m.reflect.Field("number")
        get near(): number
        {
            return this._near;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 设置相机到近裁剪面距离
         * @version m4m 1.0
         */
        set near(val: number)
        {
            if (this._opvalue > 0)
            {
                if (val < 0.01) val = 0.01;
            }
            if (val >= this._far) val = this._far - 0.01;
            this._near = val;
            this.projectMatrixDirty = true;
        }
        private _far: number = 1000;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 相机到远裁剪面距离
         * @version m4m 1.0
         */
        @m4m.reflect.UIStyle("rangeFloat", 1, 1000, 999)
        @m4m.reflect.Field("number")
        get far(): number
        {
            return this._far;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 设置相机到远裁剪面距离
         * @version m4m 1.0
         */
        set far(val: number)
        {
            if (val <= this._near) val = this._near + 0.01;
            this._far = val;
            this.projectMatrixDirty = true;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 相机渲染剔除mask
         * @version m4m 1.0
         */
        @m4m.reflect.Field("number")
        CullingMask: CullingMask = CullingMask.everything ^ CullingMask.editor;
        //CullingMask: CullingMask = CullingMask.everything;
        /**
         * 当前RenderContext 的 Index
         */
        get CurrContextIndex() { return this._contextIdx; }
        private _contextIdx = -1;
        /**
         * @deprecated [已弃用]
         */
        @reflect.compCall({ "use": "dirty", "display": "刷新camera" })
        markDirty()
        {

        }

        isEditorCam: boolean = false;

        start()
        {
            this.isEditorCam = this.gameObject.transform.name.toLowerCase().indexOf("editor") >= 0;
        }

        onPlay()
        {

        }

        update(delta: number)
        {
            this._updateOverLays(delta);

            let _scene = sceneMgr.scene;
            if (_scene.autoCollectlightCamera)
            {
                // //收集摄像机
                // var c = this;
                // if (c.gameObject.visibleInScene)
                // {
                //     _scene.renderCameras.push(c);
                // }
                // var cl = _scene.renderCameras.length;
                // while (_scene.renderContext.length < cl)
                // {
                //     _scene.renderContext.push(new renderContext(_scene.webgl));
                // }
                if (this.gameObject.visibleInScene)
                    _scene.addCamera(this);
            }
        }

        /** overLays update */
        private _updateOverLays(delta: number)
        {
            for (var i = 0; i < this.overlays.length; i++)
            {
                if (!this.overlays[i].init)
                {
                    this.overlays[i].start(this);
                    this.overlays[i].init = true;
                }
                this.overlays[i].update(delta);
            }
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 是否清除颜色缓冲区
         * @version m4m 1.0
         */
        clearOption_Color: boolean = true;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 是否清除深度缓冲区
         * @version m4m 1.0
         */
        clearOption_Depth: boolean = true;
        // backgroundColor: m4m.math.color = new m4m.math.color(0.11, 0.11, 0.11, 1.0);
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 背景色
         * @version m4m 1.0
         */
        backgroundColor: m4m.math.color = new m4m.math.color(0.5, 0.8, 1, 1);
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 相机视窗
         * @version m4m 1.0
         */
        // @m4m.reflect.Field("rect")
        viewport: m4m.math.rect = new m4m.math.rect(0, 0, 1, 1);
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 渲染目标
         * @version m4m 1.0
         */
        renderTarget: m4m.render.glRenderTarget = null;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * camera 渲染排序标记
         * @version m4m 1.0
         */
        order: number = 0;//camera 渲染顺序
        @m4m.reflect.Field("IOverLay[]")
        private overlays: IOverLay[] = [];
        /**
         * @public
         * @language zh_CN
         * @param overlay 2d组件
         * @classdesc
         * 添加2d渲染组件
         * @version m4m 1.0
         */
        addOverLay(overLay: IOverLay)
        {
            // if (overLay instanceof overlay2D)
            // {
            //     let lay = overLay as overlay2D;
            //     if (lay.camera != null)
            //     {
            //         lay.camera.removeOverLay(lay);
            //     }
            // }
            this.overlays.push(overLay);
            this.sortOverLays(this.overlays);
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 返回此相机上的overlays数组
         * @version m4m 1.0
         */
        getOverLays()
        {
            return this.overlays;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 移除相机上的所有overly
         * @version m4m 1.0
         */
        removeOverLay(overLay: IOverLay)
        {
            if (this.overlays == null)
                return;
            let index = this.overlays.indexOf(overLay);
            if (index >= 0)
                this.overlays.splice(index, 1);

            this.sortOverLays(this.overlays);
        }

        /**
         * overlays 排序
         * @param lays overlays列表
         */
        private sortOverLays(lays: IOverLay[])
        {
            if (!lays || lays.length < 1) return;
            lays.sort((a, b) =>
            {
                return a.sortOrder - b.sortOrder;
            });
        }

        private LastCamWorldMtx = new math.matrix();
        /**
        * @public
        * @language zh_CN
        * 计算视矩阵, return 是否有变化
        * @param outMatrix 返回的视矩阵
        * @classdesc
        * 计算相机的viewmatrix（视矩阵）
        * @version m4m 1.0
        */
        calcViewMatrix(outMatrix?: m4m.math.matrix): boolean
        {
            let wMtx = this.gameObject.transform.getWorldMatrix();
            let dirty = !m4m.math.matrixEqual(wMtx, this.LastCamWorldMtx, 0.000001);

            if (dirty)
            {
                m4m.math.matrixClone(wMtx, this.LastCamWorldMtx);
                //视矩阵刚好是摄像机世界矩阵的逆
                m4m.math.matrixInverse(wMtx, this.viewMatrix);
            }

            if (outMatrix)
                m4m.math.matrixClone(this.viewMatrix, outMatrix);

            return true;
        }

        /**
         * 当前的相机视口像素rect
         */
        readonly currViewPixelRect = new math.rect();

        /**
         * 当前相机视口像素asp
         */
        currViewPixelASP = 1;

        /**
         * @public
         * @language zh_CN
         * @param app 主程序
         * @param viewportpixel 视口rect
         * @classdesc
         * 计算相机视口像素rect
         * @version m4m 1.0
         */
        calcViewPortPixel(app: application, viewPortPixel?: math.rect)
        {

            let w: number;
            let h: number;
            if (this.renderTarget == null)
            {
                w = app.width;
                h = app.height;
            }
            else
            {
                w = this.renderTarget.width;
                h = this.renderTarget.height;
            }
            let vp = this.viewport;
            let cvpr = this.currViewPixelRect;
            cvpr.x = w * vp.x;
            cvpr.y = h * vp.y;
            cvpr.w = w * vp.w;
            cvpr.h = h * vp.h;
            if (viewPortPixel)
            {
                m4m.math.rectClone(this.currViewPixelRect, viewPortPixel);
            }

            this.currViewPixelASP = cvpr.w / cvpr.h;
        }

        private lastAsp = -1;
        /**
         * @public
         * @language zh_CN
         * 计算投影矩阵, return 是否有变化
         * @param asp 
         * @param outMatrix projectmatrix（投影矩阵）
         * @classdesc
         * 计算相机投影矩阵
         * @version m4m 1.0
         */
        calcProjectMatrix(asp: number, outMatrix: m4m.math.matrix)
        {
            if (this.projectMatrixDirty || this.lastAsp != asp)
            {
                if (this._opvalue > 0)
                    math.matrixProject_PerspectiveLH(this._fov, asp, this._near, this._far, this.matProjP);
                if (this._opvalue < 1)
                    math.matrixProject_OrthoLH(this._size * asp, this._size, this._near, this._far, this.matProjO);

                if (this._opvalue == 0)
                    math.matrixClone(this.matProjO, this.projectMatrix);
                else if (this._opvalue == 1)
                    math.matrixClone(this.matProjP, this.projectMatrix);
                else
                    math.matrixLerp(this.matProjO, this.matProjP, this._opvalue, this.projectMatrix);
            }

            this.projectMatrixDirty = false;
            this.lastAsp = asp;
            //投影矩阵函数缺一个
            if (outMatrix)
                m4m.math.matrixClone(this.projectMatrix, outMatrix);

            return true;
        }

        /**
         * 计算视窗投影矩阵,return 是否有变化
         * @param app 
         * @param outViewProjectMatrix 
         * @param outViewMatrix 
         * @param outProjectMatrix 
         */
        calcViewProjectMatrix(app: application, outViewProjectMatrix?: math.matrix, outViewMatrix?: math.matrix, outProjectMatrix?: math.matrix)
        {
            let vd = this.calcViewMatrix(outViewMatrix);
            // let vpp = camera.helprect;
            // this.calcViewPortPixel(app, vpp);
            // let asp = vpp.w / vpp.h;
            let asp = this.currViewPixelASP;
            let pd = this.calcProjectMatrix(asp, outProjectMatrix);
            if (vd || pd)
            {
                m4m.math.matrixMultiply(this.projectMatrix, this.viewMatrix, this.viewProjectMatrix);
                if (outViewProjectMatrix)
                    math.matrixClone(this.viewProjectMatrix, outViewProjectMatrix);
            }

            return vd || pd;
        }

        private static _shareRay: ray;
        /**
         * @public
         * @language zh_CN
         * @param screenpos 屏幕坐标
         * @param app 主程序
         * @param shareRayCache 返回ray 实例 共用一个缓存射线对象 ，默认开启
         * @classdesc
         * 由屏幕坐标发射射线
         * @version m4m 1.0
         */
        creatRayByScreen(screenpos: m4m.math.vector2, app: application, shareRayCache: boolean = true): ray
        {
            let src1 = camera.helpv3;
            math.vec3Set(src1, screenpos.x, screenpos.y, 0);

            let src2 = camera.helpv3_1;
            math.vec3Set(src2, screenpos.x, screenpos.y, 1);

            let dest1 = camera.helpv3_2;
            let dest2 = camera.helpv3_3;
            this.calcModelPosFromScreenPos(app, src1, dest1);
            this.calcModelPosFromScreenPos(app, src2, dest2);

            let dir = camera.helpv3_4;
            m4m.math.vec3Subtract(dest2, dest1, dir);
            m4m.math.vec3Normalize(dir, dir);
            let ray: ray;
            if (shareRayCache)
            {
                if (!camera._shareRay)
                {
                    camera._shareRay = new m4m.framework.ray(dest1, dir);
                }
                ray = camera._shareRay;
                ray.set(dest1, dir);
            } else
            {
                ray = new m4m.framework.ray(dest1, dir);
            }

            return ray;
        }
        /**
         * @public
         * @language zh_CN
         * @param app 主程序
         * @param screenpos 屏幕坐标
         * @param outWorldPos model空间坐标
         * @classdesc
         * 由屏幕坐标得到model空间坐标
         * @version m4m 1.0
         */
        calcModelPosFromScreenPos(app: application, screenPos: math.vector3, outModelPos: math.vector3)
        {
            // let vpp = camera.helprect;
            let vpp = this.currViewPixelRect;
            // this.calcViewPortPixel(app, vpp);

            let matinv = this.InverseViewProjectMatrix;
            let vpd = this.calcViewProjectMatrix(app);
            if (vpd)
            {
                m4m.math.matrixInverse(this.viewProjectMatrix, matinv);
            }

            let src1 = camera.helpv3;
            src1.x = screenPos.x / vpp.w * 2 - 1;
            src1.y = 1 - screenPos.y / vpp.h * 2;
            src1.z = screenPos.z;
            // new math.vector3(vppos.x, vppos.y, screenPos.z);
            m4m.math.matrixTransformVector3(src1, matinv, outModelPos);
        }
        /**
         * @public
         * @language zh_CN
         * @param app 主程序
         * @param worldPos 世界坐标
         * @param outScreenPos 屏幕坐标
         * @classdesc
         * 由世界坐标得到屏幕坐标
         * @version m4m 1.0
         */
        calcScreenPosFromWorldPos(app: application, worldPos: math.vector3, outScreenPos: math.vector2)
        {
            // let vpp = camera.helprect;
            let vpp = this.currViewPixelRect;
            // this.calcViewPortPixel(app, vpp);

            // let matrixView = camera.helpmtx;
            // let matrixProject = camera.helpmtx_1;
            // let asp = vpp.w / vpp.h;
            // this.calcViewMatrix(matrixView);
            // this.calcProjectMatrix(asp, matrixProject);
            // let matrixViewProject = camera.helpmtx_2;
            // m4m.math.matrixMultiply(matrixProject, matrixView, matrixViewProject);

            this.calcViewProjectMatrix(app);

            let ndcPos = camera.helpv3;
            // m4m.math.matrixTransformVector3(worldPos, matrixViewProject, ndcPos);
            m4m.math.matrixTransformVector3(worldPos, this.viewProjectMatrix, ndcPos);
            outScreenPos.x = (ndcPos.x + 1) * vpp.w * 0.5;
            outScreenPos.y = (1 - ndcPos.y) * vpp.h * 0.5;
        }

        /**
         * @public
         * @language zh_CN
         * @param app application
         * @param worldPos 世界空间坐标
         * @param outClipPos 计算返回裁剪空间坐标
         * @classdesc
         * 由世界坐标得到裁剪空间坐标
         * @version m4m 1.0
         */
        calcClipPosFromWorldPos(app: application, worldPos: math.vector3, outClipPos: math.vector3)
        {
            this.calcViewProjectMatrix(app);
            m4m.math.matrixTransformVector3(worldPos, this.viewProjectMatrix, outClipPos);
        }

        private lastCamMtx = new math.matrix();
        private lastCamRect = new math.rect();
        private paraArr = [NaN, NaN, NaN, NaN, NaN];  // [fov,near,far,opvalue,size]
        /**
         * 计算相机框
         * @param app 引擎app对象
         */
        private calcCameraFrame(app: application)
        {
            let matrix = this.gameObject.transform.getWorldMatrix();
            let _vpp = camera.helprect;
            this.calcViewPortPixel(app, _vpp);
            let tOpval = Math.ceil(this._opvalue);
            //检查是否需要更新
            if (math.matrixEqual(this.lastCamMtx, matrix) && math.rectEqul(this.lastCamRect, _vpp) &&
                this.paraArr[0] == this._fov && this.paraArr[1] == this._near && this.paraArr[2] == this._far)
            {
                //opvalue
                if (this.paraArr[3] == tOpval && (tOpval == 1 || this.paraArr[4] == this._size))
                {
                    return;
                }
            }

            let needSize = tOpval == 0;

            //同步last
            math.matrixClone(matrix, this.lastCamMtx);
            math.rectClone(_vpp, this.lastCamRect);
            this.paraArr[0] = this._fov;
            this.paraArr[1] = this._near;
            this.paraArr[2] = this._far;
            this.paraArr[3] = this._opvalue;
            this.paraArr[4] = this._size;

            let tanFov = Math.tan(this._fov * 0.5);
            let nearSize = this._near * tanFov;
            let farSize = this._far * tanFov;
            //set size
            if (needSize)
            {
                nearSize = farSize = this._size * 0.5;
            }

            let near_h = nearSize;
            let asp = _vpp.w / _vpp.h;
            let near_w = near_h * asp;

            let nearLT = camera.helpv3;
            let nearLD = camera.helpv3_1;
            let nearRT = camera.helpv3_2;
            let nearRD = camera.helpv3_3;
            math.vec3Set(nearLT, -near_w, near_h, this._near);
            math.vec3Set(nearLD, -near_w, -near_h, this._near);
            math.vec3Set(nearRT, near_w, near_h, this._near);
            math.vec3Set(nearRD, near_w, -near_h, this._near);

            let far_h = farSize;
            let far_w = far_h * asp;

            let farLT = camera.helpv3_4;
            let farLD = camera.helpv3_5;
            let farRT = camera.helpv3_6;
            let farRD = camera.helpv3_7;
            math.vec3Set(farLT, -far_w, far_h, this._far);
            math.vec3Set(farLD, -far_w, -far_h, this._far);
            math.vec3Set(farRT, far_w, far_h, this._far);
            math.vec3Set(farRD, far_w, -far_h, this._far);

            m4m.math.matrixTransformVector3(farLD, matrix, farLD);
            m4m.math.matrixTransformVector3(nearLD, matrix, nearLD);
            m4m.math.matrixTransformVector3(farRD, matrix, farRD);
            m4m.math.matrixTransformVector3(nearRD, matrix, nearRD);
            m4m.math.matrixTransformVector3(farLT, matrix, farLT);
            m4m.math.matrixTransformVector3(nearLT, matrix, nearLT);
            m4m.math.matrixTransformVector3(farRT, matrix, farRT);
            m4m.math.matrixTransformVector3(nearRT, matrix, nearRT);
            math.vec3Clone(farLD, this.frameVecs[0]);
            math.vec3Clone(nearLD, this.frameVecs[1]);
            math.vec3Clone(farRD, this.frameVecs[2]);
            math.vec3Clone(nearRD, this.frameVecs[3]);
            math.vec3Clone(farLT, this.frameVecs[4]);
            math.vec3Clone(nearLT, this.frameVecs[5]);
            math.vec3Clone(farRT, this.frameVecs[6]);
            math.vec3Clone(nearRT, this.frameVecs[7]);

        }
        private viewMatrix: math.matrix = new math.matrix;
        private matProjP: math.matrix = new math.matrix;
        private matProjO: math.matrix = new math.matrix;
        private projectMatrix: math.matrix = new math.matrix;
        private viewProjectMatrix: math.matrix = new math.matrix;
        private InverseViewProjectMatrix: math.matrix = new math.matrix;

        private frameVecs: math.vector3[] = [];

        private _fov: number = 60 * Math.PI / 180;//透视投影的fov
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 透视投影的fov
         * @version m4m 1.0
         */
        @m4m.reflect.Field("number")
        set fov(val: number)
        {
            this._fov = val;
            this.projectMatrixDirty = true;
        }
        get fov()
        {
            return this._fov;
        }

        _size: number = 2;//正交投影的竖向size
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 正交投影的竖向size
         * @version m4m 1.0
         */
        @m4m.reflect.Field("number")
        set size(val: number)
        {
            this._size = val;
            this.projectMatrixDirty = true;
        }
        get size()
        {
            return this._size;
        }

        private _opvalue = 1;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 0=正交， 1=透视 中间值可以在两种相机间过度
         * @version m4m 1.0
         */
        @m4m.reflect.Field("number")
        set opvalue(val: number)
        {
            if (val > 0 && this._near < 0.01)
            {
                this.near = 0.01;
                if (this._far <= this._near)
                    this.far = this._near + 0.01;
            }
            this._opvalue = val;
            this.projectMatrixDirty = true;
        }
        get opvalue(): number
        {
            return this._opvalue;
        }

        /**
         * 通过屏幕空间坐标位置， 获取在view空间下，交汇到指定平面上的坐标位置
         * @param screenPos 屏幕空间坐标
         * @param app 引擎app对象
         * @param z view 空间下Z轴值
         * @param out 返回的结果坐标位置
         */
        getPosAtXPanelInViewCoordinateByScreenPos(screenPos: m4m.math.vector2, app: application, z: number, out: m4m.math.vector2)
        {
            let vpp = this.currViewPixelRect;
            // let vpp = camera.helprect;
            // this.calcViewPortPixel(app, vpp);

            let nearpos = camera.helpv3;
            nearpos.z = -this._near;
            nearpos.x = screenPos.x - vpp.w * 0.5;
            nearpos.y = vpp.h * 0.5 - screenPos.y;

            let farpos = camera.helpv3_1;
            farpos.z = -this._far;
            farpos.x = this._far * nearpos.x / this._near;
            farpos.y = this._far * nearpos.y / this._near;;

            let rate = (nearpos.z - z) / (nearpos.z - farpos.z);
            out.x = nearpos.x - (nearpos.x - farpos.x) * rate;
            out.y = nearpos.y - (nearpos.y - farpos.y) * rate;
        }

        // 裁剪状态列表

        private cullingMap = {};
        public isLastCamera = false;    // 场景渲染列表的最后一个相机, 用来清除物体frustumDirty


        /**
        * 填充渲染节点
        * @param scene 场景对象
        */
        fillRenderer(scene: scene)
        {
            scene.renderList.clear();
            if (scene.app.isFrustumCulling)
                this.calcCameraFrame(scene.app);
            let fID = scene.app.frameID;
            if (camera.lastFID != fID)
            {
                this.needUpdateWpos = true;
                camera.lastFID = fID;
            }
            // this._fillRenderer1(scene, scene.getRoot());
            this._fillRenderer(scene, scene.getRoot());

            this.needUpdateWpos = false;
            camera.lastFID = fID;
            if (this.gameObject.transform.dirtiedOfFrustumCulling)
                this.gameObject.transform.dirtiedOfFrustumCulling = false;
        }

        private static lastFID = -1;
        private needUpdateWpos = false;

        /**
         * 填充渲染节点
         * @param scene 场景对象
         * @param node 节点
         * @param _isStatic 是否是静态节点
         */
        private _fillRenderer(scene: scene, node: transform, _isStatic: boolean = false)
        {
            if (!node.needFillRenderer) return;  //强制不fill 
            let go = node.gameObject;
            if (!go || !go.visible || (node.hasRendererComp == false && node.hasRendererCompChild == false)) return;  //自己没有渲染组件 且 子物体也没有 return

            // if (scene.app.isFrustumCulling && !this.testFrustumCulling(scene, node)) return;//视锥测试不通过 直接return
            go.isStatic = _isStatic || go.isStatic;
            const id = node.insId.getInsID();
            let renderer = go.renderer;
            let islayerPass = renderer != null ? this.CullingMask & (1 << renderer.renderLayer) : false;
            if (node.dirtiedOfFrustumCulling || this.gameObject.transform.dirtiedOfFrustumCulling)
            {
                if (this.needUpdateWpos)
                { // 更新世界坐标
                    node.getWorldTranslate();
                    node.inCameraVisible = false;
                }

                this.cullingMap[id] = false;
                if (islayerPass && node.enableCulling && scene.app.isFrustumCulling)
                {
                    this.cullingMap[id] = this.isCulling(node);
                    node.inCameraVisible = node.inCameraVisible || !this.cullingMap[id];
                }

                if (this.isLastCamera)
                    node.dirtiedOfFrustumCulling = false;
            }

            if (islayerPass && !this.cullingMap[id])  //判断加入到渲染列表
            {
                scene.renderList.addRenderer(renderer, scene.webgl);
            }

            if (node.children)
            {
                for (var i = 0, l = node.children.length; i < l; ++i)
                    this._fillRenderer(scene, node.children[i], go.isStatic);
            }
            // if (node.children != null)
            // {
            //     for (var i = 0; i < node.children.length; i++)
            //     {
            //         this._fillRenderer(scene, node.children[i]);
            //     }
            // }
        }
        private fruMap = {
            farLD: 0,
            nearLD: 1,
            farRD: 2,
            nearRD: 3,
            farLT: 4,
            nearLT: 5,
            farRT: 6,
            nearRT: 7,
        }
        private _vec3cache = new m4m.math.vector3();
        /**
         * 检查节点是否被剔除
         * @param node 被检查节点
         * @returns 是被剔除？
         */
        isCulling(node: transform)
        {

            if (node.gameObject.hideFlags & HideFlags.DontFrustumCulling) return false;
            const vec3cache = this._vec3cache;
            let { aabb } = node;
            //var skinmesh = node.gameObject.getComponent("skinnedMeshRenderer") as m4m.framework.skinnedMeshRenderer;
            var skinmesh = node.gameObject.renderer as any; //skinnedMeshRenderer noly
            if (skinmesh != null && skinmesh.size && skinmesh.aabb)
            {
                // 有些模型没有size, 会报错
                // 如果有骨骼动画, 使用unity导出的aabb
                // if (skinmesh.aabb != null)
                aabb = skinmesh.aabb;
            }
            m4m.math.vec3Subtract(aabb.maximum, aabb.minimum, vec3cache);
            const radius = m4m.math.vec3Length(vec3cache) * 0.5;
            const center = node.aabb.center;
            return this.cullTest(radius, center);
        }

        /**
         * 剔除测试 ，返回 ture 确认为剔除
         * @param radius 半径
         * @param center 中心点
         */
        cullTest(radius: number, center: math.vector3)
        {
            // Left
            if (this.isRight(
                this.frameVecs[this.fruMap.nearLD],
                this.frameVecs[this.fruMap.farLD],
                this.frameVecs[this.fruMap.farLT],
                center,
                radius
            )) return true;

            // Right
            if (this.isRight(
                this.frameVecs[this.fruMap.nearRT],
                this.frameVecs[this.fruMap.farRT],
                this.frameVecs[this.fruMap.farRD],
                center,
                radius
            )) return true;

            // Top
            if (this.isRight(
                this.frameVecs[this.fruMap.nearLT],
                this.frameVecs[this.fruMap.farLT],
                this.frameVecs[this.fruMap.farRT],
                center,
                radius
            )) return true;

            // Bottom
            if (this.isRight(
                this.frameVecs[this.fruMap.nearRD],
                this.frameVecs[this.fruMap.farRD],
                this.frameVecs[this.fruMap.farLD],
                center,
                radius
            )) return true;

            if (!this.cullZPlane) return false;

            // Front
            if (this.isRight(
                this.frameVecs[this.fruMap.nearLT],
                this.frameVecs[this.fruMap.nearRT],
                this.frameVecs[this.fruMap.nearRD],
                center,
                radius
            )) return true;

            // Back
            if (this.isRight(
                this.frameVecs[this.fruMap.farRT],
                this.frameVecs[this.fruMap.farLT],
                this.frameVecs[this.fruMap.farLD],
                center,
                radius
            )) return true;


            return false;
        }

        private _edge1 = new m4m.math.vector3();
        private _edge2 = new m4m.math.vector3();
        /**
         * 检测面与球面是否在面的右边
         * @param v0 面的点0
         * @param v1 面的点1
         * @param v2 面的点2
         * @param pos 球中心位置
         * @param radius 球半径
         * @returns 是在右边
         */
        private isRight(v0: m4m.math.vector3, v1: m4m.math.vector3, v2: m4m.math.vector3, pos: m4m.math.vector3, radius: number)
        {
            const edge1 = this._edge1;
            const edge2 = this._edge2;
            const vec3cache = this._vec3cache;
            m4m.math.vec3Subtract(v1, v0, edge1);
            m4m.math.vec3Subtract(v2, v0, edge2);
            // direction
            m4m.math.vec3Cross(edge1, edge2, vec3cache);
            m4m.math.vec3Normalize(vec3cache, vec3cache);

            // distance
            m4m.math.vec3Subtract(pos, v0, edge1);
            let dis = m4m.math.vec3Dot(edge1, vec3cache) - radius;
            return dis > 0;
        }
        /**
         * @deprecated [已弃用]
        */
        testFrustumCulling(scene: scene, node: transform)
        {
            if (!node.gameObject.getComponent("frustumculling")) return true;//没挂识别组件即为通过测试
            let spherecol = node.gameObject.getComponent("spherecollider") as spherecollider;
            // let worldPos = node.getWorldTranslate();

            if (!spherecol.caclPlaneInDir(this.frameVecs[0], this.frameVecs[1], this.frameVecs[5])) return false;
            if (!spherecol.caclPlaneInDir(this.frameVecs[1], this.frameVecs[3], this.frameVecs[7])) return false;
            if (!spherecol.caclPlaneInDir(this.frameVecs[3], this.frameVecs[2], this.frameVecs[6])) return false;
            if (!spherecol.caclPlaneInDir(this.frameVecs[2], this.frameVecs[0], this.frameVecs[4])) return false;
            if (!spherecol.caclPlaneInDir(this.frameVecs[5], this.frameVecs[7], this.frameVecs[6])) return false;
            if (!spherecol.caclPlaneInDir(this.frameVecs[0], this.frameVecs[2], this.frameVecs[3])) return false;
            return true;
        }
        /**
        *  刷新计算 RenderTarget 或 viewport 的绘制矩形区
        */
        _targetAndViewport(target: render.glRenderTarget, scene: scene, context: renderContext, withoutClear: boolean)
        {
            {
                let w: number;
                let h: number;
                if (target == null)
                {
                    w = scene.app.width;
                    h = scene.app.height;
                    // render.glRenderTarget.useNull(context.webgl);
                }
                else
                {
                    w = target.width;
                    h = target.height;
                    target.use(context.webgl);
                }

                //viewport 管不到clear的区域？
                context.webgl.viewport(w * this.viewport.x, h * this.viewport.y, w * this.viewport.w, h * this.viewport.h);
                context.webgl.depthRange(0, 1);

                if (withoutClear == false)
                {

                    //clear
                    if (this.clearOption_Color && this.clearOption_Depth)
                    {
                        context.webgl.depthMask(true);//zwrite 會影響clear depth，這個查了好一陣
                        m4m.render.glDrawPass.lastZWrite = true;
                        if (this.postClearUseFogColor && scene.fog)
                        {
                            context.webgl.clearColor(scene.fog._Color.x, scene.fog._Color.y, scene.fog._Color.z, scene.fog._Color.w);
                        } else
                        {
                            context.webgl.clearColor(this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b, this.backgroundColor.a);
                        }
                        //context.webgl.clearColor(this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b, this.backgroundColor.a);
                        context.webgl.clearDepth(1.0);
                        context.webgl.clear(context.webgl.COLOR_BUFFER_BIT | context.webgl.DEPTH_BUFFER_BIT);
                    }
                    else if (this.clearOption_Depth)
                    {
                        context.webgl.depthMask(true);
                        m4m.render.glDrawPass.lastZWrite = true;
                        context.webgl.clearDepth(1.0);
                        context.webgl.clear(context.webgl.DEPTH_BUFFER_BIT);
                    }
                    else if (this.clearOption_Color)
                    {
                        if (this.postClearUseFogColor && scene.fog)
                        {
                            context.webgl.clearColor(scene.fog._Color.x, scene.fog._Color.y, scene.fog._Color.z, scene.fog._Color.w);
                        } else
                        {
                            context.webgl.clearColor(this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b, this.backgroundColor.a);
                        }

                        //context.webgl.clearColor(this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b, this.backgroundColor.a);
                        context.webgl.clear(context.webgl.COLOR_BUFFER_BIT);
                    }
                    else
                    {

                    }

                }

            }
        }
        /**
        * 将当前场景所有能渲染节点，执行渲染一次
        */
        _renderOnce(scene: scene, context: renderContext, drawtype: string)
        {
            context.drawtype = drawtype;

            let assetmgr = scene.app.getAssetMgr();
            // for (let layer of scene.renderList.renderLayers)
            let rlayers = scene.renderList.renderLayers;
            for (let i = 0, l = rlayers.length; i < l; ++i)
            {
                let ls = rlayers[i].list;
                let len = ls.length;
                for (let j = 0; j < len; ++j)
                // for (let item of layer.list)
                {
                    let item = ls[j];
                    item.render(context, assetmgr, this);  //过滤判断 _fillRenderer 过程几经做了

                    // if (item.gameObject.visible == true && this.CullingMask & (1 << item.renderLayer))
                    // {
                    //     if (item.gameObject && item.gameObject.visible == true)
                    //         item.render(context, assetmgr, this);
                    // }
                }

                //gpu instancing process
                let rmap = rlayers[i].gpuInstanceMap;
                for (let key in rmap)
                {
                    let gpuList = rmap[key];
                    if (!gpuList) continue;
                    meshRenderer.GpuInstancingRender(context, gpuList);
                }

                // Batcher gpu instancing process
                let bRmap = rlayers[i].gpuInstanceBatcherMap;
                for (let key in bRmap)
                {
                    let obj = bRmap[key];
                    if (!obj) continue;
                    meshRenderer.GpuInstancingRenderBatcher(context, obj);
                }
            }
            // for (var i = 0; i < scene.renderList.renderLayers.length; i++)
            // {
            //     var layer = scene.renderList.renderLayers[i];
            //     var list = layer.list;

            //     for (var j = 0; j < list.length; j++)
            //     {
            //         if (this.CullingMask & (1 << list[j].renderLayer))
            //         {
            //             list[j].render(context, assetmgr, this);
            //         }
            //     }
            // }

        }
        /**
        * @private
        */
        postQueues: ICameraPostQueue[] = [];
        /**
         * 渲染场景
         * @param scene 引擎场景 
         * @param context 引擎渲染上下文
         * @param contextIdx 上下文索引
         */
        renderScene(scene: scene, context: renderContext, contextIdx: number)
        {
            this._contextIdx = contextIdx;// scene.renderContext.indexOf(context);
            let rlayers = scene.renderList.renderLayers;
            for (var i = 0, l = rlayers.length; i < l; ++i)
            {
                let layer = rlayers[i];
                let list = layer.list;
                if (layer.needSort)
                {
                    if (list.length > 1)
                    {
                        list.sort((a, b) =>
                        {
                            if (a.queue != b.queue)
                            {
                                return a.queue - b.queue;
                            } else if (a instanceof ParticleSystem && b instanceof ParticleSystem)
                            {
                                return b.sortingFudge - a.sortingFudge;
                            }
                            else
                            {
                                // var matrixView = math.pool.new_matrix();
                                // this.calcViewMatrix(matrixView);
                                let matrixView = context.matrixView;

                                let az = camera.helpv3;
                                let bz = camera.helpv3_1;

                                // m4m.math.matrixTransformVector3(a.gameObject.transform.getWorldTranslate(), matrixView, az);
                                // m4m.math.matrixTransformVector3(b.gameObject.transform.getWorldTranslate(), matrixView, bz);
                                // m4m.math.matrixTransformVector3(a.gameObject.transform['worldTranslate'], matrixView, az);
                                // m4m.math.matrixTransformVector3(b.gameObject.transform['worldTranslate'], matrixView, bz);
                                m4m.math.matrixTransformVector3(a.gameObject.transform.worldTranslate, matrixView, az);
                                m4m.math.matrixTransformVector3(b.gameObject.transform.worldTranslate, matrixView, bz);
                                return bz.z - az.z;
                            }
                        })
                    }
                }
            }
            if (this.postQueues.length == 0)
            {
                this._targetAndViewport(this.renderTarget, scene, context, false);
                this._renderOnce(scene, context, "");

            }
            else
            {
                // for (let item of this.postQueues)
                for (let i = 0, l = this.postQueues.length; i < l; ++i)
                {
                    this.postQueues[i].render(scene, context, this);
                }
                context.webgl.flush();
            }


        }
        remove()
        {

        }
        clone()
        {

        }
    }
}
