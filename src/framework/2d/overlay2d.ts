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


namespace m4m.framework {
    /**
     * UI 缩放模式
     */
    export enum UIScaleMode {
        /** 固定像素尺寸*/
        CONSTANT_PIXEL_SIZE,
        /**参考屏幕尺寸比例缩放*/
        SCALE_WITH_SCREEN_SIZE
    }

    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 2DUI的容器类，与canvasrender(3DUI)相对应。
     * @version m4m 1.0
     */
    @m4m.reflect.SerializeType
    export class overlay2D implements IOverLay, IDisposable {
        static readonly ClassName: string = "overlay2D";
        /** point事件 直接模式（默认True,在dom输入原生帧直接触发） */
        public static pointEventDirectMode: boolean = true;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 构造函数
         * @version m4m 1.0
         */
        constructor() {
            this.canvas = new canvas();
            // sceneMgr.app.markNotify(this.canvas.getRoot(), NotifyType.AddChild);
        }

        private _hasListenerEvent = false;
        private _disposed = false;
        public get disposed() { return this._disposed };
        dispose(): void {
            this.unRegEvents();
            this._disposed = true;
        }

        /**
         * @private
         * @language zh_CN
         * @classdesc
         * 是否初始化完成，在执行完start之后设置为true
         * @version m4m 1.0
         */
        init: boolean = false;

        private camera: camera;
        private app: application;
        private inputmgr: inputMgr;

        start(camera: camera) {
            if (camera == this.camera) return;
            this.camera = camera;
            this.app = camera.gameObject.getScene().app;
            camera.calcViewPortPixel(this.app);
            this.canvas.scene = camera.gameObject.getScene();
            this.inputmgr = camera.gameObject.getScene().app.getInputMgr();

            if (overlay2D.pointEventDirectMode) {
                this.regEvnets();
            }
        }

        /**
         * 注册相关事件
         */
        private regEvnets() {
            this._hasListenerEvent = true;
            let ipt = m4m.framework.sceneMgr.app.getInputMgr();
            ipt.addHTMLElementListener("touchstart", this.refreshAndPointEvent, this);
            ipt.addHTMLElementListener("touchmove", this.refreshAndPointEvent, this);
            ipt.addHTMLElementListener("touchend", this.refreshAndPointEvent, this);
            ipt.addHTMLElementListener("touchcancel", this.refreshAndPointEvent, this);
            ipt.addHTMLElementListener("mousedown", this.refreshAndPointEvent, this);
            ipt.addHTMLElementListener("mousemove", this.refreshAndPointEvent, this);
            ipt.addHTMLElementListener("mouseup", this.refreshAndPointEvent, this);
        }

        /**
         * 注销所有注册的事件
         */
        private unRegEvents() {
            if (!this._hasListenerEvent) return;
            let ipt = m4m.framework.sceneMgr.app.getInputMgr();
            ipt.removeHTMLElementListener("touchstart", this.refreshAndPointEvent, this);
            ipt.removeHTMLElementListener("touchmove", this.refreshAndPointEvent, this);
            ipt.removeHTMLElementListener("touchend", this.refreshAndPointEvent, this);
            ipt.removeHTMLElementListener("touchcancel", this.refreshAndPointEvent, this);
            ipt.removeHTMLElementListener("mousedown", this.refreshAndPointEvent, this);
            ipt.removeHTMLElementListener("mousemove", this.refreshAndPointEvent, this);
            ipt.removeHTMLElementListener("mouseup", this.refreshAndPointEvent, this);
        }

        /**
         * @private
         */
        @m4m.reflect.Field("canvas")
        canvas: canvas;

