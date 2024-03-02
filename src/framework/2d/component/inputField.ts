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
     * 2d文本输入框
     * @version m4m 1.0
     */
    @reflect.node2DComponent
    export class inputField implements I2DComponent, I2DPointListener {
        static readonly ClassName: string = "inputField";
        private static readonly helpV2: m4m.math.vector2 = new m4m.math.vector2();
        private static _isMobile: boolean;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 当前组件的2d节点
         * @version m4m 1.0
         */
        transform: transform2D;

        private _frameImage: image2D;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 底框显示图像
         * @version m4m 1.0
         */
        @m4m.reflect.Field("reference", null, "image2D")
        get frameImage() {
            return this._frameImage;
        }
        set frameImage(frameImg: image2D) {
            this._frameImage = frameImg;
        }

        private customRegexStr: string = "";
        private beFocus: boolean = false;
        private inputElement: HTMLInputElement | HTMLTextAreaElement;
        private _text: string = "";
        private _lastAddRTextFID = 0;
        private _inputStop: boolean = false;
        private _eventsHandle: { [eventKey: string]: Function } = {};

        /** 用户 按回车键时提交 回调函数 */
        public onTextSubmit: (text: string) => void;
        /** 用户 聚焦输入框 回调函数 */
        public onfocus: () => void;
        /** 用户 从输入框移出焦点 回调函数 */
        public onblur: () => void;
        /** 用户 从输入框移出 回调函数 */
        public onmouseout: () => void;

        /** 选择区域的开始位置 */
        get selectionStart() {
            if (this.inputElement) return this.inputElement.selectionStart;
            return 0;
        }

        /** 输入框是否是聚焦的 */
        get isFocus() { return this.beFocus; }

        /** 选择区域的结束位置 */
        get selectionEnd() {
            if (this.inputElement) return this.inputElement.selectionEnd;
            return 0;
        }

        /** 选择区域的方向 ， forward ：从前往后 backward ：从后往前 */
        get selectionDirection() {
            if (this.inputElement) return this.inputElement.selectionDirection;
            return "forward";
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 文字内容
         * @version m4m 1.0
         */
        get text(): string {
            return this._text;
        }
        set text(val: string) {
            if (val == this._text) return;
            val = val == null ? "" : val;
            this._text = val;
            if (this.inputElement) this.inputElement.value = val;
            if (this._textLable) this._textLable.text = val;
            if (this.beFocus) {
                this.showEle();
            } else {
                this.showLable();
            }
        }

        /**
         * 清除输入文本
         */
        public clearText() {
            this._text = "";
            this.inputElement.value = this._text;
            this._textLable.text = this._text;
        }

        private _charlimit: number = 0;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 限制输入字符数
         * @version m4m 1.0
         */
        @m4m.reflect.Field("number")
        get characterLimit() { return this._charlimit; }
        set characterLimit(charlimit: number) {
            this._charlimit = parseInt(`${charlimit}`);
            this._charlimit = isNaN(this._charlimit) || this._charlimit < 0 ? 0 : this._charlimit;
        }

        private _lineType: lineType = lineType.SingleLine;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 文本行格式
         * @version m4m 1.0
         */
        @m4m.reflect.Field("number")
        get LineType() { return this._lineType; }
        set LineType(_lineType: lineType) {
            if (this._lineType == _lineType) return;
            let newIsSin = _lineType == lineType.SingleLine;
            let oldIsSin = this._lineType == lineType.SingleLine;
            this._lineType = _lineType;
            if (newIsSin != oldIsSin && this.inputElement) {
                let oldVal = this.inputElement.value;
                this.removeEle();
                this.initEle();
                this.inputElement.value = oldVal;
            }
        }

        private _contentType: number = contentType.None;
        /**
        * @public
        * @language zh_CN
        * @classdesc
        * 文本内容格式
        * @version m4m 1.0
        */
        @m4m.reflect.Field("number")
        get ContentType() { return this._contentType; }
        set ContentType(contentType: contentType) {
            this._contentType = contentType;
        }

        private _overflowMode: number = inputOverflowMode.AUTO;
        get OverflowMode() { return this._overflowMode; }
        set OverflowMode(overflowMode: inputOverflowMode) {
            this._overflowMode = overflowMode;
            this.setTextAreaOverflow();
        }

        private _textLable: label;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 输入内容label
         * @version m4m 1.0
         */
        @m4m.reflect.Field("reference", null, "label")
        get TextLabel(): label {
            return this._textLable;
        }
        set TextLabel(textLabel: label) {
            if (textLabel == this._textLable) return;
            if (textLabel) { textLabel.text = this._text; }
            this._textLable = textLabel;
        }

        private _placeholderLabel: label;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 输入内容label
         * @version m4m 1.0
         */
        @m4m.reflect.Field("reference", null, "label")
        get PlaceholderLabel(): label {
            return this._placeholderLabel;
        }
        set PlaceholderLabel(placeholderLabel: label) {
            if (placeholderLabel == this._placeholderLabel) return;

            if (placeholderLabel.text == null || placeholderLabel.text == "")
                placeholderLabel.text = "Enter Text...";
            this._placeholderLabel = placeholderLabel;
        }

        /**
         * 刷新布局
         */
        private layoutRefresh() {
            this.inputElmLayout();

            if (this._placeholderLabel) {
                if (this._placeholderLabel.transform.width != this.transform.width)
                    this._placeholderLabel.transform.width = this.transform.width;
                if (this._placeholderLabel.transform.height != this.transform.height)
                    this._placeholderLabel.transform.height = this.transform.height;
            }
            if (this._textLable) {
                if (this._textLable.transform.width != this.transform.width)
                    this._textLable.transform.width = this.transform.width;
                if (this._textLable.transform.height != this.transform.height)
                    this._textLable.transform.height = this.transform.height;

                // //溢出模式设置
                // let isSingleLine = this._lineType == lineType.SingleLine;
                // this._textLable.verticalOverflow = !isSingleLine;
                // this._textLable.horizontalOverflow = isSingleLine;
            }
        }

        /**设置 通用 样式 */
        private setStyleEle(Ele: HTMLElement) {
            Ele.style.outline = "medium";
            Ele.style.background = "transparent";
            Ele.style.border = "0";
            Ele.style.padding = "0";
            Ele.style.display = "none"
        }

        /**
         * 创建 Html的InputElement 对象
         */
        private createInputEle() {
            this.inputElement = <HTMLInputElement>document.createElement("Input");
            let inpEle = this.inputElement;
            if (this.ContentType == contentType.PassWord) {
                inpEle.type = "password";
            } else {
                inpEle.type = "text";
            }
            this.setStyleEle(inpEle);
            inpEle.style["-moz-appearance"] = 'textfield';
        }

        /**
         * 创建 Html的TextareaElement 对象
         * 多行文本输入会使用到
         */
        private createTextAreaEle() {
            this.inputElement = <HTMLTextAreaElement>document.createElement("textarea");
            let inpEle = this.inputElement;
            this.setStyleEle(inpEle);
            inpEle.style.resize = "none";
            // inpEle.style.overflowY = 'scroll';   //Y 轴滚动条
            // inpEle.style.scrollbarGutter = "stable";
            this.setTextAreaOverflow();
        }

        /**
         * 设置 TextareaElement 对象 的Overflow模式
         */
        private setTextAreaOverflow() {
            if (!this.inputElement || this._lineType == lineType.SingleLine) return;
            let _ofyStr = "";
            switch (this._overflowMode) {
                case inputOverflowMode.AUTO: _ofyStr = "auto"; break;
                case inputOverflowMode.SCROLL: _ofyStr = "scroll"; break;
                case inputOverflowMode.HIDDEN: _ofyStr = "hidden"; break;
            }
            this.inputElement.style.overflowY = _ofyStr;
        }

        /** 初始化 html 元素 */
        private initEle() {
            //ios fix thing
            this.ckIsMobile();

            //create Ele
            if (this._lineType == lineType.SingleLine) {
                this.createInputEle();
            } else {
                this.createTextAreaEle();
            }

            let inpEle = this.inputElement;
            //attchNode
            inpEle.tabIndex = 0;
            inpEle.value = this._text;
            // inpEle.autofocus = true;
            if (this.transform.canvas.scene) {
                let htmlCanv = <HTMLCanvasElement>this.transform.canvas.scene.webgl.canvas;
                if (htmlCanv)
                    htmlCanv.parentElement.appendChild(inpEle);
            }

            let eventsH = this._eventsHandle;

            //事件 handle 绑定函数
            eventsH.compositionstart = (e) => {
                this._inputStop = true;
            }

            eventsH.compositionend = (e) => {
                this._inputStop = false;
                this.textRefresh();
            }

            eventsH.blur = (e) => {
                if (inputField._isMobile && this._inputStop) {
                    if (eventsH.compositionend) eventsH.compositionend();
                }
                this.beFocus = false;
                if (this.onblur) this.onblur();
            }

            eventsH.focus = (e) => {
                this.beFocus = true;
                if (this.onfocus) this.onfocus();
            }

            eventsH.mouseout = (e) => {
                if (this.onmouseout) this.onmouseout();
            }

            eventsH.keydown = (ev: KeyboardEvent) => {
                if (this._inputStop) return;
                if (ev.code == "Enter" || (ev as any).keyCode == 13) {
                    let needSubmit = this._lineType != lineType.MultiLine_NewLine;
                    if (ev.ctrlKey) needSubmit = true; //ctr + Enter = 强制提交
                    if (needSubmit) {
                        // inpEle.blur();
                        this.setFocus(false);
                        if (this.onTextSubmit) this.onTextSubmit(this._text);
                    }
                }
                // console.error(`code:${ev.code}`);
            }

            //reg all event
            for (let key in eventsH) {
                let fun = eventsH[key];
                inpEle.addEventListener(key, fun as any);
            }

            this.inputElmLayout();
        }

        /**
         * 更新 html 元素的Style（样式）
         * @returns 
         */
        private updateEleStyle() {
            let inpEle = this.inputElement;
            if (!inpEle) return;
            //
            if (this._textLable) {
                let fontSize = this._textLable.fontsize / window.devicePixelRatio;
                inpEle.style.fontSize = `${fontSize}px`;
                let cssColor = math.colorToCSS(this._textLable.color, false);
                inpEle.style.color = cssColor;
                // let _font = this._textLable.font;
                // inpEle.style.fontFamily = 
                switch (this._textLable.horizontalType) {
                    case HorizontalType.Left: inpEle.style.textAlign = "left"; break;
                    case HorizontalType.Center: inpEle.style.textAlign = "center"; break;
                    case HorizontalType.Right: inpEle.style.textAlign = "right"; break;
                }
            }

            let placeholderStr = "Enter Text...";
            if (this._placeholderLabel) placeholderStr = this._placeholderLabel.text;

            inpEle.placeholder = placeholderStr;
        }

        /**
         * 销毁 html 元素
         * @returns 
         */
        private removeEle() {
            let inpEle = this.inputElement;
            if (!inpEle) return;
            //unreg all event
            for (let key in this._eventsHandle) {
                let fun = this._eventsHandle[key];
                inpEle.removeEventListener(key, fun as any);
            }
            //remove
            inpEle.disabled = false;
            inpEle.value = "";
            inpEle.style.display = "none";
            if (inpEle.parentElement)
                inpEle.parentElement.removeChild(inpEle);
            this.inputElement = null;
        }

        start() {
            this.initEle();
        }

        /**
         * 检查是否是 移动设备
         */
        private ckIsMobile() {
            if (inputField._isMobile == null) {
                if (navigator && navigator.userAgent) {
                    let u = navigator.userAgent.toLowerCase();
                    inputField._isMobile = /mobile|iphone|ipad|android/.test(u);
                } else {
                    inputField._isMobile = false;
                }
            }
        }

        onPlay() {

        }

        /**
        * inputElement 位置、宽高刷新
        */
        private inputElmLayout() {
            if (this.inputElement == null) return;
            let pos = this.transform.getWorldTranslate();
            let cssStyle: CSSStyleDeclaration = this.inputElement.style;
            let p = this.transform.pivot;
            let w = this.transform.width;
            let h = this.transform.height;
            let realX = pos.x - p.x * w;
            let realY = pos.y - p.y * h;
            if (realX + "px" == cssStyle.left && realY + "px" == cssStyle.top && w + "px" == cssStyle.width && h + "px" == cssStyle.height)
                return;

            let scalex = sceneMgr.app.canvasClientWidth / this.transform.canvas.pixelWidth;
            let scaley = sceneMgr.app.canvasClientHeight / this.transform.canvas.pixelHeight;
            cssStyle.position = "absolute";
            cssStyle.left = realX * scalex + "px";
            cssStyle.top = realY * scaley + "px";

            cssStyle.width = w * scalex + "px";
            cssStyle.height = h * scaley + "px";
        }

        /**
         * 输入文本刷新
         */
        private textRefresh() {
            if (this._inputStop || !this.inputElement) return;

            let realMaxLen = this._charlimit;
            if (realMaxLen <= 0) { realMaxLen = -1; }
            if (this.inputElement.maxLength != realMaxLen) {
                //刷输入限制
                this.inputElement.maxLength = realMaxLen;
                return;
            }

            if (!this._textLable || !this._placeholderLabel || this._text == this.inputElement.value) return;

            this._text = this.inputElement.value;
            if (this._contentType == contentType.Custom) {
                if (this.customRegexStr != null && this.customRegexStr != "")
                    this._text = this._text.replace(this.customRegexStr, '');
            } else {
                if (this._contentType == contentType.None) {

                }
                //英文字母，数字，汉字，下划线
                else if ((this._contentType & contentType.Number) && (this._contentType & contentType.Word) && (this._contentType & contentType.ChineseCharacter) && (this._contentType & contentType.Underline)) {
                    this._text = this._text.replace(/^[\u4E00-\u9FA5a-zA-Z0-9_]{3,20}$/ig, '');
                }
                //英文字母，数字，下划线
                else if ((this._contentType & contentType.Number) && (this._contentType & contentType.Word) && (this._contentType & contentType.Underline)) {
                    this._text = this._text.replace(/[^\w\.\/]/ig, '');
                }
                //数字，字符
                else if ((this._contentType & contentType.Number) && (this._contentType & contentType.Word)) {
                    this._text = this._text.replace(/[^(A-Za-z0-9)]/ig, '');
                }
                //汉字，字符
                else if ((this._contentType & contentType.ChineseCharacter) && (this._contentType & contentType.Word)) {
                    this._text = this._text.replace(/[^(A-Za-z\u4E00-\u9FA5)]/ig, '');
                }
                //数字
                else if (this._contentType == contentType.Number) {
                    this._text = this._text.replace(/\D+/g, '');
                }
                //汉字
                else if (this._contentType == contentType.ChineseCharacter) {
                    this._text = this._text.replace(/[^\u4E00-\u9FA5]/g, '');
                }

            }

            //记录过滤 后的text
            this.inputElement.value = this._text;
            if (this._textLable) {
                this._textLable.text = this._text;
                //密码模式
                if (this._contentType == contentType.PassWord) {
                    this._textLable.text = this._text.replace(/[\S|\s]/g, "*");
                }
            }
        }

        update(delta: number) {
            this.layoutRefresh();
            this.textRefresh();
        }

        remove() {
            if (this._textLable) this._textLable.onAddRendererText = null;
            this._placeholderLabel = null;
            this._textLable = null;
            this.transform = null;
            this._frameImage = null;
            this.removeEle();
            this.onTextSubmit = null;
            this.onblur = null;
            this.onfocus = null;
            this.onmouseout = null;
        }

        onPointEvent(canvas: canvas, ev: PointEvent, oncap: boolean) {
            // if(this._isIos) return;
            if (oncap == false) {
                if (ev.type != event.PointEventEnum.PointDown) return;
                var b = this.transform.ContainsCanvasPoint(new math.vector2(ev.x, ev.y));
                this.setFocus(b);
            }
        }

        /**
         * 设置 输入聚焦状态
         * @param isFocus 是否聚焦 
         */
        setFocus(isFocus: boolean) {
            if (isFocus) {
                this.showEle();
                if (!this.beFocus) {
                    this.inputElement.focus();
                }
            }
            else {
                if (this.beFocus) this.inputElement.blur();
                this.showLable();
            }
        }

        /** 显示 标签 */
        private showLable() {
            if (this.inputElement) this.inputElement.style.display = "none";

            if (this._textLable) {
                this._textLable.transform.visible = false;
                if (this._placeholderLabel) this._placeholderLabel.transform.visible = false;

                if (this._textLable.text != "") {
                    this._textLable.transform.visible = true;
                } else {
                    if (this._placeholderLabel) this._placeholderLabel.transform.visible = true;
                }
            }
        }

        /** 显示 html组件 */
        private showEle() {
            //更新
            this.updateEleStyle();

            if (this.inputElement) this.inputElement.style.display = "";   //显示html元素对象

            if (this._textLable) this._textLable.transform.visible = false;
            if (this._placeholderLabel) this._placeholderLabel.transform.visible = false;
        }
    }

    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 文本行显示方式
     * @version m4m 1.0
     */
    export enum lineType {
        /** 单行模式 */
        SingleLine,
        /** 多行模式 (输入回车键提交)*/
        MultiLine,
        /** 多行模式 (输入回车键换行处理 , ctrl + 回车 为提交处理)*/
        MultiLine_NewLine,
    }

    /**
     * @language zh_CN
     * @classdesc
     * 文本内容类型
     * @version m4m 1.0
     */
    export enum contentType {
        None = 0,
        /** 数字*/
        Number = 1,
        /** 字母 */
        Word = 2,
        /** 下划线 */
        Underline = 4,
        /**中文字符 */
        ChineseCharacter = 8,
        /**没有中文字符 */
        NoneChineseCharacter = 16,
        /**邮件 */
        Email = 32,
        /**密码 */
        PassWord = 64,
        /** 自定义 */
        Custom = 128,
    }

    /**
     * 输入框 滑动进度条模式
     */
    export enum inputOverflowMode {
        /** 按需要启用滑动进度条 */
        AUTO,
        /** 隐藏滑动进度条 */
        HIDDEN,
        /** 一直显示滑动进度条 */
        SCROLL
    }
}