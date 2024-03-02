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
/// <reference path="../../../io/reflect.ts" />

namespace m4m.framework {
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 2d图片组件</p>
     * 参照UGUI的思路，rawImage只拿整个图片来显示，不关心Sprite、九宫、填充等。这些统一都在iamge中处理
     * @version m4m 1.0
     */
    @reflect.node2DComponent
    @reflect.nodeRender
    export class rawImage2D implements IRectRenderer {
        static readonly ClassName: string = "rawImage2D";

        private datar: number[] = [
            //3 pos  4 color  2 uv 4 color2
            0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1,
            0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1,
            0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1,
            0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1,
            0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1,
            0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
        ];

        private _image: texture;

        private needRefreshImg = false;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 图片
         * @version m4m 1.0
         */
        @m4m.reflect.Field("texture")
        public get image() {
            return this._image;
        }
        public set image(_image: texture) {
            if (this._image == _image) return;
            this.needRefreshImg = true;
            if (this._image) {
                this._image.unuse();
            }
            this._image = _image;
            if (_image) {
                this._image.use();
                this.updateTran();
            }
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 颜色
         * @version m4m 1.0
         */
        @reflect.Field("color")
        @reflect.UIStyle("vector4")
        color: math.color = new math.color(1.0, 1.0, 1.0, 1.0);

        private _proportionalScalingMode: boolean = false;

        /** 图 等比缩放居中显示模式 （默认false）*/
        public get proportionalScalingMode() { return this._proportionalScalingMode; }
        public set proportionalScalingMode(val: boolean) {
            if (val == this._proportionalScalingMode) return;
            this._proportionalScalingMode = val;
            if (this._image) {
                this.updateTran();
            }
        }


        private static readonly defUIShader = `shader/defui`;  //非mask 使用shader
        private static readonly defMaskUIShader = `shader/defmaskui`; //mask 使用shader

        private _CustomShaderName = ``; //自定义UIshader

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 设置rander Shader名字
         * @version m4m 1.0
         */
        setShaderByName(shaderName: string) {
            this._CustomShaderName = shaderName;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取rander 的材质
         * @version m4m 1.0
         * @returns 材质对象
         */
        getMaterial() {
            if (!this._uimat) {
                return this.uimat;
            }
            return this._uimat;
        }

        private _darwRect: m4m.math.rect;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取渲染绘制矩形边界
         * @version m4m 1.0
         * @returns 矩形区域 Rect对象
         */
        getDrawBounds() {
            if (!this._darwRect) {
                this._darwRect = new math.rect();
                this.calcDrawRect();
            }
            return this._darwRect;
        }

        /**
         * @private
         * ui默认材质
         */
        private _uimat: material;
        private get uimat() {
            if (this._image) {
                let assetmgr = this.transform.canvas.assetmgr;
                if (!assetmgr) return this._uimat;
                let pMask = this.transform.parentIsMask;
                let mat = this._uimat;
                let rectTag = "";
                let uiTag = "_ui";
                if (pMask) {
                    // let prect = this.transform.maskRect;
                    // rectTag = `mask(${prect.x}_${prect.y}_${prect.w}_${prect.h})`; //when parentIsMask,can't multiplexing material , can be multiplexing when parent equal

                    let rId = this.transform.maskRectId;
                    rectTag = `mask(${rId})`;
                }
                let useShaderName = this._CustomShaderName ? this._CustomShaderName : pMask ? rawImage2D.defMaskUIShader : rawImage2D.defUIShader;
                let matName = useShaderName + this._image.getName() + uiTag + rectTag;
                if (!mat || mat.getName() != matName) {
                    if (mat) mat.unuse();
                    mat = assetmgr.getAssetByName(matName) as m4m.framework.material;
                    if (mat) mat.use();
                }
                if (!mat) {
                    mat = new material(matName);
                    let sh = assetmgr.getShader(this._CustomShaderName);
                    sh = sh ? sh : assetmgr.getShader(pMask ? rawImage2D.defMaskUIShader : rawImage2D.defUIShader);
                    mat.setShader(sh);
                    mat.use();
                    this.needRefreshImg = true;
                }
                this._uimat = mat;
            }
            return this._uimat;
        }
        // /**
        //  * @private
        //  * ui默认材质
        //  */
        // _uimat: material;
        // private get uimat(){
        //     if (this.image != null ){
        //         let rectPostfix = this.transform.parentIsMask? `_(${this.transform.insId})`: ""; //when parentIsMask,can't multiplexing material
        //         let matName =this._image.getName() + "_uimask" + rectPostfix;
        //         let canvas = this.transform.canvas;
        //         if(!canvas.assetmgr) return;
        //         let mat = this._uimat;
        //         if(!mat || mat.getName() != matName){
        //             if(mat) mat.unuse(); 
        //             mat = canvas.assetmgr.getAssetByName(matName) as m4m.framework.material;
        //             if(mat) mat.use();
        //         }
        //         if(mat == null){
        //             mat = new material(matName);
        //             mat.setShader(canvas.assetmgr.getShader("shader/defmaskui"));
        //             mat.use();
        //         }
        //         mat.setFloat("MaskState", this.transform.parentIsMask? 1 : 0);
        //         this._uimat = mat;
        //     }
        //     return this._uimat;
        // }

        render(canvas: canvas) {
            let mat = this.uimat;
            if (!mat) return;
            let img = this.image;
            // if (img == null)
            // {
            //     var scene = this.transform.canvas.scene;
            //     img = scene.app.getAssetMgr().getDefaultTexture("grid");
            // }
            if (img != null) {
                let needRMask = false;
                if (this.needRefreshImg) {
                    mat.setTexture("_MainTex", img);
                    this.needRefreshImg = false;
                    needRMask = true;
                }

                if (this.transform.parentIsMask) {
                    if (this._cacheMaskV4 == null) this._cacheMaskV4 = new math.vector4();
                    let rect = this.transform.maskRect;
                    if (this._cacheMaskV4.x != rect.x || this._cacheMaskV4.y != rect.y || this._cacheMaskV4.w != rect.w || this._cacheMaskV4.z != rect.h || needRMask) {
                        this._cacheMaskV4.x = rect.x; this._cacheMaskV4.y = rect.y; this._cacheMaskV4.z = rect.w; this._cacheMaskV4.w = rect.h;
                        mat.setVector4("_maskRect", this._cacheMaskV4);
                    }
                }

                canvas.pushRawData(mat, this.datar);
            }
        }

        private _cacheMaskV4: math.vector4;

        updateTran() {
            if(!this.transform) return;
            let _w = this.transform.width;
            let _h = this.transform.height;
            let _l_offset = 0;
            let _t_offset = 0;
            let needCalcEqualRatio = this._image && this._proportionalScalingMode;

            let m = this.transform.getWorldMatrix();

            if (needCalcEqualRatio) {
                let _imgW = this._image.glTexture.width;
                let _imgH = this._image.glTexture.height;
                let _defW = _w - _imgW;
                let _defH = _h - _imgH;
                let _asp = _imgH / _imgW;
                let _wBigThanH = _defW > _defH;
                if (_wBigThanH) {
                    let _tW = _h / _asp;
                    _l_offset = (_w - _tW) / 2;
                    _w = _tW;
                } else {
                    let _tH = _w * _asp;
                    _t_offset = (_h - _tH) / 2;
                    _h = _tH;
                }
            }

            let l = -this.transform.pivot.x * _w + _l_offset;
            let r = _w + l;
            let t = -this.transform.pivot.y * _h + _t_offset;
            let b = _h + t;

            let x0 = l * m.rawData[0] + t * m.rawData[2] + m.rawData[4];
            let y0 = l * m.rawData[1] + t * m.rawData[3] + m.rawData[5];
            let x1 = r * m.rawData[0] + t * m.rawData[2] + m.rawData[4];
            let y1 = r * m.rawData[1] + t * m.rawData[3] + m.rawData[5];
            let x2 = l * m.rawData[0] + b * m.rawData[2] + m.rawData[4];
            let y2 = l * m.rawData[1] + b * m.rawData[3] + m.rawData[5];
            let x3 = r * m.rawData[0] + b * m.rawData[2] + m.rawData[4];
            let y3 = r * m.rawData[1] + b * m.rawData[3] + m.rawData[5];

            this.datar[0 * 13] = x0;
            this.datar[0 * 13 + 1] = y0;
            this.datar[1 * 13] = x1;
            this.datar[1 * 13 + 1] = y1;
            this.datar[2 * 13] = x2;
            this.datar[2 * 13 + 1] = y2;
            this.datar[3 * 13] = x2;
            this.datar[3 * 13 + 1] = y2;
            this.datar[4 * 13] = x1;
            this.datar[4 * 13 + 1] = y1;
            this.datar[5 * 13] = x3;
            this.datar[5 * 13 + 1] = y3;
            //主color
            for (let i = 0; i < 6; i++) {
                this.datar[i * 13 + 3] = this.color.r;
                this.datar[i * 13 + 4] = this.color.g;
                this.datar[i * 13 + 5] = this.color.b;
                this.datar[i * 13 + 6] = this.color.a;
            }

            //drawRect 
            this.min_x = Math.min(x0, x1, x2, x3, this.min_x);
            this.min_y = Math.min(y0, y1, y2, y3, this.min_y);
            this.max_x = Math.max(x0, x1, x2, x3, this.max_x);
            this.max_y = Math.max(y0, y1, y2, y3, this.max_y);
            this.calcDrawRect();
        }


        private min_x: number = Number.MAX_VALUE;
        private max_x: number = Number.MAX_VALUE * -1;
        private min_y: number = Number.MAX_VALUE;
        private max_y: number = Number.MAX_VALUE * -1;
        /**
         * 计算 渲染绘制覆盖到的矩形范围 Rect
         * @returns 
         */
        private calcDrawRect() {
            if (!this._darwRect) return;
            //drawBounds (y 轴反向)
            let canvas = this.transform.canvas;
            if (!canvas) return;
            let minPos = poolv2();
            minPos.x = this.min_x;
            minPos.y = this.max_y;
            canvas.clipPosToCanvasPos(minPos, minPos);

            let maxPos = poolv2();
            maxPos.x = this.max_x;
            maxPos.y = this.min_y;
            canvas.clipPosToCanvasPos(maxPos, maxPos);

            this._darwRect.x = minPos.x;
            this._darwRect.y = minPos.y;
            this._darwRect.w = maxPos.x - minPos.x;
            this._darwRect.h = maxPos.y - minPos.y;

            this.min_x = this.min_y = Number.MAX_VALUE;
            this.max_x = this.max_y = Number.MAX_VALUE * -1;

            poolv2_del(minPos);
            poolv2_del(maxPos);
        }

        start() {

        }

        onPlay() {

        }

        update(delta: number) {

        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 当前组件的2d节点
         * @version m4m 1.0
         */
        transform: transform2D;

        remove() {
            if (this._image) this._image.unuse();
            if (this._uimat) this._uimat.unuse();
            this._image = null;
            this._cacheMaskV4 = null;
            this.transform = null;
            this.datar.length = 0;
        }

    }
}