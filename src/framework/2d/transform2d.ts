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
/// <reference path="../../render/struct.ts" />

namespace m4m.framework
{
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * UI布局选项
     * @version m4m 1.0
     */
    export enum layoutOption
    {
        NOTHING = 0,
        LEFT = 1,
        TOP = 2,
        RIGHT = 4,
        BOTTOM = 8,
        H_CENTER = 16,
        V_CENTER = 32
    }

    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 2d Point事件流接口
     * @version m4m 1.0
     */
    export interface I2DPointListener
    {
        /**
         * Point(点)事件触发
         * @param canvas 引擎 canvas 对象
         * @param ev Point(点)事件
         * @param oncap 是捕获阶段？
         */
        onPointEvent(canvas: canvas, ev: PointEvent, oncap: boolean);
    }

    /**
     * 实例对象是 I2DPointListener
     * @param object
     */
    export function instanceOfI2DPointListener(object)
    {
        return "onPointEvent" in object;
    }

    // /**
    //  * @public
    //  * @language zh_CN
    //  * @classdesc
    //  * 2d组件的接口
    //  * @version m4m 1.0
    //  */
    // export interface I2DComponent {
    //     onPlay();
    //     start();
    //     update(delta: number);
    //     transform: transform2D;
    //     remove();
    // }

    // /**
    //  * @public
    //  * @language zh_CN
    //  * @classdesc
    //  * 2d碰撞器接口
    //  * @version m4m 1.0
    //  */
    // export interface ICollider2d {
    //     transform: transform2D;
    //     getBound(): obb2d;
    //     intersectsTransform(tran: transform2D): boolean;
    // }

    // /**
    //  * @public
    //  * @language zh_CN
    //  * @classdesc
    //  * 2D渲染组件的接口
    //  * @version m4m 1.0
    //  */
    // export interface IRectRenderer extends I2DComponent {
    //     render(canvas: canvas);
    //     //刷新顶点信息
    //     updateTran();
    //     //获取渲染材质
    //     getMaterial():m4m.framework.material;
    //     //获取渲染边界(合并渲染深度排序会使用到)
    //     getDrawBounds():m4m.math.rect;
    // }

    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 2D组件实例接口
     * @version m4m 1.0
     */
    @m4m.reflect.SerializeType
    export class C2DComponent
    {
        static readonly ClassName: string = "C2DComponent";

        @m4m.reflect.Field("I2DComponent")
        comp: I2DComponent;
        init: boolean;
        OnPlayed: boolean = false;
        /**
         * 2D组件实例接口
         * @param comp 组件
         * @param init 初始化？
         */
        constructor(comp: I2DComponent, init: boolean = false)
        {
            this.comp = comp;
            this.init = init;
        }
    }

    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 2d的节点类<p/>
     * 相当于3d的tranform和gameobject的合集<p/>
     * 自身包含父子关系和组件
     * @version m4m 1.0
     */
    @m4m.reflect.SerializeType
    export class transform2D
    {
        static readonly ClassName: string = "transform2D";

        private static readonly help_v2 = new m4m.math.vector2();
        private static readonly help_v2_1 = new m4m.math.vector2();
        private static readonly help_v2_2 = new m4m.math.vector2();
        private static readonly help_v2_3 = new m4m.math.vector2();

        private static readonly help_mtx = new m4m.math.matrix3x2();
        private static readonly help_mtx_1 = new m4m.math.matrix3x2();

        // public notify: INotify;
        private _canvas: canvas;

        //insID : transform2D 收集 map
        private static _transform2DMap: { [guid: number]: transform2D } = {};
        /**
         * 获取transform2D 通过 insID
         * @param id transform2D
         */
        static getTransform2DById(insID: number)
        {
            return this._transform2DMap[insID];
        }


        /**
        * @public
        * @language zh_CN
        * @classdesc
        * 当前节点依赖的prefab路径，如果不依赖，则为空
        * @version m4m 1.0
        */
        @m4m.reflect.Field("string")
        prefab: string = "";

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 当前2d节点所属的canvas
         * @version m4m 1.0
         */
        set canvas(val: canvas)
        {
            if (!val) return;
            this._canvas = val;
        }
        get canvas(): canvas
        {
            if (this._canvas == null)
            {
                if (this._parent == null)
                    return null;
                return this._parent.canvas;
            }
            return this._canvas;
        }

        /**
         * 启用 UI 布局功能
         */
        enableUILayout = true;

