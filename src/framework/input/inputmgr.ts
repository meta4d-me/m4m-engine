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

    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 鼠标(触屏)点击信息
     * @version m4m 1.0
     */
    export class pointinfo {
        id: number = -1;
        touch: boolean = false;
        multiTouch: boolean = false;
        x: number = 0;
        y: number = 0;
    }
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 键盘、鼠标(触屏)事件管理类 应用状态机区分状态
     * @version m4m 1.0
     */
    export class inputMgr {
        private app: m4m.framework.application;
        private _element: HTMLElement | null = null;
        private _buttons: boolean[] = [false, false, false];
        private _lastbuttons: boolean[] = [false, false, false];
        private eventer: event.InputEvent = new event.InputEvent();
        private HtmlNativeEventer: event.inputHtmlNativeEvent = new event.inputHtmlNativeEvent();
        private inputlast: HTMLInputElement = null;
        private keyboardMap: { [id: number]: boolean } = {};
        private handlers: Array<any> = [];

        private _wheel: number = 0;
        get wheel() { return this._wheel; };
        private _point: pointinfo = new pointinfo();
        get point() { return this._point; };
        private _touches: { [id: number]: pointinfo } = {};
        get touches() { return this._touches };


        private rMtr_90 = new m4m.math.matrix3x2();
        private rMtr_n90 = new m4m.math.matrix3x2();
        /**
         * 输入管理器
         * @param app 引擎app 
         */
        constructor(app: application) {
            this.app = app;
            m4m.math.matrix3x2MakeRotate(Math.PI * 90 / 180, this.rMtr_90);
            m4m.math.matrix3x2MakeRotate(Math.PI * -90 / 180, this.rMtr_n90);

            this.handlers.push(["touchstart", this._touchstart.bind(this)]);
            this.handlers.push(["touchmove", this._touchmove.bind(this)]);
            this.handlers.push(["touchend", this._touchend.bind(this)]);
            this.handlers.push(["touchcancel", this._touchcancel.bind(this)]);
            this.handlers.push(["mousedown", this._mousedown.bind(this)]);
            this.handlers.push(["mouseup", this._mouseup.bind(this)]);
            this.handlers.push(["mousemove", this._mousemove.bind(this)]);
            // this.handlers.push(["mousewheel",this._mousewheel.bind(this)]);
            this.handlers.push(["wheel", this._mousewheel.bind(this)]);
            this.handlers.push(["DOMMouseScroll", this._mousewheel.bind(this)]);
            this.handlers.push(["keydown", this._keydown.bind(this)]);
            this.handlers.push(["keyup", this._keyup.bind(this)]);
            this.handlers.push(["blur", this._blur.bind(this)]);

            this.attach(<HTMLCanvasElement>app.webgl.canvas);
            this.disableContextMenu();
        }

        /**
         * 附加到html元素
         * @param element html元素
         */
        private attach(element: HTMLElement) {
            if (this._element) {
                this.detach();
            }
            this._element = element;
            this.handlers.forEach(handler => {
                if (handler)
                    this._element.addEventListener(handler[0], handler[1], false);  //reg
            });
        }

        /**
         * 解除所有 附加绑定
         */
        private detach() {
            if (!this._element) return;
            this.handlers.forEach(handler => {
                if (handler)
                    this._element.removeEventListener(handler[0], handler[1], false);  //unreg
            });
            this._element = null;
        }

        /**
         * 当鼠标点下
         * @param ev 鼠标事件
         */
        private _mousedown(ev: MouseEvent) {

            this.CalcuPoint(ev.offsetX, ev.offsetY, this._point);
            this._buttons[ev.button] = true;
            this._point.touch = true;

            this.HtmlNativeEventer.Emit("mousedown", ev);
        }
        /**
         * 当鼠标点弹起
         * @param ev 鼠标事件
         */
        private _mouseup(ev: MouseEvent) {

            this._buttons[ev.button] = false;
            this._point.touch = false;

            this.HtmlNativeEventer.Emit("mouseup", ev);
        }
        /**
         * 当鼠标移动
         * @param ev 鼠标事件
         */
        private _mousemove(ev: MouseEvent) {

            this.CalcuPoint(ev.offsetX, ev.offsetY, this._point);

            this.HtmlNativeEventer.Emit("mousemove", ev);
        }
        /**
         * 当鼠标滚轮滚动
         * @param ev 鼠标事件
         */
        private _mousewheel(ev: WheelEvent) {

            this.hasWheel = true;
            if (ev.detail) {
                this.lastWheel = -1 * ev.detail;
            } else if ((ev as any).wheelDelta) {
                this.lastWheel = (ev as any).wheelDelta / 120;
            } else if (ev.DOM_DELTA_PIXEL) {
                this.lastWheel = ev.DOM_DELTA_PIXEL / 120;
            } else {
                this.lastWheel = 0;
            }


            this.HtmlNativeEventer.Emit("wheel", ev);
        }

        //touch
        /**
         * 尝试添加 触摸点
         * @param id 触摸ID
         */
        private tryAddTouchP(id: number) {
            if (!this._touches[id]) {
                this._touches[id] = new pointinfo();
                this._touches[id].id = id;
            }
        }

        /**
         * 通过所有的触摸状态 同步点
         */
        private syncPointByTouches() {
            let count = 0;
            let xs = 0;
            let ys = 0;
            for (var key in this._touches) {
                if (this._touches[key].touch == true) {
                    xs += this._touches[key].x;
                    ys += this._touches[key].y;
                    count++;
                }
            }
            // this.point.x = x / (count * app.scale);
            // this.point.y = y / (count * app.scale);
            //this.CalcuPoint(x / count,y / count,this._point);
            this._point.x = xs / count;
            this._point.y = ys / count;
        }

        /**
         * 触摸开始
         * @param ev    触摸事件
         */
        private _touchstart(ev: TouchEvent) {
            ev.preventDefault();

            // this.CalcuPoint(ev.touches[0].clientX,ev.touches[0].clientY,this._point);
            this._point.touch = true;
            this._point.multiTouch = true;
            let lastTouche: pointinfo;
            const rect = (this.app.webgl.canvas as any).getBoundingClientRect();
            for (var i = 0; i < ev.changedTouches.length; i++) {
                var touch = ev.changedTouches[i];
                var id = touch.identifier;
                this.tryAddTouchP(id);
                this._touches[id].touch = true;
                this.CalcuPoint(touch.clientX - rect.left, touch.clientY - rect.top, this._touches[id]);

                // this._touches[id].x = touch.clientX;
                // this._touches[id].y = touch.clientY;

                lastTouche = this._touches[id];
            }


            // this.syncPointByTouches();

            if (lastTouche) {
                this._point.x = lastTouche.x;
                this._point.y = lastTouche.y;
            }

            this.HtmlNativeEventer.Emit("touchstart", ev);
        }

        /**
         * 触摸移动
         * @param ev 触摸事件
         */
        private _touchmove(ev: TouchEvent) {
            ev.preventDefault();    //避免 在触摸设备中，下拉 触发浏览器刷新监听。

            this._point.touch = true;
            this._point.multiTouch = true;
            let lastTouche: pointinfo;
            const rect = (this.app.webgl.canvas as any).getBoundingClientRect();
            for (var i = 0; i < ev.changedTouches.length; i++) {
                var touch = ev.changedTouches[i];
                var id = touch.identifier;
                this.tryAddTouchP(id);
                this._touches[id].touch = true;
                this.CalcuPoint(touch.clientX - rect.left, touch.clientY - rect.top, this._touches[id]);
                // this._touches[id].x = touch.clientX;
                // this._touches[id].y = touch.clientY;

                lastTouche = this._touches[id];
            }

            // this.syncPointByTouches();

            if (lastTouche) {
                this._point.x = lastTouche.x;
                this._point.y = lastTouche.y;
            }

            this.HtmlNativeEventer.Emit("touchmove", ev);
        }
        /**
         * 触摸结束
         * @param ev 触摸事件
         */
        private _touchend(ev: TouchEvent) {
            ev.preventDefault();

            for (var i = 0; i < ev.changedTouches.length; i++) {
                var touch = ev.changedTouches[i];
                var id = touch.identifier;
                this.tryAddTouchP(id);
                this._touches[id].touch = false;
            }

            this._point.touch = false;
            //所有触点全放开，point.touch才false
            for (var key in this._touches) {
                if (this._touches[key].touch == true)
                    return;
            }
            this._point.multiTouch = false;

            this.HtmlNativeEventer.Emit("touchend", ev);
        }
        /**
         * 触摸取消
         * @param ev 触摸事件
         */
        private _touchcancel(ev: TouchEvent) {
            ev.preventDefault();

            this._touchend(ev);

            this.HtmlNativeEventer.Emit("touchcancel", ev);
        }

        //key
        /**
         * 键盘按下
         * @param ev 键盘事件
         */
        private _keydown(ev: KeyboardEvent) {

            this.keyboardMap[ev.keyCode] = true;
            this.keyDownCode = ev.keyCode;

            this.HtmlNativeEventer.Emit("keydown", ev);
        }
        /**
         * 键盘弹起
         * @param ev 键盘事件
         */
        private _keyup(ev: KeyboardEvent) {

            delete this.keyboardMap[ev.keyCode];
            this.keyUpCode = ev.keyCode;

            this.HtmlNativeEventer.Emit("keyup", ev);
        }
        //
        /**
         * 事件失焦
         * @param ev 事件对象
         */
        private _blur(ev) {

            this._point.touch = false;
            //清理 keys 状态
            let _map = this.keyboardMap;
            for (let key in _map) {
                _map[key] = false;
            }

            this.HtmlNativeEventer.Emit("blur", ev);
        }


        private readonly moveTolerance = 2;  //move 状态容忍值
        private lastTouch = false;
        private hasPointDown = false;
        private hasPointUP = false;
        private hasPointMove = false;
        private downPoint = new m4m.math.vector2();
        private lastPoint = new m4m.math.vector2();
        /**
         * 执行更新
         * @param delta dtime
         */
        update(delta) {
            this._lastbuttons[0] = this._buttons[0];
            this._lastbuttons[1] = this._buttons[1];
            this._lastbuttons[2] = this._buttons[2];
            this._wheel = 0;

            this.mouseWheelCk();
            this.pointCk();
            this.keyCodeCk();
        }

        /**
         * point 刷新检查
         */
        public pointCk() {
            let pt = this._point;
            if (this.lastPoint.x != pt.x || this.lastPoint.y != pt.y) {
                //on move
                this.eventer.EmitEnum_point(event.PointEventEnum.PointMove, pt.x, pt.y);
            }

            if (!this.lastTouch && pt.touch) {
                //on down
                this.hasPointDown = true;
                this.downPoint.x = pt.x;
                this.downPoint.y = pt.y;
                this.eventer.EmitEnum_point(event.PointEventEnum.PointDown, pt.x, pt.y);
            } else if (this.lastTouch && !pt.touch) {
                //on up
                this.hasPointUP = true;
                this.eventer.EmitEnum_point(event.PointEventEnum.PointUp, pt.x, pt.y);
            } else if (this.lastTouch && pt.touch) {
                //on hold
                this.eventer.EmitEnum_point(event.PointEventEnum.PointHold, pt.x, pt.y);
            }

            if (this.hasPointUP && this.hasPointDown) {
                let isMoveTolerance = (Math.abs(this.downPoint.x - pt.x) > this.moveTolerance || Math.abs(this.downPoint.y - pt.y) > this.moveTolerance)
                if (!isMoveTolerance) {
                    //on click
                    this.hasPointDown = this.hasPointUP = false;
                    this.eventer.EmitEnum_point(event.PointEventEnum.PointClick, pt.x, pt.y);
                }
            }

            if (!pt.touch) {
                this.hasPointDown = false;
            }

            this.lastTouch = pt.touch;
            this.lastPoint.x = pt.x;
            this.lastPoint.y = pt.y;
        }

        private keyDownCode: number = -1;
        private keyUpCode: number = -1;
        /**
         * 按键码检查
         */
        private keyCodeCk() {
            if (this.keyDownCode != -1)
                this.eventer.EmitEnum_key(event.KeyEventEnum.KeyDown, this.keyDownCode);
            if (this.keyUpCode != -1)
                this.eventer.EmitEnum_key(event.KeyEventEnum.KeyUp, this.keyUpCode);

            this.keyDownCode = this.keyUpCode = -1;
        }

        private hasWheel = false;
        private lastWheel = 0;
        /**
         * 鼠标滚动检查
         */
        private mouseWheelCk() {
            if (this.hasWheel) {
                this._wheel = this.lastWheel;
                this.eventer.EmitEnum_point(event.PointEventEnum.MouseWheel, null);
            }

            this.hasWheel = false;
            this.lastWheel = 0;
        }

        /**
         * 按键是否在按下状态
         * @param button 按键, 0: 左键；1: 中键；2: 右键
         */
        public isPressed(button: number): boolean {
            return this._buttons[button];
        }

        /**
         * 按键被按下一次
         * @param button 按键, 0: 左键；1: 中键；2: 右键
         */
        public wasPressed(button: number): boolean {
            return (this._buttons[button] && !this._lastbuttons[button]);
        }

        /**
         * 上下文枚举
         * @param ev 
         */
        private _contextMenu = (ev) => { ev.preventDefault() };
        /**
         * 禁用右键菜单
         */
        public disableContextMenu() {
            if (!this._element) return;
            this._element.addEventListener("contextmenu", this._contextMenu);
        }
        /**
         * 启用右键菜单
         */
        public enableContextMenu() {
            if (!this._element) return;
            this._element.removeEventListener("contextmenu", this._contextMenu);
        }

        /**
        * 添加point事件监听者
        * @param eventEnum 事件类型
        * @param func 事件触发回调方法 (Warn: 不要使用 func.bind() , 它会导致相等判断失败)
        * @param thisArg 回调方法执行者
        */
        addPointListener(eventEnum: event.PointEventEnum, func: (...args: Array<any>) => void, thisArg: any) {
            this.eventer.OnEnum_point(eventEnum, func, thisArg);
        }
        /**
         * 移除point事件监听者
         * @param eventEnum 事件类型
         * @param func 事件触发回调方法
         * @param thisArg 回调方法执行者
         */
        removePointListener(eventEnum: event.PointEventEnum, func: (...args: Array<any>) => void, thisArg: any) {
            this.eventer.RemoveListener(event.PointEventEnum[eventEnum], func, thisArg);
        }

        /**
        * 添加按键事件监听者
        * @param eventEnum 事件类型
        * @param func 事件触发回调方法 (Warn: 不要使用 func.bind() , 它会导致相等判断失败)
        * @param thisArg 回调方法执行者
        */
        addKeyListener(eventEnum: event.KeyEventEnum, func: (...args: Array<any>) => void, thisArg: any) {
            this.eventer.OnEnum_key(eventEnum, func, thisArg);
        }
        /**
         * 移除按键事件监听者
         * @param eventEnum 事件类型
         * @param func 事件触发回调方法
         * @param thisArg 回调方法执行者
         */
        removeKeyListener(eventEnum: event.KeyEventEnum, func: (...args: Array<any>) => void, thisArg: any) {
            this.eventer.RemoveListener(event.KeyEventEnum[eventEnum], func, thisArg);
        }

        /**
        * 添加HTMLElement原生事件监听者
        * @param tagName 事件类型名字
        * @param func 事件触发回调方法 (Warn: 不要使用 func.bind() , 它会导致相等判断失败)
        * @param thisArg 回调方法执行者
        */
        addHTMLElementListener<K extends keyof event.inputHtmlNativeEventMap>(tagName: K, func: (ev: any) => void, thisArg: any) {
            this.HtmlNativeEventer.On(tagName, func, thisArg);
        }
        /**
         * 移除HTMLElement原生事件监听者
         * @param tagName 事件类型名字
         * @param func 事件触发回调方法
         * @param thisArg 回调方法执行者
         */
        removeHTMLElementListener<K extends keyof event.inputHtmlNativeEventMap>(tagName: K, func: (ev: any) => void, thisArg: any) {
            this.HtmlNativeEventer.RemoveListener(tagName, func, thisArg);
        }


        /**
         * 任意一按键被按下
         */
        anyKey() {
            if (this._point.touch) return true;
            for (const key in this.keyboardMap) {
                if (this.keyboardMap.hasOwnProperty(key)) {
                    const element = this.keyboardMap[key];
                    if (element == true)
                        return true;
                }
            }
            return false;
        }

        /**
        * @public
        * @language zh_CN
        * @classdesc
        * 获取 指定按键是否Down
        * @version m4m 1.0
        */
        GetKeyDown(name: string)
        GetKeyDown(key: event.KeyCode)
        GetKeyDown(value: any) {
            if (typeof (value) === "number") {
                if (this.keyboardMap[value] != null)
                    return this.keyboardMap[value];
            } else if (typeof (value) === "string") {
                let id = event.KeyCode[value];
                if (id != null && this.keyboardMap[id] != null)
                    return this.keyboardMap[id];
            }
            return false;
        }

        /**
        * @public
        * @language zh_CN
        * @classdesc
        * 获取 指定按键是否UP
        * @version m4m 1.0
        */
        GetKeyUP(name: string)
        GetKeyUP(key: event.KeyCode)
        GetKeyUP(value: any): boolean {
            if (typeof (value) === "number") {
                return !this.keyboardMap[value];
            } else if (typeof (value) === "string") {
                let id = event.KeyCode[value];
                if (id != null)
                    return !this.keyboardMap[id];
            }
            return false;
        }

        /**
         * 按键按下的数量
         */
        KeyDownCount() {
            let count = 0;
            for (const key in this.keyboardMap) {
                if (this.keyboardMap.hasOwnProperty(key)) {
                    if (this.keyboardMap[key] === true)
                        count++;
                }
            }
            return count;
        }

        private tempV2_0: m4m.math.vector2 = new m4m.math.vector2();
        private tempV2_1: m4m.math.vector2 = new m4m.math.vector2();
        private devicePixelRatio = window.devicePixelRatio || 1;
        /**
         * 计算校准html 输入坐标点
         * @param offsetX 输入x
         * @param offsetY 输入y
         * @param out 返回pointinfo 
         */
        CalcuPoint(offsetX: number, offsetY: number, out: pointinfo) {
            if (!out || !this.app || isNaN(offsetX) || isNaN(offsetY)) return;
            this.tempV2_0.x = offsetX * this.devicePixelRatio / this.app.scaleFromPandding;
            this.tempV2_0.y = offsetY * this.devicePixelRatio / this.app.scaleFromPandding;
            m4m.math.vec2Clone(this.tempV2_0, this.tempV2_1);

            if (this.app.shouldRotate) {
                switch (this.app.orientation) {
                    case m4m.framework.OrientationMode.PORTRAIT:
                        m4m.math.matrix3x2TransformVector2(this.rMtr_90, this.tempV2_0, this.tempV2_1);
                        out.x = this.tempV2_1.x + this.app.webgl.canvas.width;
                        out.y = this.tempV2_1.y;
                        break;
                    case m4m.framework.OrientationMode.LANDSCAPE:
                        m4m.math.matrix3x2TransformVector2(this.rMtr_n90, this.tempV2_0, this.tempV2_1);
                        out.x = this.tempV2_1.x;
                        out.y = this.tempV2_1.y + this.app.webgl.canvas.height;
                        break;
                    case m4m.framework.OrientationMode.LANDSCAPE_FLIPPED:
                        m4m.math.matrix3x2TransformVector2(this.rMtr_90, this.tempV2_0, this.tempV2_1);
                        out.x = this.tempV2_1.x + this.app.webgl.canvas.width;
                        out.y = this.tempV2_1.y;
                        break;
                }
            } else {
                out.x = this.tempV2_0.x;
                out.y = this.tempV2_0.y;
            }

            //console.error(`x :${this.point.x}  y :${this.point.y}  w :${this.app.webgl.canvas.width}  h :${this.app.webgl.canvas.height}`);
        }
    }
}