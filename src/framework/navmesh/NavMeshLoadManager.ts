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
﻿namespace m4m.framework {
    export class NavMeshLoadManager {
    private static _instance: NavMeshLoadManager;

    /**
    *  navMesh偏移量,为方便地图与NavMesh重合设置的临时变量
    */
    private navMeshVertexOffset: m4m.math.vector3 = new m4m.math.vector3(0, 0, 0);

    /**
    *场景中的寻路Mesh
    */
    public navMesh: m4m.framework.mesh;
    private app: m4m.framework.application;
    public navigate: m4m.framework.Navigate;
    public navTrans: m4m.framework.transform;
    /**
     * 导航网格Json数据
     */
    public get navmeshJson(){return this._navmeshJson;}
    private _navmeshJson:string = "";

    /**
    * 加载NavMesh
    * @param navMeshUrl 要加载的navMesh完整路径
    * @param app
    * @param onstate 加载反馈信息
    */
    public loadNavMesh(navMeshUrl: string, app: m4m.framework.application, onstate?:(state:stateLoad)=>void) {
        if (!app) return;
        this.app = app;
        if (this.navTrans)
            this.navTrans.parent.removeChild(this.navTrans);

        app.getAssetMgr().load(navMeshUrl, m4m.framework.AssetTypeEnum.Auto, (s)=>{            
            if (s.isfinish){
                let data: m4m.framework.textasset = app.getAssetMgr().getAssetByName(navMeshUrl.substring(navMeshUrl.lastIndexOf("/")+1)) as m4m.framework.textasset;
                this.navmeshLoaded(data.content, ()=>{
                    if(onstate){
                        onstate(s);
                    }                   
                });                
            }else if (s.iserror){
                if(onstate){
                    onstate(s);
                }
            }            
        });
    }

    /**
    * 通过数据 装载NavMesh
    * @param dataStr navmesh 的字符串数据
    * @param callback 完成回调
    */
    public loadNavMeshByDate(dataStr:string, app: m4m.framework.application,callback:()=>any){
        if(!app) return;
        this.app = app;
        this.navmeshLoaded(dataStr,callback);
    }

    /**
     * 地图寻路网格加载完成
     * @param dataStr 寻路网格信息
     */
    private navmeshLoaded(dataStr: string, callback:any) {
        console.warn("navmeshLoaded");
        if(dataStr == null || dataStr == "")    return;
        this._navmeshJson = dataStr;
        if (this.navTrans != null) {
            // CScene.Instance.removePICKEvent();
            if(this.navTrans.parent)
                this.navTrans.parent.removeChild(this.navTrans);
            this.navTrans.dispose();
        }
        this.navTrans = new m4m.framework.transform();
        this.navTrans.name = "navMesh";
        let HF = m4m.framework.HideFlags;
        this.navTrans.gameObject.hideFlags = HF.HideInHierarchy | HF.DontSave | HF.NotEditable; //不保存不展示不编辑
        var meshD = new m4m.render.meshData();
        meshD.pos = [];
        meshD.trisindex = [];

        var navinfo = m4m.framework.navMeshInfo.LoadMeshInfo(dataStr);
        //var vertexArray: number[] = [];

        for (var i = 0; i < navinfo.vecs.length; i++) {
            var v = navinfo.vecs[i];
            let X = v.x - this.navMeshVertexOffset.x;
            let Y = v.y - this.navMeshVertexOffset.y;
            let Z = v.z - this.navMeshVertexOffset.z;
            meshD.pos[i] = new m4m.math.vector3(X, Y, Z);
        }

        var navindexmap = {};
        let indexDatas: number[] = [];
        for (var i = 0; i < navinfo.nodes.length; i++) {
            var poly = navinfo.nodes[i].poly;
            for (var fc = 0; fc < poly.length - 2; fc++) {
                var sindex = indexDatas.length / 3;
                navindexmap[sindex] = i;//做一个三角形序号映射表
                /**
                *此处处理顶点索引时按照画面的模式来的，即不需要重复的顶点，如果要在图上画出正确的线框，就用画线框的模式，即需要重复的顶点。
                其实无论哪种模式，只要跟webgl的api对应上就好。
                */
                indexDatas.push(poly[0]);
                indexDatas.push(poly[fc + 2]);
                indexDatas.push(poly[fc + 1]);
            }
        }
        meshD.trisindex = indexDatas;

        let meshFiter = this.navTrans.gameObject.addComponent("meshFilter") as m4m.framework.meshFilter;
        this.navMesh = this.createMesh(meshD, this.app.webgl);
        meshFiter.mesh = this.navMesh;
        // let meshR = this.navTrans.gameObject.addComponent("meshRenderer") as m4m.framework.meshRenderer;
        // meshR.materials[0] = new m4m.framework.material();
        // meshR.materials[0].setShader(this.app.getAssetMgr().getShader("shader/def"));

        this.app.getScene().addChild(this.navTrans);
        this.navTrans.markDirty();
        this.navigate = new m4m.framework.Navigate(navinfo, navindexmap);
        callback();
    }

    /**
     * 构建mesh 并返回
     * @param meshData mesh数据
     * @param webgl webgl上下文
     * @returns 输出的mesh
     */
    private createMesh(meshData: m4m.render.meshData, webgl: WebGL2RenderingContext): m4m.framework.mesh {
        var _mesh = new m4m.framework.mesh();
        // _mesh.setName("NavMesh" + ".mesh.bin");
        _mesh.data = meshData;
        var vf = m4m.render.VertexFormatMask.Position;
        var v32 = _mesh.data.genVertexDataArray(vf);
        var i16 = _mesh.data.genIndexDataArray();

        _mesh.glMesh = new m4m.render.glMesh();
        _mesh.glMesh.initBuffer(webgl, vf, _mesh.data.getVertexCount());
        _mesh.glMesh.uploadVertexSubData(webgl, v32);

        _mesh.glMesh.addIndex(webgl, i16.length);
        _mesh.glMesh.uploadIndexSubData(webgl, 0, i16);
        _mesh.glMesh.initVAO();

        _mesh.submesh = [];

        {
            var sm = new m4m.framework.subMeshInfo();
            sm.matIndex = 0;
            sm.start = 0;
            sm.size = i16.length;
            sm.line = false;
            _mesh.submesh.push(sm);
        }
        return _mesh;
    }

    /**
     * 渲染显示 导航网格
     * @param isshow 是否显示
     * @param material 渲染材质
     */
    public showNavmesh(isshow: boolean , material:m4m.framework.material = null) {
        if (this.navTrans) {
            this.navTrans.gameObject.visible = isshow;
            if (!isshow) {
                this.navTrans.localTranslate = new m4m.math.vector3(0, 0, 0)
                this.navTrans.markDirty();
                return;
            }

            let compent: m4m.framework.meshRenderer = this.navTrans.gameObject.getComponent("meshRenderer") as m4m.framework.meshRenderer;
            if (compent == null){
                compent = this.navTrans.gameObject.addComponent("meshRenderer") as m4m.framework.meshRenderer;
                if(material){
                    compent.materials = [];
                    compent.materials[0] = material;
                }
            }

            this.navTrans.localTranslate = new m4m.math.vector3(0, 0, 0)
            this.navTrans.markDirty();
        }
    }

    /**
     * 销毁
     */
    public dispose() {
        if (this.navTrans) {
            this.navTrans.parent.removeChild(this.navTrans);
            this.navTrans.dispose();
            this.navTrans = null;
            this.navMesh.dispose();
            this.navMesh = null;
            this.navigate.dispose();
            this.navigate = null;
        }
    }

    public static get Instance(): NavMeshLoadManager {
        if (NavMeshLoadManager._instance == null)
            NavMeshLoadManager._instance = new NavMeshLoadManager();
        return NavMeshLoadManager._instance;
    }

    /**
     * 计算获取 从开始点 移动到 结束点 的所有路径坐标列表
     * @param startPos 开始点
     * @param endPos 结束点
     * @returns 路径坐标列表
     */
    public moveToPoints(startPos: m4m.math.vector3, endPos: m4m.math.vector3): Array<m4m.math.vector3> {
        
        let navTrans = NavMeshLoadManager.Instance.navTrans;
        let nav = NavMeshLoadManager.Instance.navigate;
        if (!nav) return;
        let StratIndex = NavMeshLoadManager.findtriIndex(startPos, navTrans);
        if (StratIndex == undefined) {
            let dir = new m4m.math.vector3();
            let direc: m4m.math.vector3 = new m4m.math.vector3();
            m4m.math.vec3Subtract(endPos, startPos, dir);
            m4m.math.vec3Normalize(dir, dir);
            for (let i = 0; i < 5; i++) {
                m4m.math.vec3Clone(dir, direc);
                m4m.math.vec3ScaleByNum(direc, (i + 1) * 2, direc);
                let pos = new m4m.math.vector3();
                m4m.math.vec3Add(startPos, direc, pos);
                StratIndex = NavMeshLoadManager.findtriIndex(pos, navTrans);
                if (StratIndex != undefined) break;
            }
        }
        let endIndex = NavMeshLoadManager.findtriIndex(endPos, navTrans);
        let points = nav.pathPoints(startPos, endPos, StratIndex, endIndex);
        return points;
    }

    /**
     * 获取指定位置的三角形面索引
     * @param point 坐标
     * @param trans 导航网格场景节点对象
     * @returns 三角形面索引
     */
    public static findtriIndex(point: m4m.math.vector3, trans: m4m.framework.transform): number {
        let result = -1;
        var ray = new m4m.framework.ray(new m4m.math.vector3(point.x, point.y + 500, point.z), new m4m.math.vector3(0, -1, 0));
        var mesh: m4m.framework.mesh;
        var meshFilter = trans.gameObject.getComponent("meshFilter") as m4m.framework.meshFilter;
        if (meshFilter != null) {
            //3d normal mesh
            mesh = meshFilter.getMeshOutput();
        }
        if (!mesh) return;
        var tempInfo = math.pool.new_pickInfo();
        if (mesh.intersects(ray, trans.getWorldMatrix(),tempInfo))
            result = tempInfo.faceId;
        math.pool.delete_pickInfo(tempInfo);
        return result;
        }
    }

    
}