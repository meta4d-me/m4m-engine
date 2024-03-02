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
     * 原生3d模型类型
     * @version m4m 1.0
     */
    export enum PrimitiveType {
        Sphere,
        Capsule,
        Cylinder,
        Cube,
        Plane,
        Quad,
        Pyramid
    }

    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 原生2d类型
     * @version m4m 1.0
     */
    export enum Primitive2DType {
        /** 原始图片渲染器 */
        RawImage2D,
        /** 多功能图片渲染器（sprite） */
        Image2D,
        /** 文本渲染器 */
        Label,
        /** 按钮 */
        Button,
        /** 输入框 */
        InputField,
        /** 进度条 */
        Progressbar,
        /** Panel */
        Panel,
        /** ScrollView */
        ScrollRect,
    }

    /**
     * 判断 函数对象代码实现内容是否是空的
     * @param fun 函数
     */
    export function functionIsEmpty(fun: Function) {
        if (!fun) true;
        let funStr = fun.toString().replace(/\s/g, "");
        let idx = funStr.indexOf("{");
        let idx_1 = funStr.indexOf("}");
        if (idx == -1 || idx_1 == -1) return true;
        return (idx_1 - idx) <= 1;
    }

    /**
     * 获取实例对象的类名字符串
     * @param obj 对象实例
     */
    export function getClassName(obj: Object) {
        if (!obj) return "";
        let constructor = Object.getPrototypeOf(obj).constructor;
        if (!constructor) return "";
        return constructor.name;
    }

    /**
     * @public
     * @language zh_CN
     * @classdesc
     * Transform工具类
     * @version m4m 1.0
     */
    export class TransformUtil {
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 创建默认的3d对象
         * @param type 原生3d对象类型
         * @param app application的实例
         * @version m4m 1.0
         */
        static CreatePrimitive(type: PrimitiveType, app: application = null): transform {
            if (!app) {
                app = sceneMgr.app;
            }
            let objName = (PrimitiveType[type] as string);

            let trans = new transform();
            trans.name = objName;
            var mesh = trans.gameObject.addComponent("meshFilter") as meshFilter;
            var smesh = app.getAssetMgr().getDefaultMesh(objName.toLowerCase());
            mesh.mesh = smesh;
            var renderer = trans.gameObject.addComponent("meshRenderer") as meshRenderer;
            renderer.materials = [];
            renderer.materials.push(new framework.material());
            renderer.materials[0].setShader(app.getAssetMgr().getShader("shader/def"));
            return trans;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 创建默认的2d控件
         * @param type 2d控件类型
         * @param app application的实例
         * @version m4m 1.0
         */
        static Create2DPrimitive(type: Primitive2DType, app: application = null): transform2D {
            if (!app) {
                app = sceneMgr.app;
            }
            // let enumObj = EnumUtil.getEnumObjByType("m4m.framework.Primitive2DType");
            let objName = (Primitive2DType[type] as string);
            let componentName = StringUtil.firstCharToLowerCase(objName);

            let t2d = this.make2DNode(objName);
            let i2dComp = t2d.addComponent(componentName);

            switch (type) {
                case Primitive2DType.RawImage2D:
                    TransformUtil.create2D_rawImage(i2dComp as rawImage2D, app);
                    break;
                case Primitive2DType.Image2D:
                    TransformUtil.create2D_image2D(i2dComp as image2D, app);
                    break;
                case Primitive2DType.Label:
                    TransformUtil.create2D_label(i2dComp as label, app);
                    break;
                case Primitive2DType.Button:
                    TransformUtil.create2D_button(i2dComp as button, app);
                    break;
                case Primitive2DType.InputField:
                    TransformUtil.create2D_InputField(i2dComp as inputField, app);
                    break;
                case Primitive2DType.Progressbar:
                    TransformUtil.create2D_progressbar(i2dComp as progressbar, app);
                    break;
                case Primitive2DType.ScrollRect:
                    TransformUtil.create2D_scrollRect(i2dComp as scrollRect, app);
                    break;
            }
            return t2d;
        }

        /**
         * 创建一个2D 节点
         * @param name 名字
         * @param parent 父节点
         * @param lOpt 布局选项
         * @param w 宽
         * @param h 高
         * @param px 坐标x
         * @param py 坐标y
         * @returns 2D 节点
         */
        private static make2DNode(name: string, parent: transform2D = null, lOpt: layoutOption = layoutOption.NOTHING, w: number = 100, h: number = 100, px: number = 0, py: number = 0) {
            let node: transform2D = new transform2D();
            node.name = name;
            node.width = w;
            node.height = h;
            node.layoutState = lOpt;
            node.pivot.x = px;
            node.pivot.y = py;
            if (parent) parent.addChild(node);

            return node;
        }

        /**
         * 构建一个 2D rawImage 节点
         * @param img rawImage节点
         * @param app 引擎app
         */
        private static create2D_rawImage(img: rawImage2D, app: application) {
            img.transform.width = 100;
            img.transform.height = 100;
            img.image = app.getAssetMgr().getDefaultTexture("white");
        }

        /**
         * 构建一个 2D image2D 节点
         * @param img image2D节点
         * @param app 引擎app
         */
        private static create2D_image2D(img: image2D, app: application) {
            img.transform.width = 100;
            img.transform.height = 100;
            img.sprite = app.getAssetMgr().getDefaultSprite("white_sprite");
        }

        /**
         * 构建一个 进度条
         * @param progress 进度条节点
         * @param app 引擎app
         */
        private static create2D_progressbar(progress: progressbar, app: application) {
            progress.transform.width = 160;
            progress.transform.height = 20;
            let bgimg = progress.transform.addComponent("image2D") as m4m.framework.image2D;
            bgimg.sprite = app.getAssetMgr().getDefaultSprite("white_sprite");
            bgimg.color = new m4m.math.color(0.6, 0.6, 0.6, 1);
            progress.barBg = bgimg;

            let layout = m4m.framework.layoutOption;
            let Opt = layout.TOP | layout.BOTTOM | layout.LEFT;
            let cut = this.make2DNode("FillCut", progress.transform, Opt);
            // cut.isMask = true;
            progress.cutPanel = cut;

            let fill = this.make2DNode("Fill", cut, Opt);
            let fillimg = fill.addComponent("image2D") as m4m.framework.image2D;
            fillimg.sprite = app.getAssetMgr().getDefaultSprite("white_sprite");
            progress.barOverImg = fillimg;

            // progress.transform.markDirty();
        }

        /**
         * 构建一个 滑动矩形区
         * @param scrollrect 滑动矩形区节点
         * @param app 引擎app
         */
        private static create2D_scrollRect(scrollrect: scrollRect, app: application) {
            scrollrect.transform.width = 200;
            scrollrect.transform.height = 200;
            let img = scrollrect.transform.addComponent("image2D") as m4m.framework.image2D;
            img.sprite = app.getAssetMgr().getDefaultSprite("white_sprite");
            img.color = new m4m.math.color(0.3, 0.3, 0.3, 1);

            let cont = this.make2DNode("Content", scrollrect.transform);
            cont.width = scrollrect.transform.width + 100;
            cont.height = scrollrect.transform.height + 100;

            scrollrect.content = cont;
            scrollrect.horizontal = true;
            scrollrect.vertical = true;
            scrollrect.transform.isMask = true;
            scrollrect.transform.markDirty();
        }

        /**
         * 构建一个 文本标签
         * @param label 文本标签节点
         * @param app 引擎app
         */
        private static create2D_label(label: label, app: application) {
            label.transform.width = 150;
            label.transform.height = 50;
            label.text = "label";
            label.fontsize = 24;
            label.color = new m4m.math.color(1, 0, 0, 1);
            // let _font = app.getAssetMgr().getAssetByName("STXINGKA.font.json");
            // if (_font == null)
            // {
            //     app.getAssetMgr().load("res/STXINGKA.TTF.png", m4m.framework.AssetTypeEnum.Auto, (s) =>
            //     {
            //         if (s.isfinish)
            //         {
            //             app.getAssetMgr().load("res/resources/STXINGKA.font.json", m4m.framework.AssetTypeEnum.Auto, (s1) =>
            //             {
            //                 label.font = app.getAssetMgr().getAssetByName("STXINGKA.font.json") as m4m.framework.font;
            //                 label.transform.markDirty();
            //             });
            //         }
            //     });
            // }
            // else
            // {
            //     label.font = _font as m4m.framework.font;;
            //     label.transform.markDirty();
            // }
        }

        /**
         * 构建一个 按钮
         * @param btn 按钮节点
         * @param app 引擎app
         */
        private static create2D_button(btn: button, app: application) {
            btn.transform.width = 150;
            btn.transform.height = 50;
            let img = btn.transform.addComponent("image2D") as m4m.framework.image2D;
            img.sprite = app.getAssetMgr().getDefaultSprite("white_sprite");
            img.imageType = m4m.framework.ImageType.Sliced;
            btn.targetImage = img;
            btn.transition = m4m.framework.TransitionType.ColorTint;//颜色变换

            // var lab = new m4m.framework.transform2D();
            var lab = this.make2DNode("label", btn.transform, 0, 150, 50);
            lab.localTranslate.y = -10;
            var label = lab.addComponent("label") as m4m.framework.label;
            label.text = "button";
            label.fontsize = 25;
            label.color = new m4m.math.color(1, 0, 0, 1);


            // let _font = app.getAssetMgr().getAssetByName("STXINGKA.font.json");
            // if (_font == null)
            // {
            //     app.getAssetMgr().load("res/STXINGKA.TTF.png", m4m.framework.AssetTypeEnum.Auto, (s) =>
            //     {
            //         if (s.isfinish)
            //         {
            //             app.getAssetMgr().load("res/resources/STXINGKA.font.json", m4m.framework.AssetTypeEnum.Auto, (s1) =>
            //             {
            //                 label.font = app.getAssetMgr().getAssetByName("STXINGKA.font.json") as m4m.framework.font;
            //                 btn.transform.markDirty();
            //             });
            //         }
            //     });
            // }
            // else
            // {
            //     label.font = _font as m4m.framework.font;;
            //     btn.transform.markDirty();
            // }
        }

        /**
         * 构建一个 输入框
         * @param ipt 输入框
         * @param app 引擎app
         */
        private static create2D_InputField(ipt: inputField, app: application) {
            let assetMgr = app.getAssetMgr();
            let opt = layoutOption;
            let tOpt = opt.TOP | opt.RIGHT | opt.BOTTOM | opt.LEFT;
            //设置节点
            let node = ipt.transform;
            node.width = 160;
            node.height = 30;
            node.isMask = true;

            //添加 背景图
            let bg_t = this.make2DNode("frameImage", node, tOpt);
            let bg_img = bg_t.addComponent("image2D") as image2D;
            bg_img.sprite = assetMgr.getDefaultSprite("white_sprite");
            bg_img.color = new math.color(0.8, 0.8, 0.8, 1);

            let fSize = 24;
            //添加 Text lable
            let text_t = this.make2DNode("Text", node, tOpt);
            let text_l = text_t.addComponent("label") as label;
            text_l.verticalType = m4m.framework.VerticalType.Top;
            text_l.horizontalType = m4m.framework.HorizontalType.Left;
            text_l.fontsize = fSize;
            math.colorSet(text_l.color, 0, 0, 0, 1);
            math.colorSet(text_l.color2, 0, 0, 0, 0.5);

            //添加 占位文本 label
            let placeholder_t = this.make2DNode("Placeholder", node, tOpt);
            let placeholder_l = placeholder_t.addComponent("label") as label;
            placeholder_l.verticalType = m4m.framework.VerticalType.Top;
            placeholder_l.horizontalType = m4m.framework.HorizontalType.Left;
            placeholder_l.fontsize = fSize;
            math.colorSet(placeholder_l.color, 0.6, 0.6, 0.6, 1);
            math.colorSet(placeholder_l.color2, 0.6, 0.6, 0.6, 0.5);

            //组合
            ipt.TextLabel = text_l;
            ipt.PlaceholderLabel = placeholder_l;
            ipt.frameImage = bg_img;
            node.markDirty();
        }

    }
}