        // /**
        //  * @public
        //  * @language zh_CN
        //  * @classdesc
        //  * 是否自适应
        //  * @version m4m 1.0
        //  */
        // @m4m.reflect.Field("boolean")
        // autoAsp: boolean = true;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 屏幕宽高匹配模式 (range 0-1  =0:固定宽  =1:固定高)
         * @version m4m 1.0
         */
        @m4m.reflect.Field("number")
        screenMatchRate: number = 0;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 屏幕匹配参考宽度
         * @version m4m 1.0
         */
        @m4m.reflect.Field("number")
        matchReference_width = 800;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 屏幕匹配参考高度
         * @version m4m 1.0
         */
        @m4m.reflect.Field("number")
        matchReference_height = 600;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 缩放模式 
         * 
         * 配合参数 ：
         * matchReference_height
         * matchReference_width
         * screenMatchRate
         * @version m4m 1.0
         */
        @m4m.reflect.Field("number")
        scaleMode: UIScaleMode = UIScaleMode.CONSTANT_PIXEL_SIZE;

        /**
        * @public
        * @language zh_CN
        * @classdesc
        * 渲染排序
        * @version m4m 1.0
        */
        @m4m.reflect.Field("number")
        sortOrder: number = 0;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 添加2d子节点
         * @param node 2d节点实例
         * @version m4m 1.0
         */
        addChild(node: transform2D) {
            this.canvas.addChild(node);
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 移除2d子节点
         * @param node 2d节点实例
         * @version m4m 1.0
         */
        removeChild(node: transform2D) {
            this.canvas.removeChild(node);
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取所有的2d子节点
         * @version m4m 1.0
         */
        getChildren(): transform2D[] {
            return this.canvas.getChildren();
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取2d子节点的数量
         * @version m4m 1.0
         */
        getChildCount(): number {
            return this.canvas.getChildCount();
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取2d子节点
         * @param index 索引
         * @version m4m 1.0
         */
        getChild(index: number): transform2D {
            return this.canvas.getChild(index);
        }

        /**
         * @private
         */
        render(context: renderContext, assetmgr: assetMgr, camera: camera) {
            if (!this.canvas.getRoot().visible || !this.camera) return;
            // if (!(camera.CullingMask & this.renderLayer)) return;

            // if (this.autoAsp)
            // {
            //     let vp = new m4m.math.rect();
            //     this.camera.calcViewPortPixel(assetmgr.app, vp);
            //     let aspcam = vp.w / vp.h;
            //     let aspc = this.canvas.pixelWidth / this.canvas.pixelHeight;
            //     if (aspc != aspcam)
            //     {
            //         this.canvas.pixelWidth = this.canvas.pixelHeight * aspcam;
            //         this.canvas.getRoot().markDirty();
            //     }
            // }

            context.updateOverlay();
            this.canvas.render(context, assetmgr);
        }

        // private readonly viewPixelrect = new math.rect();
        private readonly helpv2 = new m4m.math.vector2();
        private readonly helpv2_1 = new m4m.math.vector2();
        /**
         * @private
         */
        update(delta: number) {
            //layout update
            this.ckScaleMode();

            this.canvas.rootSizeAdjust();

            if (!this._hasListenerEvent) {
                this.onPointEvent();
            }

            this.canvas.updateNodeTree(delta);

        }

        /** 刷新ui point数据并触发 事件 */
        private refreshAndPointEvent() {
            this.inputmgr.pointCk();
            this.onPointEvent();
        }

        /** ui point 事件 */
        private onPointEvent() {
            //用屏幕空间坐标系丢给canvas
            let _p = this.inputmgr.point;
            this.helpv2.x = _p.x;
            this.helpv2.y = _p.y;
            let sPos = this.helpv2;
            let mPos = this.helpv2_1;
            this.calScreenPosToClipPos(sPos, mPos);

            this.canvas.burstPointEvent(_p.touch, mPos.x, mPos.y, _p.multiTouch);
        }

        private lastVPRect = new math.rect();
        private lastScreenMR = 0;
        private lastMR_width = 0;
        private lastMR_height = 0;
        /**
         * 检查缩放模式 改变
         */
        private ckScaleMode() {
            if (!this.canvas.getRoot().visible || !this.camera) return;
            // this.camera.calcViewPortPixel(this.app, this.viewPixelrect);
            // m4m.math.rectClone(this.camera.currViewPixelRect ,this.viewPixelrect);
            let currVPR = this.camera.currViewPixelRect;
            let dirty = false;
            if (math.rectEqul(this.lastVPRect, currVPR)) {
                switch (this.scaleMode) {
                    case UIScaleMode.CONSTANT_PIXEL_SIZE:
                        break;
                    case UIScaleMode.SCALE_WITH_SCREEN_SIZE:
                        if (this.lastScreenMR != this.screenMatchRate || this.lastMR_width != this.matchReference_width || this.lastMR_height != this.matchReference_height) {
                            dirty = true;
                        }
                        break;
                }
            } else {
                //rect 不等 需要重刷
                dirty = true;
            }

            if (!dirty) return;

            let _w = 0; let _h = 0;
            math.rectClone(currVPR, this.lastVPRect);
            this.lastScreenMR = this.screenMatchRate;
            this.lastMR_width = this.matchReference_width;
            this.lastMR_height = this.matchReference_height;

            //计算w h
            switch (this.scaleMode) {
                case UIScaleMode.CONSTANT_PIXEL_SIZE:
                    _w = currVPR.w;
                    _h = currVPR.h;
                    break;
                case UIScaleMode.SCALE_WITH_SCREEN_SIZE:
                    let match = this.screenMatchRate < 0 ? 0 : this.screenMatchRate;
                    match = match > 1 ? 1 : match;
                    let asp = currVPR.w / currVPR.h;
                    _w = math.numberLerp(this.matchReference_width, this.matchReference_height * asp, match);
                    _h = math.numberLerp(this.matchReference_height, this.matchReference_width / asp, 1 - match);
                    break;
            }

            //赋值
            this.canvas.pixelWidth = _w;
            this.canvas.pixelHeight = _h;
            this.canvas.getRoot().markDirty();
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 投射拣选检测
         * @param mx x偏移
         * @param my y偏移
         * @version m4m 1.0
         */
        pick2d(mx: number, my: number, tolerance: number = 0): transform2D {
            if (this.camera == null) return null;
            var root = this.canvas.getRoot();
            this.helpv2.x = mx;
            this.helpv2.y = my;
            let sPos = this.helpv2;
            let mPos = this.helpv2_1;
            this.calScreenPosToClipPos(sPos, mPos);
            let trans = this.dopick2d(mPos, root, tolerance);
            return trans;
        }

        /**
         * @private
         */
        private dopick2d(clipPos: math.vector2, tran: transform2D, tolerance: number = 0): transform2D {
            if (tran.components != null) {
                for (var i = tran.components.length - 1; i >= 0; i--) {
                    var comp = tran.components[i];
                    if (comp != null)
                        //if (comp.init && comp.comp.transform.ContainsCanvasPoint(outv,tolerance))
                        if (comp.comp.transform.ContainsCanvasPoint(clipPos, tolerance)) {
                            return comp.comp.transform;
                        }
                }
            }

            if (tran.children != null) {
                for (var i = tran.children.length - 1; i >= 0; i--) {
                    var tran2 = this.dopick2d(clipPos, tran.children[i], tolerance);
                    if (tran2 != null) return tran2;
                }
            }
            return null;
        }

        /**
        * @public
        * @language zh_CN
        * @classdesc
        * 屏幕空间坐标 转到 canvas坐标
        * @version m4m 1.0
        */
        calScreenPosToCanvasPos(screenPos: m4m.math.vector2, outCanvasPos: m4m.math.vector2) {
            if (!this.camera || !this.canvas) return;
            let mPos = this.helpv2;
            this.calScreenPosToClipPos(screenPos, mPos);

            // var mat: m4m.math.matrix3x2 = m4m.math.pool.new_matrix3x2();
            // m4m.math.matrix3x2Clone(this.canvas.getRoot().getWorldMatrix(), mat);
            // m4m.math.matrix3x2Inverse(mat, mat);
            // m4m.math.matrix3x2TransformVector2(mat, mPos, outCanvasPos);

            // m4m.math.pool.delete_matrix3x2(mat);

            this.canvas.clipPosToCanvasPos(mPos, outCanvasPos);
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * canvas坐标 转到 屏幕空间坐标
         * @param canvasPos canvas坐标
         * @param outScreenPos 输出的屏幕空间坐标
         * @version m4m 1.0
         */
        calCanvasPosToScreenPos(canvasPos: m4m.math.vector2, outScreenPos: m4m.math.vector2) {
            if (!this.camera || !this.canvas) return;
            let clipPos = this.helpv2;
            this.canvas.canvasPosToClipPos(canvasPos, clipPos);
            this.calClipPosToScreenPos(clipPos, outScreenPos);
        }

        /**
         * [过时接口,完全弃用]
         * @version m4m 1.0
         */
        calScreenPosToModelPos(screenPos: m4m.math.vector2, outClipPos: m4m.math.vector2) {
            this.calScreenPosToClipPos(screenPos, outClipPos);
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 屏幕空间坐标 转到 裁剪空间坐标
         * @version m4m 1.0
         * @param screenPos 
         * @param outClipPos 
         */
        calScreenPosToClipPos(screenPos: m4m.math.vector2, outClipPos: m4m.math.vector2) {
            if (!screenPos || !outClipPos || !this.camera) return;
            // this.camera.calcViewPortPixel(this.app, currVPR);
            let currVPR = this.camera.currViewPixelRect;
            let rect = this.camera.viewport;

            let real_x = screenPos.x - rect.x * this.app.width;
            let real_y = screenPos.y - rect.y * this.app.height;
            outClipPos.x = (real_x / currVPR.w) * 2 - 1;
            outClipPos.y = (real_y / currVPR.h) * -2 + 1;
        }

        /**
         * [过时接口,完全弃用]
         * @version m4m 1.0
         */
        calModelPosToScreenPos(clipPos: m4m.math.vector2, outScreenPos: m4m.math.vector2) {
            this.calClipPosToScreenPos(clipPos, outScreenPos);
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * Model坐标 转到 屏幕空间坐标
         * @param clipPos 裁剪空间坐标
         * @param outScreenPos 输出的屏幕空间坐标
         * @version m4m 1.0
         */
        calClipPosToScreenPos(clipPos: m4m.math.vector2, outScreenPos: m4m.math.vector2) {
            if (!clipPos || !outScreenPos || !this.camera) return;
            let currVPR = this.camera.currViewPixelRect;
            // this.camera.calcViewPortPixel(this.app, currVPR);
            let rect = this.camera.viewport;

            let real_x = currVPR.w * (clipPos.x + 1) * 0.5;
            let real_y = currVPR.h * (clipPos.y - 1) * -0.5;

            outScreenPos.x = real_x + rect.x * this.app.width;
            outScreenPos.y = real_y + rect.y * this.app.height;
        }
        /**
         * 获取高度的缩放值
         * @returns 
         */
        getScaleHeight(): number {
            if (this.scaleMode == m4m.framework.UIScaleMode.CONSTANT_PIXEL_SIZE)
                return 1.0
            else {
                return this.app.webgl.canvas.height  / this.canvas.pixelHeight;
            }
        }
        
        /**
         * 获取宽度的缩放值
         * @returns 
         */
        getScaleWidth(): number {
            if (this.scaleMode == m4m.framework.UIScaleMode.CONSTANT_PIXEL_SIZE)
                return 1.0
            else {
                return this.app.webgl.canvas.width / this.canvas.pixelWidth;
            }
        }
    }

}