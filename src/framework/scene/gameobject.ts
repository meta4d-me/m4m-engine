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
     * @public
     */
    export enum HideFlags
    {
        //---------------单选项-------------------
        None = 0x00000000,
        /** Hierarchy 中隐藏 */
        HideInHierarchy = 0x00000001,
        /** Inspector 中隐藏 */
        HideInInspector = 0x00000002,
        /** 在Editor中不可保存 */
        DontSaveInEditor = 0x00000004,
        /** 不可编辑的 */
        NotEditable = 0x00000008,
        /** Build时不保存 */
        DontSaveInBuild = 0x00000010,
        /** 不卸载 不使用的资源 */
        DontUnloadUnusedAsset = 0x00000020,
        /** 不受视锥剔除 */
        DontFrustumCulling = 0x00000040,
        //--------------组合选项--------------
        /** 不保存 */
        DontSave = 0x00000034,
        /** 隐藏并不保存 */
        HideAndDontSave = 0x0000003D
    }

    // /**
    //  * @public
    //  * @language zh_CN
    //  * @classdesc
    //  * 组件实例接口
    //  * @version m4m 1.0
    //  */
    // export interface INodeComponent
    // {
    //     onPlay();
    //     start();
    //     update(delta: number);
    //     gameObject: gameObject;
    //     remove();
    //     clone();
    //     // jsonToAttribute(json: any, assetmgr: assetMgr);
    // }

    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 组件接口
     * @version m4m 1.0
     */
    @m4m.reflect.SerializeType
    export class nodeComponent
    {
        static readonly ClassName: string = "nodeComponent";

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 组件实例
         * @version m4m 1.0
         */
        @m4m.reflect.Field("INodeComponent")
        comp: INodeComponent;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 是否初始化过
         * @version m4m 1.0
         */
        init: boolean;

        /**
         * onPlay是否调用过了
         */
        OnPlayed: boolean = false;
        /**
         * 组件节点
         * @param comp 组件
         * @param init 初始化
         */
        constructor(comp: INodeComponent, init: boolean = false)
        {
            this.comp = comp;
            this.init = init;
        }
    }

    /**
     * @public
     * @language zh_CN
     * @classdesc
     * gameObject类 对应unity中gameObject概念
     * @version m4m 1.0
     */
    @m4m.reflect.SerializeType
    export class gameObject
    {
        static readonly ClassName: string = "gameObject";
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取物体所在场景实例
         * @version m4m 1.0
         */
        getScene(): scene
        {
            return this.transform.scene;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 对象layer (取值范围0~31)
         * @version m4m 1.0
         */
        @m4m.reflect.Field("number")
        @m4m.reflect.UIStyle("enum")
        layer: number = cullingmaskutil.maskTolayer(CullingMask.default);//物件有一个layer 取值范围0~31，各种功能都可以用layer mask 去过滤作用范围
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 对象字符标签
         * @version m4m 1.0
         */
        @m4m.reflect.Field("string")
        tag: string = StringUtil.builtinTag_Untagged;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 隐匿标记
         * @version m4m 1.0
         */
        @m4m.reflect.Field("number")
        hideFlags: HideFlags = HideFlags.None;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 对象是静态
         * @version m4m 1.0
         */
        @m4m.reflect.Field("boolean")
        isStatic: boolean = false;


        /**
         * @public
         * @language zh_CN
         * @classdesc
         * gameObject必须依赖transform存在
         * @version m4m 1.0
         */
        transform: transform;
        // dontdestroyonload:boolean = false;//加载新场景的时候是否销毁。
        // transform2d: transform2D;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 组件列表
         * @version m4m 1.0
         */
        @m4m.reflect.Field("nodeComponent[]")
        components: nodeComponent[] = [];
        componentTypes: { [key: string]: boolean } = {};
        private componentsInit: nodeComponent[] = [];
        // private componentsPlayed: nodeComponent[] = [];
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 渲染组件 可为空
         * @version m4m 1.0
         */
        renderer: IRenderer;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 相机组件 可为空
         * @version m4m 1.0
         */
        camera: camera;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 灯光组件 可为空
         * @param
         * @version m4m 1.0
         */
        light: light;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 碰撞盒组件 可为空
         * @version m4m 1.0
         */
        collider: ICollider;
        @m4m.reflect.Field("boolean")
        private _visible = true;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取在场景中的可见状态
         * @version m4m 1.0
         */
        get visibleInScene()
        {
            let obj: gameObject = this;
            while (obj.visible && obj.transform.parent)
            {
                obj = obj.transform.parent.gameObject;
            }
            return obj.visible;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取自身的可见状态
         * @version m4m 1.0
         */
        get visible(): boolean
        {
            return this._visible;
        };

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 设置自身的可见状态
         * @param val
         * @version m4m 1.0
         */
        set visible(val: boolean)
        {
            if (val != this._visible)
            {
                this._visible = val;
                // sceneMgr.app.markNotify(this.transform, NotifyType.ChangeVisible);
            }
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取对应transform的name
         * @version m4m 1.0
         */
        getName(): string
        {
            return this.transform.name;
            // return this.transform != null ? this.transform.name : this.transform2d.name;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 初始化 主要是组件的初始化
         * @version m4m 1.0
         */
        init(bePlay = false)
        {
            let comps = this.componentsInit; 
            if(comps.length <= 0 ) return;

            while(comps.length > 0){    //这里不要再改回 for循环 , 当组件init 时添加其他组件时，会造成问题
                let c = comps.shift();
                c.comp.start();
                c.init = true;
                if (bePlay)
                {
                    if ((StringUtil.ENABLED in c.comp) && !c.comp[StringUtil.ENABLED]) continue;  //组件enable影响
                    c.comp.onPlay();
                    c.OnPlayed = true;
                }
            }
            
            this.transform.hasInitCompChild = false;
            this.transform.hasInitComp = false;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 主update
         * @param delta
         * @version m4m 1.0
         */
        update(delta: number)
        {
            let len = this.components.length;
            for (var i = 0; i < len; i++)
            {
                let c = this.components[i];
                if (!c) continue;
                if (StringUtil.ENABLED in c.comp && !c.comp[StringUtil.ENABLED]) continue;

                if (!c.OnPlayed)   //还没有 调用 OnPlayed 
                {
                    c.comp.onPlay();   //运行时的 enabled 开启 后调用 onPlay()
                    c.OnPlayed = true;
                }
                this.transform.hasOnPlayComp = false;
                this.transform.hasOnPlayCompChild = false;
                if (c.comp.update)                
                    c.comp.update(delta);
            }

            if(len < 1){
                this.transform.hasOnPlayCompChild = false;
            }
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 添加组件实例
         * @param comp 组件实例
         * @version m4m 1.0
         */
        addComponentDirect(comp: INodeComponent): INodeComponent
        {
            if(!comp){
                console.error("this component is null");
                return;
            }
            if (comp.gameObject != null)
            {
                console.error("this components has added to a  gameObject");
                return;
            }
            comp.gameObject = this;

            let typeStr = getClassName(comp);
            if(this.componentTypes[typeStr]){
                console.error(this.getName()+"   已经有一个" + typeStr + "的组件了，不能俩"); 
                return;
            }
            

            // if (this.components == null)
            //     this.components = [];

            //这种不明确的初始化以后不要用，反射识别不到类型。一定要构建类型
            //this.components.push({ comp: comp, init: false });
            let nodeObj = new nodeComponent(comp, false);
            let add = true;

            if (reflect.getClassTag(comp["__proto__"], "renderer") == "1" || reflect.getClassTag(comp["__proto__"], "effectbatcher") == "1")
            {//comp是个渲染器

                if (this.renderer == null)
                {
                    this.renderer = comp as any;
                    // console.warn("add renderer:" + this.transform.name);
                    this.transform.markHaveRendererComp();
                }
                else
                {
                    add = false;
                    console.warn("已经有一个渲染器的组件了，不能俩");
                    //throw new Error("已经有一个渲染器的组件了，不能俩");
                }
            }
            if (reflect.getClassTag(comp["__proto__"], "camera") == "1")
            {//comp是个摄像机
                if (this.camera == null)
                {
                    this.camera = comp as any;
                    // console.warn("add camera:" + this.transform.name);
                }
                else
                {
                    add = false;
                    console.warn("已经有一个摄像机的组件了，不能俩");
                    //throw new Error("已经有一个摄像机的组件了，不能俩");
                }
            }
            if (reflect.getClassTag(comp["__proto__"], "light") == "1")
            {//comp是个light
                if (this.light == null)
                {
                    this.light = comp as any;
                    //console.warn("add light:" + this.transform.name);
                }
                else
                {
                    add = false;
                    console.warn("已经有一个灯光的组件了，不能俩");
                    //throw new Error("已经有一个灯光的组件了，不能俩");
                }
            }
            if (reflect.getClassTag(comp["__proto__"], "boxcollider") == "1" || reflect.getClassTag(comp["__proto__"], "meshcollider") == "1" || reflect.getClassTag(comp["__proto__"], "canvasRenderer") == "1" || reflect.getClassTag(comp["__proto__"], "spherecollider") == "1")
            {//comp是个collider
                if (this.collider == null)
                {
                    this.collider = comp as any;
                    // console.warn("add collider:" + this.transform.name);
                }
                else
                {
                    add = false;
                    console.warn("已经有一个碰撞盒的组件了，不能俩");
                    //throw new Error("已经有一个碰撞盒的组件了，不能俩");
                }
            }

            if(functionIsEmpty(comp.update)){
                comp.update =undefined;//update空转
            }else{
                this.transform.markHaveUpdateComp();
            }

            // if (comp.update.toString().length < 35)
            // {
            //     //update 空转
            //     comp.update = undefined;                
            // }

            if (add)
            {
                this.components.push(nodeObj);
                this.componentsInit.push(nodeObj);
                // if (reflect.getClassTag(comp["__proto__"], "camera") == "1")
                //     sceneMgr.app.markNotify(this.transform, NotifyType.AddCamera);
                // if (reflect.getClassTag(comp["__proto__"], "canvasRenderer") == "1")
                //     sceneMgr.app.markNotify(this.transform, NotifyType.AddCanvasRender);                
                this.transform.markHaveInitComp();
                this.transform.markHaveOnplayComp();
                // this.transform.markHaveComponent();
            }

            this.componentTypes[typeStr] = true;
            return comp;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 根据类型获取组件 只是自己身上找到的第一个
         * @param type 组件类型
         * @version m4m 1.0
         */
        getComponent(type: string): INodeComponent
        {
            for (var i = 0; i < this.components.length; i++)
            {
                // var cname = m4m.reflect.getClassName(this.components[i].comp["__proto__"]);
                let comp = this.components[i].comp;
                let cname = getClassName(comp);
                if (cname == type)
                {
                    return comp;
                }
            }
            return null;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取身上所有的组件
         * @version m4m 1.0
         */
        getComponents(): INodeComponent[]
        {
            let components: INodeComponent[] = [];
            for (var i = 0; i < this.components.length; i++)
            {
                components.push(this.components[i].comp);
            }
            return components;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取自己和所有子物体中 所有该类型的组件
         * @param type 组件类型
         * @version m4m 1.0
         */
        getComponentsInChildren(type: string): INodeComponent[]
        {
            let components: INodeComponent[] = [];
            this._getComponentsInChildren(type, this, components);
            return components;
        }
        /**
         * 获取指定类型的所有组件在子节点中
         * @param type 组件类型
         * @param obj go节点
         * @param array 输出的组件数组
         */
        private _getComponentsInChildren(type: string, obj: gameObject, array: INodeComponent[])
        {
            let len = obj.components.length;
            for(let i = 0; i < len ;i++)
            {
                let comp = obj.components[i].comp;
                let cname = getClassName(comp);
                if (cname == type)
                {
                    array.push(comp);
                }
            }
            let children = obj.transform.children;
            if(children != null){
                let len = children.length;
                for (let i = 0; i < len; i++)
                {
                    let _obj = children[i].gameObject;
                    this._getComponentsInChildren(type, _obj, array);
                }
            }
        }

        /**
        * 获取当前节点下及子节点第一个能找到的组件
        * @param type 组件名称
        */
        getFirstComponentInChildren(type: string): INodeComponent
        {
            return this.getNodeFirstComponent(this, type);
        }

        /**
         * 获取节点的第一个组件
         * @param node go节点
         * @param _type 组件类型
         */
        private getNodeFirstComponent(node: gameObject, type: string)
        {
            let len = node.components.length;
            // for (var i in node.components)
            for(let i =0 ;i < len ;i++)
            {
                let comp = node.components[i].comp;
                let cname = getClassName(comp);
                if (cname == type)
                {
                    return comp;
                }
            }
            let children = node.transform.children;
            if (children != null)
            {
                let len_1 = children.length;
                for (let j = 0; j < len_1; j++)
                {
                    let result = node.getNodeFirstComponent(children[j].gameObject, type);
                    if (result) return result;
                }
            }
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 根据组件类型获取自己这条分支上父物体中该类型的组件 一直上溯到根节点
         * @param type 组件类型
         * @version m4m 1.0
         */
        getComponentInParent(type: string): INodeComponent
        {
            let result: INodeComponent = null;
            let _parent = this.transform.parent;
            while (result == null && _parent != null)
            {
                result = _parent.gameObject.getComponent(type);
                _parent = _parent.parent;
            }
            return result;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 根据组件类型添加一个组件
         * @param type 组件类型
         * @version m4m 1.0
         */
        addComponent(type: string): INodeComponent
        {
            // if (this.componentTypes[type])
            //     throw new Error("已经有一个" + type + "的组件了，不能俩");

            var pp = m4m.reflect.getPrototype(type);
            if(!pp) throw new Error(`get null of ${type} to getPrototype`);
            var comp = m4m.reflect.createInstance(pp, { "nodecomp": "1" });
            // this.componentTypes[type] = true;
            return this.addComponentDirect(comp);
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 根据组件实例移出组件
         * @param comp 组件实例
         * @version m4m 1.0
         */
        removeComponent(comp: INodeComponent)
        {
            if(!comp) return;
            // let type = reflect.getClassName(comp); //组件继承时remove fial
            let constructor = Object.getPrototypeOf(comp).constructor;
            if(!constructor) return;
            let type = constructor.name;

            if (!this.componentTypes[type])
                return;
            delete this.componentTypes[type];
            var i = 0, len = this.components.length;
            while (i < len)
            {
                if (this.components[i].comp == comp)
                {
                    // if (this.components[i].init)
                    // {//已经初始化过
                    //     comp.remove();
                    //     comp.gameObject = null;
                    // }
                    // this.remove(comp);
                    this.clearOfCompRemove(this.components[i]);
                    this.components.splice(i, 1);
                    break;
                }
                ++i;
            }
            if (this.components.length < 1){
                this.transform.hasUpdateComp = false;
            }
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 根据组件类型移出组件
         * @param type 组件类型
         * @version m4m 1.0
         */
        removeComponentByTypeName(type: string)
        {
            if (!this.componentTypes[type])
                return;
            delete this.componentTypes[type];
            let result : INodeComponent = null;
            var i = 0, len = this.components.length;
            while (i < len)
            {
                // if (reflect.getClassName(this.components[i].comp) == type)
                if (getClassName(this.components[i].comp) == type)
                {
                    // if (this.components[i].init)
                    // {//已经初始化过
                    //     this.components[i].comp.remove();
                    //     this.components[i].comp.gameObject = null;
                    // }
                    // this.remove(this.components[i].comp);
                    this.clearOfCompRemove(this.components[i]);
                    let results = this.components.splice(i, 1);
                    if(results[0].comp) 
                        result = results[0].comp;

                    break;
                }
                ++i;
            }
            if (this.components.length < 1){
                this.transform.hasUpdateComp = false;
            }

            return result;
        }


        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 移出所有组件
         * @version m4m 1.0
         */
        removeAllComponents()
        {
            this.componentsInit.length = 0;

            let len = this.components.length;
            for (var i = 0; i < len; i++)
            {
                let comp = this.components[i].comp; 
                comp.remove();
                comp.gameObject = null;
            }

            this.camera = null;
            this.renderer = null;
            this.light = null;
            this.collider = null;

            this.components.length = 0;
            this.componentTypes = {};

            let tran = this.transform;
            tran.hasUpdateComp = false;
            tran.hasRendererComp = false;
            tran.hasInitComp = false;
            tran.hasOnPlayComp = false;
        }

        /**
         * 清理 移除的组件
         * @param cComp 组件
         */
        private clearOfCompRemove(cComp: nodeComponent){
            let comp = cComp.comp;
            if(cComp.init){
                comp.remove();
            }else{
                let i = this.componentsInit.indexOf(cComp);
                if(i != -1) this.componentsInit.splice(i, 1);
            }

            if (comp == this.camera ) this.camera = null;
            if (comp == this.renderer){
                this.transform.hasRendererComp = false;
                this.renderer = null;
            }
            if (comp == this.light ) this.light = null;
            if (comp == (this.collider as any)) this.collider = null;
            comp.gameObject = null;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 释放gameObject
         * @version m4m 1.0
         */
        dispose()
        {
            this.removeAllComponents();
        }

    }



}