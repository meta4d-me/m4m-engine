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
    export declare let physics: PhysicsEngine;
    export declare let physics2D: physicEngine2D;
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 场景是基础的功能，有场景图，相当于Unity的Level
     * @version m4m 1.0
     */
    export class scene
    {
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 全局的application实例
         * @version m4m 1.0
         */
        app: application;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 全局的webgl实例
         * @version m4m 1.0
         */
        webgl: WebGL2RenderingContext;
        /**
         * 引擎场景
         * @param 引擎 app
         */
        constructor(app: application)
        {
            this.app = app;
            this.webgl = app.webgl;
            this.assetmgr = app.getAssetMgr();

            this.rootNode = new transform();
            this.rootNode.scene = this;
            this.renderList = new renderList();
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 场景名称
         * @version m4m 1.0
         */
        name: string;

        /** 自动收集场景中灯光 和 相机 */
        autoCollectlightCamera = true;
        private rootNode: transform;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 渲染列表
         * @version m4m 1.0
         */
        renderList: renderList;
        private assetmgr: assetMgr;
        private _overlay2ds: Array<overlay2D>;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 添加ScreenSpaceOverlay
         * @version m4m 1.0
         */
        addScreenSpaceOverlay(overlay: overlay2D)
        {
            if (!overlay) return;
            if (!this._overlay2ds) this._overlay2ds = [];
            let ol2ds = this._overlay2ds;
            if (ol2ds.indexOf(overlay) != -1) return;
            ol2ds.push(overlay);
            this.sortOverLays(ol2ds);
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 删除ScreenSpaceOverlay
         * @version m4m 1.0
         */
        removeScreenSpaceOverlay(overlay)
        {
            let  ol2ds = this._overlay2ds;
            if (!overlay || !ol2ds) return;
            let idx = ol2ds.indexOf(overlay);
            if (idx != -1) ol2ds.splice(idx, 1);
            this.sortOverLays(ol2ds);
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 参与渲染的相机
         * @version m4m 1.0
         */
        public renderCameras: camera[] = [];//需要camera class

        private _mainCamera: camera = null;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取当前主相机
         * @version m4m 1.0
         */
        public get mainCamera()
        {
            if (this._mainCamera == null)
            {
                this._mainCamera = this.renderCameras[0];
            }
            return this._mainCamera;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 设置当前主相机
         * @param _camera 相机组件实例
         * @version m4m 1.0
         */
        public set mainCamera(_camera: camera)
        {
            for (let i in this.renderCameras)
            {
                if (this.renderCameras[i] == _camera)
                {
                    this._mainCamera = _camera;
                }
            }
        }
        public renderContext: renderContext[] = [];
        private renderLights: light[] = [];//需要光源 class
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * lightmap列表
         * @version m4m 1.0
         */
        lightmaps: texture[] = [];//lightmap
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 雾效
         * @version m4m 1.0
         */
        fog: Fog;

        /** 当Late更新 触发函数 */
        onLateUpdate: (delta: number) => any;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 场景的刷新函数
         * @param delta
         * @version m4m 1.0
         */
        update(delta: number)
        {


            //更新矩阵
            //this.rootNode.updateTran(false);
            //this.rootNode.updateAABBChild();//更新完tarn再更新子物体aabb 确保每个transform的aabb正确
            material["lastDrawMatID"] = material["lastDrawMeshID"] = render.glDrawPass["lastPassID"] = -1;  //每帧 清理 material 的记录 ， 避免 显示bug

            //更新跑一遍，刷出渲染列表
            if(this.autoCollectlightCamera){
                this.renderCameras.length = 0;
                this.renderLights.length = 0;
            }
            this.renderList.clear();

            // aniplayer.playerCaches = [];
            this.updateSceneOverLay(delta); 

            //递归的更新与填充渲染列表
            this.updateScene(this.rootNode, delta);
            if (this.onLateUpdate)
                this.onLateUpdate(delta);

            if (physics2D && physics2D.engineRunner)
            {
                physics2D.engineRunner.tick(delta);
            }

            if (physics)
            {
                physics._step(delta);
            }

            //清理空引用
            if (this._mainCamera && !this._mainCamera.gameObject)
            {
                this._mainCamera = null;
            }
            //排序camera 并绘制
            if (this.renderCameras.length > 1)
            {
                this.renderCameras.sort((a, b) =>
                {
                    return a.order - b.order;
                });
            }


            this.RealCameraNumber = 0;
            var len = this.renderCameras.length;
            for (var i = 0; i < len; i++)
            {
                render.glDrawPass.resetLastState();
                if (i == len - 1)
                {
                    this.renderCameras[i].isLastCamera = true;
                }
                if (this.app.beRendering)
                {
                    this._renderCamera(i);
                }
                this.renderCameras[i].isLastCamera = false;
            }

            // this.updateSceneOverLay(delta);
            this.rendererSceneOverLay();

            if (this.RealCameraNumber == 0 && this.app && this.app.beRendering)
            {
                this.webgl.clearColor(0, 0, 0, 1);
                this.webgl.clearDepth(1.0);
                this.webgl.clear(this.webgl.COLOR_BUFFER_BIT | this.webgl.DEPTH_BUFFER_BIT);
                this.webgl.flush();
            }

            if (DrawCallInfo.BeActived)
            {
                DrawCallInfo.inc.showPerFrame();
                DrawCallInfo.inc.reset();
            }
        }

        /**
         * 渲染场景 2dUI overlay
         */
        private rendererSceneOverLay(){
            let ol2ds = this._overlay2ds;
            if (!ol2ds || ol2ds.length < 1) return;

            let targetcamera = this.mainCamera;
            if ( !targetcamera) return;
            let rCams = this.renderCameras;
            let mainCamIdx = rCams.indexOf(targetcamera);
            if (mainCamIdx == -1)
            {
                let cname = targetcamera.gameObject.getName();
                let oktag = false;
                for (var i = 0, l = rCams.length; i < l; i++)
                {
                    let cam = rCams[i];
                    if (cam && cam.gameObject.getName() == cname)
                    {
                        targetcamera = this.mainCamera = cam;
                        oktag = true;
                        break;
                    }
                }
                if (!oktag)
                {
                    this._mainCamera = null;
                    targetcamera = this.mainCamera;
                }
            }
            mainCamIdx = rCams.indexOf(targetcamera);
            if (!targetcamera) return;
            let len = ol2ds.length;
            for (var i = 0, l = len; i < l; ++i)
            {
                var overlay = ol2ds[i];
                if (overlay && this.app && this.app.beRendering)
                {
                    overlay.render(this.renderContext[mainCamIdx], this.assetmgr, targetcamera);
                }
            }
        }

        /**
         * 更新 场景 覆盖层
         * @param delta 上帧时间变量
         */
        private updateSceneOverLay(delta: number)
        {
            let ol2ds = this._overlay2ds;
            if (!ol2ds || ol2ds.length < 1) return;
            let targetcamera = this.mainCamera;
            if (!targetcamera) return;
            if(this.renderCameras.indexOf(targetcamera) == -1) return;
            for (var i = 0, l = ol2ds.length; i < l; ++i)
            {
                var overlay = ol2ds[i];
                if (overlay)
                {
                    overlay.start(targetcamera);
                    overlay.update(delta);
                }
            }
        }

        private RealCameraNumber: number = 0;
        /**
         * 渲染相机
         * 这个函数后面还有别的过程，应该留给camera
         * @param camindex 相机索引
         */
        private _renderCamera(camindex: number)
        {
            //增加当前编辑器状态，管控场编相机
            //一个camera 不是一次单纯的绘制，camera 还有多个绘制遍
            var cam = this.renderCameras[camindex];
            var context = this.renderContext[camindex];
            context.fog = this.fog;
            if ((this.app.bePlay && !cam.isEditorCam) || (!this.app.bePlay && cam.isEditorCam))
            {
                context.updateCamera(this.app, cam);
                context.updateLights(this.renderLights);
                cam.fillRenderer(this);
                cam.renderScene(this, context, camindex);
                this.RealCameraNumber++;

                // //还有overlay
                let overLays: IOverLay[] = cam.getOverLays();
                for (var i = 0; i < overLays.length; i++)
                {
                    if (cam.CullingMask & CullingMask.ui)
                    {
                        overLays[i].render(context, this.assetmgr, cam);
                    }
                }
            }
            if (!this.app.bePlay && this.app.be2dstate)
            {
                if (camindex == this.app.curcameraindex)
                {
                    let overLays: IOverLay[] = cam.getOverLays();
                    for (var i = 0; i < overLays.length; i++)
                    {
                        if (cam.CullingMask & CullingMask.ui)
                        {
                            overLays[i].render(context, this.assetmgr, cam);
                        }
                    }
                }
            }
        }

        /**
         * 给 覆盖层列表 排序
         * @param lays 覆盖层列表
         */
        private sortOverLays(lays: IOverLay[])
        {
            if (!lays || lays.length < 1) return;
            lays.sort((a, b) =>
            {
                return a.sortOrder - b.sortOrder;
            });
        }

        /**
         * 更新场景
         * @param node 场景节点 
         * @param delta 上帧时间变量
         */
        private updateScene(node: transform, delta)
        {
            if (this.app.bePlay)
            {
                this.objupdate(node, delta);
            }
            else
            {
                this.objupdateInEditor(node, delta);
            }
        }

        /**
         * 在编辑器模式 节点更新
         * @param node 节点
         * @param delta 上帧时间变量
         */
        private objupdateInEditor(node: transform, delta)//场编下
        {
            node.gameObject.init();//组件还未初始化的初始化
            if (node.gameObject.renderer != null)
            {
                node.gameObject.renderer.update(delta);//update 了啥
            }

            if (node.gameObject.camera)
            {
                node.gameObject.camera.update(delta);//update 了啥
            }

            if(this.autoCollectlightCamera)
                this.collectCameraAndLight(node);

            if (node.children != null)
            {
                for (var i = 0; i < node.children.length; i++)
                {
                    this.objupdateInEditor(node.children[i], delta);
                }
            }
        }

        /**
         * 节点更新
         * @param node 节点
         * @param delta 上帧时间变量
         */
        private objupdate(node: transform, delta)
        {
            let needInit = node.hasInitComp || node.hasInitCompChild || node.hasOnPlayComp || node.hasOnPlayCompChild;
            let needUpate = node.needUpdate;
            if(needUpate)   needUpate =  node.hasUpdateComp || node.hasUpdateCompChild;
            if(!needInit && !needUpate) return; //init 和 update 都不需要 直接return

            if(node.hasInitCompChild){
                node.hasInitCompChild = false;
            }

            let go = node.gameObject;
            // if (go.needInit){
            if (node.hasInitComp){
                go.init(this.app.bePlay);//组件还未初始化的初始化
            }
            if (node.hasUpdateComp || node.hasOnPlayComp || node.hasOnPlayCompChild)
            {
                go.update(delta);
            }

            // if(this.autoCollectlightCamera)          //流程放入 camera 和 light 的update中了
            //     this.collectCameraAndLight(node);
       
            //这里要检测长度 因为在update 或init中 children会改变
            for (var i = 0 ; i < node.children.length; ++i)
                this.objupdate(node.children[i], delta);
        }

        /*
        private objupdate(node: transform, delta)//play状态下
        {
            if (!node) return;
            if (node.hasComponent == false && node.hasComponentChild == false)
                return;
            node.gameObject.init(this.app.bePlay);//组件还未初始化的初始化
            if (node.gameObject.haveComponet)
            {
                node.gameObject.update(delta);

                this.collectCameraAndLight(node);
            }
            if (node.children)
            {

                for (var i = 0, l = node.children.length; i < l; i++)
                {
                    this.objupdate(node.children[i], delta);
                }
            }
        }
        */

        /**
         * 收集场景中有效的相机和光源
         * @param node 节点
         */
        private collectCameraAndLight(node: transform)
        {
            //update 的时候只收集摄像机和灯光信息
            //收集摄像机
            var c = node.gameObject.camera;
            if (c != null && c.gameObject.visibleInScene)
            {
                this.renderCameras.push(c);
            }
            var cl = this.renderCameras.length;
            while (this.renderContext.length < cl)
            {
                this.renderContext.push(new renderContext(this.webgl));
            }
            //收集灯光
            var l = node.gameObject.light;
            if (l != null && node.gameObject.visible)
            {
                this.renderLights.push(l);
            }
        }

        /**
         * 添加灯光到场景中（autoCollectlightCamera : false 时  有效 ）
         * @param l 灯光组件
         */
        addLight(l : light){
            if(this.renderLights.indexOf(l) != -1) return;
            this.renderLights.push(l);
        }
        /**
         * 清除场景中添加过的灯光 （autoCollectlightCamera : false 时  有效 ）
        */
        clearLights(){
            this.renderLights.length = 0;
        }

        /**
         * 添加相机到场景中（autoCollectlightCamera : false 时  有效 ）
         * @param l 灯光组件
         */
        addCamera(cam : camera){
            if(this.renderCameras.indexOf(cam) != -1) return;
            this.renderCameras.push(cam);
            this.renderContext.push(new renderContext(this.webgl));
        }
        /**
         * 清除场景中添加过的相机 （autoCollectlightCamera : false 时 有效 ）
        */
        clearCameras(){
            this.renderCameras.length = 0;
            this.renderContext.length = 0;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 场景根节点下添加物体
         * @param node 要添加的transform
         * @version m4m 1.0
         */
        addChild(node: transform)
        {
            this.rootNode.addChild(node);
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 场景根节点下移出物体
         * @param node 要移出的transform
         * @version m4m 1.0
         */
        removeChild(node: transform)
        {
            this.rootNode.removeChild(node);
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取children列表
         * @version m4m 1.0
         */
        getChildren(): transform[]
        {
            return this.rootNode.children;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取children数量
         * @version m4m 1.0
         */
        getChildCount(): number
        {
            if (this.rootNode.children == null) return 0;
            return this.rootNode.children.length;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 根据索引获取child
         * @param index 索引
         * @version m4m 1.0
         */
        getChild(index: number): transform
        {
            return this.rootNode.children[index];
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 根据name获取child
         * @param name
         * @version m4m 1.0
         */
        getChildByName(name: string): transform
        {
            let res = this.rootNode.find(name);
            return res;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取场景根节点
         * @version m4m 1.0
         */
        getRoot()
        {
            return this.rootNode;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取射线路径上的所有物体
         * @param ray 射线实例
         * @param isPickMesh 是否为拾取mesh 否为拾取collider
         * @version m4m 1.0
         */
        public pickAll(ray: ray, outInfos: pickinfo[], isPickMesh: boolean = false, root: transform = this.getRoot(), layermask: number = NaN): boolean
        {
            if (!outInfos || !ray) return false;
            let isHited = this.doPick(ray, true, isPickMesh, root, outInfos, layermask);
            return isHited;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取射线拾取到的最近物体
         * @param ray 射线实例
         * @param isPickMesh 是否为拾取mesh 否为拾取collider
         * @version m4m 1.0
         */
        public pick(ray: ray, outInfo: pickinfo, isPickMesh: boolean = false, root: transform = this.getRoot(), layermask: number = NaN): boolean
        {
            if (!outInfo || !ray) return false;
            let isHited = this.doPick(ray, false, isPickMesh, root, outInfo, layermask);
            return isHited;

            //pickinfo.pickedtran.gameObject.collider.subTran.gameObject.visible = !pickinfo.pickedtran.gameObject.collider.subTran.gameObject.visible;
            //pickinfo.pickedtran.markDirty();

        }
        /**
         * 执行 拾取
         * @param ray 射线
         * @param pickall 拾取所有？
         * @param isPickMesh 拾取Mesh？
         * @param root 节点
         * @param out 输出拾取信息
         * @param layermask 层级遮罩选项
         * @returns 是拾取到了？
         */
        private doPick(ray: ray, pickall: boolean, isPickMesh: boolean, root: transform, out: any, layermask: number = NaN): boolean
        {
            let ishited = false;
            var pickedList: Array<pickinfo> = new Array<pickinfo>();
            if (isPickMesh)
            {
                ishited = this.pickMesh(ray, root, pickedList, layermask);
            }
            else
            {
                ishited = this.pickCollider(ray, root, pickedList, layermask);
            }

            if (pickedList.length == 0) return ishited;

            if (pickall)
            {
                out.length = 0;
                pickedList.forEach(element =>
                {
                    out.push(element);
                });
            }
            else
            {
                var index = 0;
                for (var i = 1; i < pickedList.length; i++)
                {
                    if (pickedList[i].distance < pickedList[index].distance) index = i;
                }
                //return pickedList[index];
                let temp = pickedList.splice(index, 1);
                (out as pickinfo).cloneFrom(temp[0]);
                pickedList.forEach(element =>
                {
                    math.pool.delete_pickInfo(element);
                });
                pickedList.length = 0;
            }

            return ishited;
        }

        /**
         * 执行 拾取Mesh
         * @param ray 射线
         * @param tran 节点
         * @param pickedList 拾取信息列表
         * @param layermask 层级遮罩选项
         * @returns 是拾取到了？
         */
        private pickMesh(ray: ray, tran: transform, pickedList: pickinfo[], layermask: number = NaN): boolean
        {
            let ishited = false;
            if (tran.gameObject != null)
            {
                if (!tran.gameObject.visible) return ishited;
                let canDo = true;
                //if(!isNaN(layermask) && layermask != tran.gameObject.layer) canDo = false;
                if (!isNaN(layermask) && (layermask & (1 << tran.gameObject.layer)) == 0) canDo = false;
                if (canDo)
                {
                    var meshFilter = tran.gameObject.getComponent("meshFilter") as m4m.framework.meshFilter;
                    if (meshFilter != null)
                    {
                        //3d normal mesh
                        var mesh = meshFilter.getMeshOutput();
                        if (mesh)
                        {
                            let pinfo = math.pool.new_pickInfo();
                            let bool = mesh.intersects(ray, tran.getWorldMatrix(), pinfo);
                            if (bool)
                            {
                                ishited = true;
                                pickedList.push(pinfo);
                                pinfo.pickedtran = tran;
                            }
                        }
                    }
                    else
                    {
                        var skinmesh = tran.gameObject.getComponent("skinnedMeshRenderer") as m4m.framework.skinnedMeshRenderer;
                        if (skinmesh != null)
                        {
                            //3d skinmesh
                            let pinfo = math.pool.new_pickInfo();
                            var bool = skinmesh.intersects(ray, pinfo);
                            if (bool)
                            {
                                ishited = true;
                                pickedList.push(pinfo);
                                pinfo.pickedtran = tran;
                            }
                        }

                    }
                }
            }
            if (tran.children != null)
            {
                for (var i = 0; i < tran.children.length; i++)
                {
                    let bool = this.pickMesh(ray, tran.children[i], pickedList, layermask);
                    if (!ishited)
                        ishited = bool;
                }
            }
            return ishited;
        }

        /**
         * 执行 拾取碰撞体
         * @param ray 射线
         * @param tran 节点
         * @param pickedList 拾取信息列表
         * @param layermask 层级遮罩选项
         * @returns 是拾取到了？
         */
        private pickCollider(ray: ray, tran: transform, pickedList: Array<pickinfo>, layermask: number = NaN): boolean
        {
            let ishited = false;
            if (tran.gameObject != null)
            {
                if (!tran.gameObject.visible) return ishited;
                if (tran.gameObject.collider != null)
                {
                    let canDo = true;
                    if (!isNaN(layermask) && (layermask & (1 << tran.gameObject.layer)) == 0) canDo = false;
                    //console.error(`${tran.gameObject.layer}  --  ${layermask}`);
                    if (canDo)
                    {
                        //挂了collider
                        let pinfo = math.pool.new_pickInfo();
                        var bool = ray.intersectCollider(tran, pinfo);
                        if (bool)
                        {
                            ishited = true;
                            pickedList.push(pinfo);
                            pinfo.pickedtran = tran;
                        }
                    }
                }
            }
            if (tran.children != null)
            {
                for (var i = 0; i < tran.children.length; i++)
                {
                    let bool = this.pickCollider(ray, tran.children[i], pickedList, layermask);
                    if (!ishited)
                        ishited = bool;
                }
            }
            return ishited;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 启用物理到当前场景
         * @param gravity 定义场景物理世界的重力向量
         * @param plugin 定义场景物理世界引擎插件
         * @version m4m 1.0
         */
        enablePhysics(gravity: math.vector3, plugin?: IPhysicsEnginePlugin)
        {
            if (physics)
            {
                return true;
            }

            if (!plugin) plugin = new OimoJSPlugin();

            try
            {
                physics = new PhysicsEngine(gravity, plugin);
                return true;
            } catch (e)
            {
                // console.error(e.message);
                throw e;
                return false;
            }

            //physic=new PhysicsEngine(new math.vector3(0,-9.8,0),new OimoJSPlugin());
        }

        /**
         * 启用2D物理
         * @param gravity 定义场景物理世界的重力向量
         * @param physicOption 物理选项
         * @returns 启用成功？
         */
        enable2DPhysics(gravity: math.vector2, physicOption: IEngine2DOP = null)
        {
            if (physics2D)
            {
                return true;
            }
            try
            {
                physics2D = new physicEngine2D(physicOption);
                physics2D.setGravity(gravity.x, gravity.y);
                return true;
            } catch (e)
            {
                // console.error(e.message);
                throw e;
                return false;
            }
        }

        /**
         * 刷新 GpuInstanc合批
         * 被 batcher 条件[isStatic= true , visible = true , needGpuInstancBatcher = true , isGpuInstancing() = true]
         * @param rootNode 指定刷新节点（默认为 场景根节点）
         */
        refreshGpuInstancBatcher(rootNode?: m4m.framework.transform){
            //清理历史 缓存
            this.renderList.clearBatcher();
            //遍历所有 渲染对象，有标记的（静态 && gpuInstancingTag ）加到batcher列表
            if(!rootNode) rootNode = this.rootNode;
            this.fillGpuInsBatcher(rootNode , rootNode.gameObject.isStatic);
        }

        /**
         * 填充 GpuInstanc合批
         * @param node 节点
         * @param isStatic 是静态？
         */
        private fillGpuInsBatcher(node : m4m.framework.transform , isStatic : boolean){
            if(!this.webgl.drawArraysInstanced)return;
            //检查渲染对象
            let go = node.gameObject;
            isStatic = isStatic || go.isStatic;
            if (!go || !go.visible || (node.hasRendererComp == false && node.hasRendererCompChild == false)) return;  //自己没有渲染组件 且 子物体也没有 return
            let renderer = go.renderer;
            if(renderer){
                this.renderList.addStaticInstanceRenderer( renderer as IRendererGpuIns , this.webgl , isStatic);
            }

            let children = node.children;
            if(children){
                for(let i=0 , len = children.length; i < len ;i++){
                    this.fillGpuInsBatcher(children[i] , isStatic);
                }
            }
        }
    }
}