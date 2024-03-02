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
    * 滑动区域
    * @version m4m 1.0
    */
    @reflect.node2DComponent
    export class slideArea implements I2DComponent, I2DPointListener {
        static readonly ClassName: string = "slideArea";
        private static helpv2 = new math.vector2();
        private static helpv2_1 = new math.vector2();

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 水平滑动开启
         * @version m4m 1.0
         */
        @m4m.reflect.Field("boolean")
        horizontal: boolean = false;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 垂直滑动开启
         * @version m4m 1.0
         */
        @m4m.reflect.Field("boolean")
        vertical: boolean = false;

        start() {
        }

        onPlay() {
        }

        update(delta: number) {
        }
        transform: transform2D;
        onPointEvent(canvas: canvas, ev: PointEvent, oncap: boolean) {
            //oncap==true 是捕获阶段，一般的行为，只在pop阶段处理
            if (oncap == false) {
                let tv2 = slideArea.helpv2;
                tv2.x = ev.x;
                tv2.y = ev.y;
                var b = this.transform.ContainsCanvasPoint(tv2);
                if (b) {
                    ev.eated = true;
                    if (!this.horizontal && !this.vertical) return;

                    let temps = slideArea.helpv2;
                    m4m.math.vec2Set(temps, ev.x, ev.y);
                    let tempc = slideArea.helpv2_1;
                    this.transform.canvas.clipPosToCanvasPos(temps, tempc);

                    let sp = this.strPoint;
                    if (ev.type == event.PointEventEnum.PointDown) {
                        //点下
                        this.isPointDown = true;
                        sp.x = tempc.x;
                        sp.y = tempc.y;
                        if (this.onDownFun)
                            this.onDownFun(sp.x, sp.y);
                    }
                    if (ev.type == event.PointEventEnum.PointHold && this.isPointDown) {
                        //滑动中
                        let lp = this.lastPoint;
                        if (lp.x != tempc.x || lp.y != tempc.y) {
                            lp.x = tempc.x;
                            lp.y = tempc.y;
                            let addtransX = 0;
                            if (this.horizontal) {
                                addtransX = lp.x - sp.x;
                            }
                            let addtransY = 0;
                            if (this.vertical) {
                                addtransY = lp.y - sp.y;
                            }
                            // console.error(addtransX+"  ***  "+addtransY);
                            if (this.onMoveFun)
                                this.onMoveFun(addtransX, addtransY);
                        }
                    }
                }
            }
            if (ev.type == event.PointEventEnum.PointUp) {
                //滑动结束
                this.isPointDown = false;
                if (this.onUpFun)
                    this.onUpFun();
            }
        }
        /**
         * 当移动时触发
         */
        public onMoveFun: (x: number, y: number) => {};
        /**
         * 当点击下时触发
         */
        public onDownFun: (x: number, y: number) => {};
        /**
         * 当点击释放时触发
         */
        public onUpFun: () => {};
        private isPointDown = false;
        private lastPoint = new math.vector2();
        private strPoint = new math.vector2();
        remove() {
            this.transform = null;
        }
    }

}