        /**
         * 启用 UI 矩形遮罩裁剪显示 功能
         */
        enableUIMaskRect = true;

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
         * 当前2d节点的名字
         * @version m4m 1.0
         */
        @m4m.reflect.Field("string")
        name: string = "noname";

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
         * 当前2d节点的父亲节点
         * @version m4m 1.0
         */
        private _parent: transform2D;
        get parent()
        {
            return this._parent;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 当前2d节点的孩子节点
         * @version m4m 1.0
         */
        @m4m.reflect.Field("transform2D[]")
        get children()
        {
            return this._children;
        }
        set children(children: transform2D[])
        {
            this._children = children;
        }
        private _children: transform2D[] = [];

        // private _children: transform[] = [];
        // /**
        //  * @public
        //  * @language zh_CN
        //  * @classdesc
        //  * 子物体列表
        //  * @version m4m 1.0
        //  */
        // @m4m.reflect.Field("transform[]")

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 当前2d节点的宽
         * @version m4m 1.0
         */
        @m4m.reflect.Field("number")
        width: number = 0;//2d位置

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 当前2d节点的高
         * @version m4m 1.0
         */
        @m4m.reflect.Field("number")
        height: number = 0;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 当前2d节点的中心点位置
         * @version m4m 1.0
         */
        @m4m.reflect.Field("vector2")
        pivot: math.vector2 = new math.vector2(0, 0);

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 当前2d节点的hideFlag，用来控制2d节点各种形态下的显示隐藏
         * @version m4m 1.0
         */
        hideFlags: HideFlags = HideFlags.None;

        @m4m.reflect.Field("boolean")
        private _visible = true;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 当前2d节点在场景中是否可见</p>
         * 如果其父节点不可见，其同样不可见
         * @version m4m 1.0
         */
        get visibleInScene()
        {
            let obj: transform2D = this;
            while (obj.visible)
            {
                obj = obj._parent;
            }
            return obj.visible;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 当前2d节点的隐藏状态
         * @version m4m 1.0
         */
        get visible(): boolean
        {
            return this._visible;
        };
        set visible(val: boolean)
        {
            if (val != this._visible)
            {
                this._visible = val;
                // sceneMgr.app.markNotify(this, NotifyType.ChangeVisible);
            }
        }

        /**
         * @private
         * @language zh_CN
         * @classdesc
         * 获取自身
         * @version m4m 1.0
         */
        get transform()
        {
            return this;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 当前节点的唯一id
         * @version m4m 1.0
         */
        public insId: insID = new insID();
        private dirty: boolean = true;//自己是否需要更新
        private dirtyChild: boolean = true;//子层是否需要更新
        private dirtyWorldDecompose: boolean = false;
        private dirtyAABB: boolean = false;//AABB 标记脏

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 当前2d节点的位置
         * @version m4m 1.0
         */
        @m4m.reflect.Field("vector2")
        localTranslate: math.vector2 = new math.vector2(0, 0);

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 当前2d节点的缩放
         * @version m4m 1.0
         */
        @m4m.reflect.Field("vector2")
        localScale: math.vector2 = new math.vector2(1, 1);

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 当前2d节点的旋转
         * @version m4m 1.0
         */
        @m4m.reflect.Field("number")
        localRotate: number = 0;//旋转

        private _maskrectId = "";
        /** 裁剪遮罩矩形 ID */
        get maskRectId() { return this._maskrectId; }


        private _maskRect: math.rect;
        private _temp_maskRect: math.rect;
        /** 裁剪遮罩矩形 */
        get maskRect()
        {
            if (this._temp_maskRect == null) this._temp_maskRect = new math.rect();
            if (this._maskRect != null)
            {
                this._temp_maskRect.x = this._maskRect.x;
                this._temp_maskRect.y = this._maskRect.y;
                this._temp_maskRect.w = this._maskRect.w;
                this._temp_maskRect.h = this._maskRect.h;
            }
            return this._temp_maskRect;
        }
        private _isMask: boolean = false;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 当前节点是否是mask
         * @version m4m 1.0
         */
        @m4m.reflect.Field("boolean")
        get isMask()
        {
            return this._isMask;
        }
        set isMask(b: boolean)
        {
            this._isMask = b;
            this.markDirty();
            if (this._parent != null)
                this.updateTran(true);
        }

        private _aabbRect: math.rect = new math.rect();
        private _temp_aabbRect: math.rect;
        /** aabb 矩形 */
        get aabbRect()
        {
            if (this._temp_aabbRect == null) this._temp_aabbRect = new math.rect();
            if (this._aabbRect != null)
            {
                math.rectClone(this._aabbRect, this._temp_aabbRect);
            }

            if (this.dirtyAABB)
            {
                this.calcAABB(this.worldMatrix);
                this.dirtyAABB = false;
            }
            return this._temp_aabbRect;
        }

        private updateMaskRect()
        {
            let rect_x; let rect_y; let rect_w; let rect_h;
            let ParentRect;
            if (this._parent != null)
            {
                this._parentIsMask = this._parent.isMask || this._parent.parentIsMask;
                ParentRect = this._parent.maskRect;
            } else
                this._parentIsMask = false;
            if (this.isMask || this.parentIsMask)
            {
                this._maskrectId = "";
                if (this.parentIsMask)
                {
                    this._maskrectId = this._parent._maskrectId;
                }

                if (this.isMask)
                {
                    this._maskrectId += `_${this.insId.getInsID()}`;
                    //计算 maskrect
                    let wPos = this.getWorldTranslate();
                    let wW = this.canvas.pixelWidth;
                    let wH = this.canvas.pixelHeight;
                    rect_x = wPos.x / wW;
                    rect_y = wPos.y / wH;
                    rect_w = this.width / wW;
                    rect_h = this.height / wH;
                    if (this.parentIsMask && ParentRect != null)
                    {
                        //计算 rect  ∩  parentRect
                        let min_x = Math.max(rect_x, ParentRect.x);
                        let min_y = Math.max(rect_y, ParentRect.y);
                        let max_x = Math.min(rect_x + rect_w, ParentRect.x + ParentRect.w);
                        let max_y = Math.min(rect_y + rect_h, ParentRect.y + ParentRect.h);

                        rect_x = min_x;
                        rect_y = min_y;
                        rect_w = max_x - min_x;
                        rect_h = max_y - min_y;
                    }
                } else if (ParentRect != null)
                {
                    rect_x = ParentRect.x; rect_y = ParentRect.y; rect_w = ParentRect.w; rect_h = ParentRect.h;
                }
                if (this._maskRect == null) this._maskRect = new math.rect();

                if (this._maskRect.x != rect_x || this._maskRect.x != rect_y || this._maskRect.x != rect_w || this._maskRect.x != rect_h)
                {
                    this._maskRect.x = rect_x;
                    this._maskRect.y = rect_y;
                    this._maskRect.w = rect_w;
                    this._maskRect.h = rect_h;
                }
            }
        }


        private _parentIsMask = false;
        get parentIsMask()
        {
            return this._parentIsMask;
        }

        private localMatrix: math.matrix3x2 = new m4m.math.matrix3x2;//2d矩阵
        //这个是如果爹改了就要跟着算的

        private worldMatrix: m4m.math.matrix3x2 = new m4m.math.matrix3x2();
        private canvasWorldMatrix: m4m.math.matrix3x2 = new m4m.math.matrix3x2();
        private worldRotate: math.angelref = new math.angelref();
        private worldTranslate: m4m.math.vector2 = new m4m.math.vector2(0, 0);
        private worldScale: m4m.math.vector2 = new m4m.math.vector2(1, 1);

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 为当前2d节点添加子节点
         * @param node 要添加的子节点
         * @version m4m 1.0
         */
        addChild(node: transform2D)
        {
            // if (node.parent != null) {
            //     node.parent.removeChild(node);
            // }
            // if (this.children == null)
            //     this.children = [];
            // this.children.push(node);
            // node.parent = this;
            // node.canvas = this.canvas;
            // sceneMgr.app.markNotify(node, NotifyType.AddChild);
            // this.markDirty();
            this.addChildAt(node, this._children.length);
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 为当前2d节点添加子节点,并插入到指定位置
         * @param node 要添加的子节点
         * @param index 要插入到的位置
         * @version m4m 1.0
         */
        addChildAt(node: transform2D, index: number)
        {
            if (index < 0 || !node)
            {
                return;
            }
            if (node._parent != null)
            {
                node._parent.removeChild(node);
            }
            if (this._children == null)
                this._children = [];

            this._children.splice(index, 0, node);

            node.canvas = this.canvas;
            node._parent = this;
            transform2D._transform2DMap[node.insId.getInsID()] = node;
            // sceneMgr.app.markNotify(node, NotifyType.AddChild);
            this.markDirty();
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 为当前2d节点移除子节点
         * @param 要移除的子节点
         * @version m4m 1.0
         */
        removeChild(node: transform2D)
        {
            if (!node)
            {
                console.warn(`target is null`);
                return;
            }
            if (node._parent != this || this._children == null)
            {
                console.warn("not my child.");
                return;
            }
            var i = this._children.indexOf(node);
            if (i < 0) return;
            this._children.splice(i, 1);
            node._parent = null;
            delete transform2D._transform2DMap[node.insId.getInsID()];
            // sceneMgr.app.markNotify(node, NotifyType.RemoveChild);
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 为当前2d节点移除所有子节点
         * @version m4m 1.0
         */
        removeAllChild(needDispose: boolean = false)
        {
            while (this._children.length > 0)
            {
                if (needDispose)
                    this._children[0].dispose();
                else
                    this.removeChild(this._children[0]);
            }
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 标记自身脏了
         * @version m4m 1.0
         */
        markDirty()
        {
            this.dirty = true;
            var p = this._parent;
            while (p != null)
            {
                p.dirtyChild = true;
                p = p._parent;
            }
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 用脏机制来检查自身和子节点。更新位置、缩放、旋转等信息
         * @param parentChange 父节点是否发生变化
         * @version m4m 1.0
         */
        updateTran(parentChange: boolean)
        {
            //无刷
            if (this.dirtyChild == false && this.dirty == false && parentChange == false)
                return;

            if (this.dirty)
            {
                m4m.math.matrix3x2MakeTransformRTS(this.localTranslate, this.localScale, this.localRotate, this.localMatrix);
            }
            if (this.dirty || parentChange)
            {
                if (this.enableUILayout)
                {
                    this.refreshLayout();
                }
                if (this.parent == null)
                {
                    m4m.math.matrix3x2Clone(this.localMatrix, this.worldMatrix);
                }
                else
                {
                    m4m.math.matrix3x2Multiply(this.parent.worldMatrix, this.localMatrix, this.worldMatrix);
                }

                this.dirtyWorldDecompose = true;
                if (this.enableUIMaskRect)
                {
                    this.updateMaskRect();
                }
                if (this.renderer != null)
                {
                    this.renderer.updateTran();
                }
            }

            //aabb
            this.dirtyAABB = true;

            if (this._children != null)
            {
                for (var i = 0, l = this._children.length; i < l; i++)
                {
                    this._children[i].updateTran(parentChange || this.dirty);
                }
            }
            this.dirty = false;
            this.dirtyChild = false;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 更新整个节点结构
         * @version m4m 1.0
         */
        updateWorldTran()
        {
            //parent 找到顶，第一个dirty的
            var p = this._parent;
            var dirtylist: transform2D[] = [];
            dirtylist.push(this);
            while (p != null)
            {
                if (p.dirty)
                    dirtylist.push(p);
                p = p._parent;
            }
            var top = dirtylist.pop();
            top.updateTran(false);
        }

        //计算AABB 包围盒
        private calcAABB(wMtx: math.matrix3x2)
        {
            let w = this.width;
            let h = this.height;
            let px = this.pivot.x;
            let py = this.pivot.y;
            let osX = px * w;
            let osY = py * h;

            let p0 = transform2D.help_v2;
            let p1 = transform2D.help_v2_1;
            let p2 = transform2D.help_v2_2;
            let p3 = transform2D.help_v2_3;
            m4m.math.vec2Set(p0, -osX, -osY);
            m4m.math.vec2Set(p1, w - osX, -osY);
            m4m.math.vec2Set(p2, w - osX, h - osY);
            m4m.math.vec2Set(p3, -osX, h - osY);

            m4m.math.matrix3x2TransformVector2(wMtx, p0, p0);
            m4m.math.matrix3x2TransformVector2(wMtx, p1, p1);
            m4m.math.matrix3x2TransformVector2(wMtx, p2, p2);
            m4m.math.matrix3x2TransformVector2(wMtx, p3, p3);

            if (this.canvas)
            {
                this.canvas.clipPosToCanvasPos(p0, p0);
                this.canvas.clipPosToCanvasPos(p1, p1);
                this.canvas.clipPosToCanvasPos(p2, p2);
                this.canvas.clipPosToCanvasPos(p3, p3);
            }

            let min = p0;
            let max = p1;
            math.vec2Set(min, Math.min(p0.x, p1.x, p2.x, p3.x), Math.min(p0.y, p1.y, p2.y, p3.y));
            math.vec2Set(max, Math.max(p0.x, p1.x, p2.x, p3.x), Math.max(p0.y, p1.y, p2.y, p3.y));

            math.rectSet(this._aabbRect, min.x, min.y, max.x - min.x, max.y - min.y);
        }

        //计算 to canvasMtx 矩阵
        private CalcReCanvasMtx(out: math.matrix3x2)
        {
            if (!out) return;
            // let tsca = m4m.math.pool.new_vector2();
            // let ttran = m4m.math.pool.new_vector2();

            let tsca = transform2D.help_v2;
            let ttran = transform2D.help_v2_1;
            tsca.x = this.canvas.pixelWidth / 2;
            tsca.y = - this.canvas.pixelHeight / 2;
            ttran.x = this.canvas.pixelWidth / 2;
            ttran.y = this.canvas.pixelHeight / 2;
            math.matrix3x2MakeTransformRTS(ttran, tsca, 0, out);
        }

        /**
         * @private
         * 转换并拆解canvas坐标空间 RTS
         */
        private decomposeWorldMatrix()
        {
            if (this.dirtyWorldDecompose)
            {
                // let reCanvasMtx = m4m.math.pool.new_matrix3x2();
                let reCanvasMtx = transform2D.help_mtx;
                // let tsca = m4m.math.pool.new_vector2();
                // let ttran = m4m.math.pool.new_vector2();
                // tsca.x = this.canvas.pixelWidth/2;
                // tsca.y = - this.canvas.pixelHeight/2;
                // ttran.x = this.canvas.pixelWidth/2;
                // ttran.y = this.canvas.pixelHeight/2;

                // math.matrix3x2MakeTransformRTS(ttran,tsca,0,reCanvsMtx);
                this.CalcReCanvasMtx(reCanvasMtx);

                math.matrix3x2Multiply(reCanvasMtx, this.worldMatrix, this.canvasWorldMatrix);

                math.matrix3x2Decompose(this.canvasWorldMatrix, this.worldScale, this.worldRotate, this.worldTranslate);

                // math.pool.delete_vector2(tsca);
                // math.pool.delete_vector2(ttran);
                // math.pool.delete_matrix3x2(reCanvasMtx);

                this.dirtyWorldDecompose = false;
            }
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取当前节点的相对于canvas的位置
         * @version m4m 1.0
         */
        getWorldTranslate()
        {
            this.decomposeWorldMatrix();
            return this.worldTranslate;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取当前节点的相对于canvas的缩放
         * @version m4m 1.0
         */
        getWorldScale()
        {
            this.decomposeWorldMatrix();
            return this.worldScale;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取当前节点的相对于canvas的旋转
         * @version m4m 1.0
         */
        getWorldRotate()
        {
            this.decomposeWorldMatrix();
            return this.worldRotate;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取当前节点的本地变换矩阵
         * @version m4m 1.0
         */
        getLocalMatrix(): m4m.math.matrix3x2
        {
            return this.localMatrix;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取当前节点的世界变换矩阵
         * @version m4m 1.0
         */
        getWorldMatrix(): m4m.math.matrix3x2
        {
            return this.worldMatrix;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取当前节点的Canvas_世界_变换矩阵
         * @version m4m 1.0
         */
        getCanvasWorldMatrix(): m4m.math.matrix3x2
        {
            this.decomposeWorldMatrix();
            return this.canvasWorldMatrix;
        }

        public static getTransInfoInCanvas(trans: transform2D, out: t2dInfo)//实际上是rootnode space
        {
            // var rotscale = m4m.math.pool.new_vector2();
            // let inversemat = m4m.math.pool.new_matrix3x2();
            // let mattoRoot = m4m.math.pool.new_matrix3x2();
            // var rotPos = m4m.math.pool.new_vector2();
            let mat = trans.getWorldMatrix();
            let rotmat = trans.canvas.getRoot().getWorldMatrix();
            let inversemat = transform2D.help_mtx;
            m4m.math.matrix3x2Inverse(rotmat, inversemat);
            let mattoRoot = transform2D.help_mtx_1;
            m4m.math.matrix3x2Multiply(inversemat, mat, mattoRoot);

            let rotscale = transform2D.help_v2;
            let rotRot: m4m.math.angelref = new m4m.math.angelref();
            let rotPos = transform2D.help_v2_1;
            math.matrix3x2Decompose(mattoRoot, rotscale, rotRot, rotPos);
            m4m.math.vec2Clone(trans.pivot, out.pivot);
            m4m.math.vec2Clone(rotPos, out.pivotPos);

            out.rot = rotRot.v;
            out.width = trans.width * rotscale.x;
            out.height = trans.height * rotscale.y;

            // m4m.math.pool.delete_matrix3x2(inversemat);
            // m4m.math.pool.delete_matrix3x2(mattoRoot);
            // m4m.math.pool.delete_vector2(rotscale);
            // m4m.math.pool.delete_vector2(rotPos);
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 设置当前节点的相对于canvas的位置
         * @param pos 相对于canvas的位置
         * @version m4m 1.0
         */
        setWorldPosition(pos: math.vector2)
        {
            // var dir = math.pool.new_vector2();
            // var pworld = math.pool.new_matrix3x2();
            // let matinv = math.pool.new_matrix3x2();
            // let dirinv = math.pool.new_vector2();
            this.dirty = true;
            this.updateWorldTran();

            let thispos = this.getWorldTranslate();
            let dir = transform2D.help_v2;
            dir.x = pos.x - thispos.x;
            dir.y = pos.y - thispos.y;

            let pworld = transform2D.help_mtx;
            if (this._parent != null)
            {
                math.matrix3x2Clone(this._parent.worldMatrix, pworld);
            }
            else
            {
                math.matrix3x2MakeIdentity(pworld);
            }
            let matinv = transform2D.help_mtx_1;
            math.matrix3x2Inverse(pworld, matinv);

            let dirinv = transform2D.help_v2_1;
            math.matrix3x2TransformNormal(matinv, dir, dirinv);

            this.localTranslate.x += dirinv.x;
            this.localTranslate.y += dirinv.y;

            // math.pool.delete_matrix3x2(matinv);
            // math.pool.delete_vector2(dir);
            // math.pool.delete_vector2(dirinv);
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取当前transform是否被释放掉了
         * @version m4m 1.0
         */
        get beDispose(): boolean
        {
            return this._beDispose;
        }
        private _beDispose: boolean = false;//是否被释放了

        public onDispose: () => void;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 释放当前节点，包括其子节点
         * @version m4m 1.0
         */
        dispose()
        {
            if (this._parent) this._parent.removeChild(this);
            this._dispose();
        }

        private _dispose()
        {
            if (this._beDispose) return;
            if (this._children)
            {
                for (var k in this._children)
                {
                    this._children[k]._dispose();
                }
                this.removeAllChild();
            }

            this.removeAllComponents();

            this._beDispose = true;
            if (this.onDispose)
                this.onDispose();
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 当前节点的渲染组件，一个节点同时只能存在一个渲染组件
         * @version m4m 1.0
         */
        renderer: IRectRenderer;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 碰撞盒组件 可为空
         * @version m4m 1.0
         */
        collider: ICollider2d;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 碰撞盒组件 可为空
         * @version m4m 1.0
         */
        physicsBody: I2DPhysicsBody;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 当前节点的所有组件
         * @version m4m 1.0
         */
        @m4m.reflect.Field("C2DComponent[]")
        components: C2DComponent[] = [];
        componentTypes: { [key: string]: boolean } = {};
        private componentsInit: C2DComponent[] = [];
        // private componentplayed :C2DComponent[]=[];

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 组件的初始化
         * @version m4m 1.0
         */
        init(bePlay = false)
        {

            let comps = this.componentsInit;
            if (comps.length <= 0) return;

            while (comps.length > 0)
            {    //这里不要再改回 for循环 , 当组件init 时添加其他组件时，会造成问题
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
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 为当前节点添加一个组件
         * @param type 组件名称
         * @version m4m 1.0
         */
        addComponent(type: string): I2DComponent
        {
            let pp = m4m.reflect.getPrototype(type);
            if (!pp) throw new Error(`get null of ${type} to getPrototype`);
            let comp = m4m.reflect.createInstance(pp, { "2dcomp": "1" });
            return this.addComponentDirect(comp);
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 为当前节点添加组件
         * @param comp 2d组件实例
         * @version m4m 1.0
         */
        addComponentDirect(comp: I2DComponent): I2DComponent
        {
            if (!comp)
            {
                console.error("this component is null");
                return;
            }
            if (comp.transform != null)
            {
                console.error("this components has added to a  gameObject");
                return;
            }
            comp.transform = this;
            let typeStr = getClassName(comp);
            if (this.componentTypes[typeStr])
            {
                console.error(this.name + "   已经有一个" + typeStr + "的组件了，不能俩");
                return;
            }

            if (this.components == null)
                this.components = [];
            let _comp: C2DComponent = new C2DComponent(comp, false);
            this.components.push(_comp);
            this.componentsInit.push(_comp);
            if (reflect.getClassTag(comp["__proto__"], "renderer") == "1")
            {//这货是个渲染器

                if (this.renderer == null)
                {
                    this.renderer = comp as any;
                    // console.warn("add renderer:" + this.name);
                }
                else
                {
                    console.error("已经有一个渲染器的组件了，不能俩");
                    return;
                }
            }
            if (reflect.getClassTag(comp["__proto__"], "boxcollider2d") == "1")
            {//这货是个boxcollider2d
                if (this.collider == null)
                {
                    this.collider = comp as any;
                }
                else
                {
                    console.error("已经有一个碰撞组件了，不能俩");
                    return;
                }
            }
            if (reflect.getClassTag(comp["__proto__"], "node2dphysicsbody") == "1")
            {//这货是个node2dphysicsbody
                if (this.physicsBody == null)
                {
                    this.physicsBody = comp as any;
                }
                else
                {
                    console.error("已经有一个碰撞组件了，不能俩");
                    return;
                }
            }


            if (functionIsEmpty(comp.update))
                comp.update = undefined;//update空转

            this.componentTypes[typeStr] = true;
            return comp;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 移除当前节点下的组件
         * @param comp 2d组件实例
         * @version m4m 1.0
         */
        removeComponent(comp: I2DComponent)
        {
            if (!comp) return;
            // let typeName =  reflect.getClassName(comp); //组件继承时remove fial
            let typeName = getClassName(comp);

            if (!this.componentTypes[typeName])
                return;
            delete this.componentTypes[typeName];
            for (var i = 0; i < this.components.length; i++)
            {
                if (this.components[i].comp == comp)
                {
                    this.clearOfCompRemove(this.components[i]);
                    this.components.splice(i, 1);
                    break;
                }
            }
        }

        private clearOfCompRemove(cComp: C2DComponent)
        {
            let comp = cComp.comp;
            if (cComp.init)
            {
                comp.remove();
            } else
            {
                let i = this.componentsInit.indexOf(cComp);
                if (i != -1) this.componentsInit.splice(i, 1);
            }

            if (comp == this.renderer) this.renderer = null;
            if (comp == (this.collider as any)) this.collider = null;
            if (comp == (this.physicsBody as any)) this.physicsBody = null;
            comp.transform = null;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 移除当前节点下的组件
         * @param type 2d组件名称
         * @version m4m 1.0
         */
        removeComponentByTypeName(type: string)
        {
            if (!this.componentTypes[type])
                return;
            delete this.componentTypes[type];
            let comps = this.components;
            let len = comps.length;
            for (var i = 0; i < len; i++)
            {
                // if (reflect.getClassName(this.components[i].comp) == type) {
                if (getClassName(comps[i].comp) == type)
                {
                    this.clearOfCompRemove(comps[i]);
                    var p = comps.splice(i, 1);
                    return p[0];
                }
            }
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 移除当前节点下的所有组件
         * @param type 2d组件名称
         * @version m4m 1.0
         */
        removeAllComponents()
        {
            this.componentsInit.length = 0;
            let len = this.components.length;
            for (var i = 0; i < len; i++)
            {
                this.components[i].comp.remove();
                this.components[i].comp.transform = null;
            }
            if (this.renderer) this.renderer = null;
            if (this.collider) this.collider = null;
            if (this.physicsBody) this.physicsBody = null;
            this.components.length = 0;
            this.componentTypes = {};
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取当前节点的指定组件实例
         * @param type 2d组件的名字
         * @version m4m 1.0
         */
        getComponent(type: string): I2DComponent
        {
            for (var i = 0; i < this.components.length; i++)
            {
                let comp = this.components[i].comp;
                let cname = getClassName(comp);
                // var cname = m4m.reflect.getClassName(this.components[i].comp["__proto__"]);
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
         * 获取当前节点身上所有的组件
         * @version m4m 1.0
         */
        getComponents(): I2DComponent[]
        {
            let components: I2DComponent[] = [];
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
         * 获取当前节点下所有的特定组件
         * @param type 组件名称
         * @version m4m 1.0
         */
        getComponentsInChildren(type: string): I2DComponent[]
        {
            let components: I2DComponent[] = [];
            this.getNodeCompoents(this, type, components);

            return components;
        }

        /**
         * @private
         * 之前给编辑器开的接口
         * @param node
         * @param _type
         * @param comps
         */
        private getNodeCompoents(node: transform2D, _type: string, comps: I2DComponent[])
        {
            let len = node.components.length;
            for (let i = 0; i < len; i++)
            {
                let comp = node.components[i].comp;
                let cname = getClassName(comp);
                // var cname = m4m.reflect.getClassName(node.components[i].comp["__proto__"]);
                if (cname == _type)
                {
                    comps.push(comp);
                }
            }
            if (node._children != null)
            {
                let len_1 = node._children.length;
                for (let j = 0; j < len_1; j++)
                {
                    this.getNodeCompoents(node._children[j], _type, comps);
                }
            }
        }

        /**
         * 获取当前节点下及子节点第一个能找到的组件
         * @param type 组件名称
         */
        getFirstComponentInChildren(type: string): I2DComponent
        {
            return this.getNodeFirstComponent(this, type);
        }

        /**
         * 获取节点的第一个组件
         * @param node
         * @param type
         */
        private getNodeFirstComponent(node: transform2D, type: string)
        {
            let len = node.components.length;
            for (let i = 0; i < len; i++)
            {
                let comp = node.components[i].comp;
                let cname = getClassName(comp);
                // var cname = m4m.reflect.getClassName(node.components[i].comp["__proto__"]);
                if (cname == type)
                {
                    return comp;
                }
            }
            if (node._children != null)
            {
                let len_1 = node._children.length;
                for (let j = 0; j < len_1; j++)
                {
                    let result = node.getNodeFirstComponent(node._children[j], type);
                    if (result) return result;
                }
            }
        }

        // /**
        //  * @public
        //  * @language zh_CN
        //  * @classdesc
        //  * 捕获事件
        //  * @param canvas canvas实例
        //  * @param ev 事件对象
        //  * @version m4m 1.0
        //  */
        // onCapturePointEvent(canvas: canvas, ev: PointEvent) {
        //     //event 捕捉阶段，正向
        //     if (this.components != null) {
        //         for (var i = 0; i <= this.components.length; i++) {
        //             if (ev.eated == false) {
        //                 var comp = this.components[i];
        //                 if (comp != null)
        //                     if (comp.init && instanceOfI2DPointListener(comp.comp) ) {
        //                         (comp.comp as any).onPointEvent(canvas, ev, true);
        //                     }
        //             }
        //         }
        //     }
        //     if (ev.eated == false) {
        //         if (this.children != null) {
        //             for (var i = 0; i <= this.children.length; i++) {
        //                 var c = this.children[i];
        //                 if (c != null && c.visible)
        //                     c.onCapturePointEvent(canvas, ev);
        //             }
        //         }
        //     }
        // }

        // ContainsPoint(p: math.vector2): boolean
        // {
        //     var p2 = new math.vector2();
        //     p2.x = p.x + this.pivot.x * this.width;
        //     p2.y = p.y + this.pivot.y * this.height;
        //     return p2.x >= 0 && p2.y >= 0 && p2.x < this.width && p2.y < this.height;
        // }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 检测以canvas为参考的位置，是否在节点的范围内
         * @param ModelPos 模型空间位置
         * @version m4m 1.0
         */
        ContainsCanvasPoint(ModelPos: math.vector2, tolerance: number = 0): boolean
        {
            let result = false;
            var mworld = this.getWorldMatrix();
            // var mout = math.pool.new_matrix3x2();
            var mout = transform2D.help_mtx;
            m4m.math.matrix3x2Inverse(mworld, mout);

            // var p2 = math.pool.new_vector2();
            var p2 = transform2D.help_v2;
            m4m.math.matrix3x2TransformVector2(mout, ModelPos, p2);  //世界坐标 右乘 逆转worldMatrix 得到 ModelPos
            p2.x += this.pivot.x * this.width;
            p2.y += this.pivot.y * this.height;
            result = p2.x + tolerance >= 0 && p2.y + tolerance >= 0 && p2.x < this.width + tolerance && p2.y < this.height + tolerance;

            // math.pool.delete_matrix3x2(mout);
            // math.pool.delete_vector2(p2);
            return result;
        }

        // /**
        //  * @public
        //  * @language zh_CN
        //  * @classdesc
        //  * 当前节点的渲染组件，一个节点同时只能存在一个渲染组件
        //  * @version m4m 1.0
        //  */
        // onPointEvent(canvas: canvas, ev: PointEvent) {
        //     //event 上升阶段,上升阶段事件会被吞掉
        //     if (this.children != null) {
        //         for (var i = this.children.length - 1; i >= 0; i--) {
        //             if (ev.eated == false) {
        //                 var c = this.children[i];
        //                 if (c != null && c.visible)
        //                     c.onPointEvent(canvas, ev);
        //                 // if (ev.eated)
        //                 // {//事件刚刚被吃掉，
        //                 //     //这时是否要做点什么？
        //                 // }
        //             }
        //         }
        //     }

        //     if (ev.eated == false && this.components != null) {

        //         for (var i = this.components.length - 1; i >= 0; i--) {
        //             var comp = this.components[i];
        //             if (comp != null)
        //                 if (comp.init && instanceOfI2DPointListener(comp.comp) ) {
        //                     (comp.comp as any).onPointEvent(canvas, ev, false);
        //                 }
        //         }
        //     }

        // }

        private readonly optionArr: layoutOption[] = [layoutOption.LEFT, layoutOption.TOP, layoutOption.RIGHT, layoutOption.BOTTOM, layoutOption.H_CENTER, layoutOption.V_CENTER];
        private _layoutState: number = 0;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 布局状态
         * @version m4m 1.0
         */
        @reflect.Field("number")
        set layoutState(state: number)
        {
            if (isNaN(state) || state == undefined) return;
            if (state != this._layoutState)
            {
                this.layoutDirty = true;
                this.markDirty();
                this._layoutState = state;
            }
        }
        get layoutState()
        {
            return this._layoutState;
        }

        @reflect.Field("numberdic")
        private layoutValueMap: { [option: number]: number } = {};   // map structure {layoutOption : value}
        //private layoutValueMap : number[] = [];   // map structure {layoutOption : value}
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 布局设定值
         * @version m4m 1.0
         */
        setLayoutValue(option: layoutOption, value: number)
        {
            if (isNaN(option) || isNaN(value) || option == undefined || value == undefined) return;
            if (this.layoutValueMap[option] == undefined || value != this.layoutValueMap[option])
            {
                this.layoutDirty = true;
                this.markDirty();
                this.layoutValueMap[option] = value;
            }
        }
        getLayoutValue(option: layoutOption)
        {
            if (this.layoutValueMap[option] == undefined)
                this.layoutValueMap[option] = 0;
            return this.layoutValueMap[option];
        }

        private _layoutPercentState: number = 0;//百分比模式
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 布局百分比模式状态
         * @version m4m 1.0
         */
        @reflect.Field("number")
        set layoutPercentState(state: number)
        {
            if (isNaN(state) || state == undefined) return;
            if (state != this._layoutPercentState)
            {
                this.layoutDirty = true;
                this.markDirty();
                this._layoutPercentState = state;
            }
        }
        get layoutPercentState()
        {
            return this._layoutPercentState;
        }

        private layoutDirty = false;
        private lastWidth = 0;
        private lastHeight = 0;
        private lastParentWidth = 0;
        private lastParentHeight = 0;
        private lastParentPivot = new math.vector2(0, 0);
        private lastPivot = new math.vector2(0, 0);

        private refreshLayout()
        {
            let parent = this._parent;
            if (!parent) return;
            if (this.width != this.lastWidth || this.height != this.lastHeight || parent.width != this.lastParentWidth || parent.height != this.lastParentHeight || parent.pivot.x != this.lastParentPivot.x
                || parent.pivot.y != this.lastParentPivot.y || this.pivot.x != this.lastPivot.x || this.pivot.y != this.lastPivot.y)
                this.layoutDirty = true;

            if (!this.layoutDirty) return;
            let state = this._layoutState | this._layoutPercentState;
            if (state != 0)
            {
                if (state & layoutOption.LEFT)
                {
                    if (state & layoutOption.RIGHT)
                    {
                        this.width = parent.width - this.getLayCoordinateValue(layoutOption.LEFT) - this.getLayCoordinateValue(layoutOption.RIGHT);
                    }
                    this.localTranslate.x = this.getLayCoordinateValue(layoutOption.LEFT) - parent.pivot.x * parent.width + this.pivot.x * this.width;
                } else if (state & layoutOption.RIGHT)
                {
                    this.localTranslate.x = parent.width - this.width - this.getLayCoordinateValue(layoutOption.RIGHT) - parent.pivot.x * parent.width + this.pivot.x * this.width;
                }

                if (state & layoutOption.H_CENTER)
                {
                    this.localTranslate.x = (parent.width - this.width) / 2 + this.getLayCoordinateValue(layoutOption.H_CENTER) - parent.pivot.x * parent.width + this.pivot.x * this.width;
                }

                if (state & layoutOption.TOP)
                {
                    if (state & layoutOption.BOTTOM)
                    {
                        this.height = parent.height - this.getLayCoordinateValue(layoutOption.TOP) - this.getLayCoordinateValue(layoutOption.BOTTOM);
                    }
                    this.localTranslate.y = this.getLayCoordinateValue(layoutOption.TOP) - parent.pivot.y * parent.height + this.pivot.y * this.height;
                } else if (state & layoutOption.BOTTOM)
                {
                    this.localTranslate.y = parent.height - this.height - this.getLayCoordinateValue(layoutOption.BOTTOM) - parent.pivot.y * parent.height + this.pivot.y * this.height;
                }

                if (state & layoutOption.V_CENTER)
                {
                    this.localTranslate.y = (parent.height - this.height) / 2 + this.getLayCoordinateValue(layoutOption.V_CENTER) - parent.pivot.y * parent.height + this.pivot.y * this.height;
                }
                //布局调整 后刷新 matrix
                m4m.math.matrix3x2MakeTransformRTS(this.localTranslate, this.localScale, this.localRotate, this.localMatrix);
            }

            this.layoutDirty = false;
            this.lastParentWidth = parent.width;
            this.lastParentHeight = parent.height;
            this.lastWidth = this.width;
            this.lastHeight = this.height;
            this.lastParentPivot.x = parent.pivot.x;
            this.lastParentPivot.y = parent.pivot.y;
            this.lastPivot.x = this.pivot.x;
            this.lastPivot.y = this.pivot.y;
        }

        /** 获取Layout 的坐标系值 */
        private getLayCoordinateValue(option: layoutOption)
        {
            if (this.layoutValueMap[option] == undefined)
                this.layoutValueMap[option] = 0;

            let value = 0;
            if (this._layoutPercentState & option)
            {
                if (this._parent)
                {
                    switch (option)
                    {
                        case layoutOption.LEFT:
                        case layoutOption.H_CENTER:
                        case layoutOption.RIGHT:
                            value = this._parent.width * this.layoutValueMap[option] / 100;
                            break;
                        case layoutOption.TOP:
                        case layoutOption.V_CENTER:
                        case layoutOption.BOTTOM:
                            value = this._parent.height * this.layoutValueMap[option] / 100;
                            break;
                    }
                }
            } else
            {
                value = this.layoutValueMap[option];
            }

            return value;
        }

        /** 设置Layout 的坐标系值 */
        private setLayCoordinateValue(option: layoutOption, value: number)
        {
            if (isNaN(option) || isNaN(value) || option == undefined || value == undefined) return;
            let _v: number = value;
            if (this._layoutPercentState & option)
            {
                if (this._parent)
                {
                    switch (option)
                    {
                        case layoutOption.LEFT:
                        case layoutOption.H_CENTER:
                        case layoutOption.RIGHT:
                            _v = value / this._parent.width * 100;
                            break;
                        case layoutOption.TOP:
                        case layoutOption.V_CENTER:
                        case layoutOption.BOTTOM:
                            _v = value / this._parent.height * 100;
                            break;
                    }
                }
            }

            //save value
            if (this.layoutValueMap[option] == undefined || _v != this.layoutValueMap[option])
            {
                this.layoutDirty = true;
                this.markDirty();
                this.layoutValueMap[option] = _v;
            }
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 设置兄弟姐妹序列索引
         * @version m4m 1.0
         */
        setSiblingIndex(siblingIndex: number)
        {
            let p = this._parent;
            if (!p || !p._children || siblingIndex >= p._children.length || isNaN(siblingIndex) || siblingIndex < 0) return;
            let currIdx = p._children.indexOf(this);
            if (currIdx == -1 || currIdx == siblingIndex) return;
            p._children.splice(currIdx, 1);
            let useidx = siblingIndex > currIdx ? siblingIndex - 1 : siblingIndex;
            p._children.splice(useidx, 0, this); //insert to target pos
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取兄弟姐妹序列索引
         * @version m4m 1.0
         */
        getSiblingIndex(): number
        {
            let p = this._parent;
            if (!p || !p._children) return -1;
            if (p._children.length < 1) return 0;
            return p._children.indexOf(this);
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取当前transform2D的克隆
         * @version m4m 1.0
         */
        clone(): transform2D
        {
            return io.cloneObj(this) as transform2D;
        }

        /**
         * 设置 节点的本地位置（会处理layout选项）
         * @param pos 
         */
        setLocalPosition(pos: math.vector2)
        {
            let state = this._layoutState | this._layoutPercentState;
            let lPos = this.localTranslate;
            let x = pos.x;
            let y = pos.y;
            let parent = this.parent;
            if (state == 0 || !parent)
            {
                if (lPos.x != x || lPos.y != y) this.markDirty();
                lPos.x = x;
                lPos.y = y;
            }

            //layout 模式处理
            if (!parent) return;
            //x
            if (state & layoutOption.LEFT)
            {
                let l = x;
                if (state & layoutOption.RIGHT)
                {
                    let r = -x;
                    this.setLayCoordinateValue(layoutOption.RIGHT, r);
                }
                this.setLayCoordinateValue(layoutOption.LEFT, l);
            } else if (state & layoutOption.RIGHT)
            {
                this.setLayCoordinateValue(layoutOption.RIGHT, -x);
            }

            if (state & layoutOption.H_CENTER)
            {
                let difHalf = (parent.width - this.width) / 2;
                this.setLayCoordinateValue(layoutOption.H_CENTER, x - difHalf);
            }

            //y
            if (state & layoutOption.TOP)
            {
                let t = y;
                if (state & layoutOption.BOTTOM)
                {
                    let b = -y;
                    this.setLayCoordinateValue(layoutOption.BOTTOM, b);
                }
                this.setLayCoordinateValue(layoutOption.TOP, t);
            } else if (state & layoutOption.BOTTOM)
            {
                this.setLayCoordinateValue(layoutOption.BOTTOM, -y);
            }

            if (state & layoutOption.V_CENTER)
            {
                let difHalf = (parent.height - this.height) / 2;
                this.setLayCoordinateValue(layoutOption.V_CENTER, y - difHalf);
            }
        }
    }

    export class t2dInfo
    {
        pivot: math.vector2 = new math.vector2();
        pivotPos: math.vector2 = new math.vector2();
        width: number;
        height: number;
        rot: number;

        public static getCenter(info: t2dInfo, outCenter: math.vector2)
        {
            outCenter.x = info.pivotPos.x + info.width * (0.5 - info.pivot.x) * Math.cos(info.rot) - info.height * (0.5 - info.pivot.y) * Math.sin(info.rot);
            outCenter.y = info.pivotPos.y - info.width * (0.5 - info.pivot.x) * Math.sin(info.rot) + info.height * (0.5 - info.pivot.y) * Math.cos(info.rot);
        }
    }
}