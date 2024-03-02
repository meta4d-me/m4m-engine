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
/// <reference path="../../transform/transform.ts" />
/// <reference path="../../component/boxcollider.ts" />
/// <reference path="../../component/meshcollider.ts" />
/// <reference path="../../component/meshfilter.ts" />
/// <reference path="../../component/meshrenderer.ts" />
/// <reference path="../../component/skinnedmeshrenderer.ts" />

namespace m4m.framework {

    export enum Interpolation {
        Linear, // 线性插值(Default)
        Step,   // 不插值
        Curve   // 曲线插值
    }

    export enum WrapMode {
        Default = 0,
        Once = 1,
        Clamp = 1,
        Loop = 2,
        PingPong = 4,
        ClampForever = 8
    }

    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 关键帧动画片段资源
     * @version m4m 1.0
     */
    @m4m.reflect.SerializeType
    export class keyFrameAniClip implements IAsset {
        static readonly ClassName: string = "keyFrameAniClip";

        @m4m.reflect.Field("constText")
        private name: constText;
        private id: resID = new resID();
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 是否为默认资源
         * @version m4m 1.0
         */
        defaultAsset: boolean = false;
        /**
         * 关键帧片段 资源
         * @param assetName 资源名 
         */
        constructor(assetName: string = null) {
            if (!assetName) {
                assetName = "keyFrameAniClip_" + this.getGUID();
            }
            this.name = new constText(assetName);
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取资源名称
         * @version m4m 1.0
         */
        getName(): string {
            return this.name.getText();
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取资源唯一id
         * @version m4m 1.0
         */
        getGUID(): number {
            return this.id.getID();
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 引用计数加一
         * @version m4m 1.0
         */
        use() {
            sceneMgr.app.getAssetMgr().use(this);
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 引用计数减一
         * @version m4m 1.0
         */
        unuse(disposeNow: boolean = false) {
            sceneMgr.app.getAssetMgr().unuse(this, disposeNow);
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 释放资源
         * @version m4m 1.0
         */
        dispose() {
            this.curves.length = 0;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 计算资源字节大小
         * @version m4m 1.0
         */
        caclByteLength(): number {
            let total = 0;
            // for (let k in this.bones)
            // {
            //     total += math.caclStringByteLength(this.bones[k]);
            // }

            // for (let k in this.frames)
            // {
            //     total += this.frames[k].byteLength;

            //     total += math.caclStringByteLength(k);
            // }

            // total += subClip.caclByteLength() * this.subclips.length;

            return total;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 解析资源
         * @param jsonStr 动画json数据
         * @version m4m 1.0
         */
        Parse(jsonStr: string) {
            let obj = JSON.parse(jsonStr);
            let tag = obj["tag"];
            this.length = obj["length"];
            this._wrapMode = obj["wrapMode"];
            this.frameRate = obj["frameRate"];
            this._interpolation = obj["interpolation"] || Interpolation.Linear;
            let curves_o: any[] = obj["curves"];
            for (var i = 0; i < curves_o.length; i++) {
                let curve = new AnimationCurve();
                let curve_o = curves_o[i];
                let kfs_o: any[] = curve_o["keyFrames"];
                curve.path = curve_o["path"];
                //curve.propertyName = curve_o["propertyName"];
                curve.propertyName = kFAniClipUtil.converUnityTypeProperty(curve_o["type"], curve_o["propertyName"]);
                //curve.type = curve_o["type"];
                curve.type = kFAniClipUtil.converUnityType(curve_o["type"]);
                for (var j = 0; j < kfs_o.length; j++) {
                    let kf_o = kfs_o[j];
                    let kf = new keyFrame();
                    if (typeof (kf_o["inTangent"]) === "string")
                        kf.inTangent = Number(kf_o["inTangent"]);
                    else
                        kf.inTangent = kf_o["inTangent"];

                    if (typeof (kf_o["outTangent"]) === "string")
                        kf.outTangent = Number(kf_o["outTangent"]);
                    else
                        kf.outTangent = kf_o["outTangent"];

                    kf.tangentMode = kf_o["tangentMode"];
                    kf.time = kf_o["time"];
                    kf.value = kf_o["value"];
                    curve.keyFrames.push(kf);
                }
                this.curves.push(curve);
            }
            return this;
        }

        //总时长 /s
        private length: number = 0;

        /**
         * @public
         * @language zh_CN
         * 循环模式
         * @version m4m 1.0
         */
        get wrapMode() { return this._wrapMode; }
        _wrapMode: WrapMode;

        /**
         * @public
         * @language zh_CN
         * 动画片段的帧率
         * @version m4m 1.0
         */
        get fps() {
            return this.frameRate;
        }
        private frameRate: number = 0;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 播放时长
         * @version m4m 1.0
         */
        get time() {
            return this.length;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 最大帧数
         * @version m4m 1.0
         */
        get frameCount() { return Math.floor(this.frameRate * this.length); }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 属性变化曲线数组
         * @version m4m 1.0
         */
        curves: AnimationCurve[] = [];

        private _interpolation = Interpolation.Linear;
        get interpolation() {
            return this._interpolation;
        }
    }

    export class AnimationCurve {
        public path: string; //"gameobj_0/gameobj_1"  父子树路径
        public type: string; //"meshRenaderer" 组件名
        public propertyName: string; //"loaclpostion.x"  属性路径
        public keyFrames: keyFrame[] = []; //曲线上的 关键帧
    }

    export class keyFrame {
        public inTangent: number; //贝塞尔 入切线率
        public outTangent: number;//贝塞尔 出切线率
        public tangentMode: number; //记录 编辑模式（auto 、free 等等）
        public time: number;  //时间点
        public value: number; //该帧修改值
    }


    class kFAniClipUtil {
        private static propTag = "__prop__";
        private static _typePair: object = kFAniClipUtil.regType();
        static get typePair() {
            if (!kFAniClipUtil._typePair) kFAniClipUtil._typePair = kFAniClipUtil.regType();
            return kFAniClipUtil._typePair;
        }

        /** @deprecated [已弃用] */
        static isUnityExp(tag: string) {
            if (StringUtil.isNullOrEmptyObject(tag)) return false;
            return tag.indexOf("unity") != -1;
        }

        /**
         * unity定义类型 转换为引擎定义类型
         * @param tyep unity定义类型
         * @returns 引擎定义类型
         */
        static converUnityType(tyep: string) {
            let result = "";
            if (StringUtil.isNullOrEmptyObject(tyep)) return result;
            if (tyep.indexOf("UnityEngine") == -1) return tyep;//非unity 内建组件
            let strs = tyep.split(".");
            if (strs.length < 1 || !strs[strs.length - 1]) return result;
            let tempT = strs[strs.length - 1];
            let obj = kFAniClipUtil._typePair[tempT];
            if (obj != null) {
                result = obj["type"];
            }
            return result;
        }

        /**
         * unity定义类型属性 转换为引擎定义类型属性
         * @param tyep unity定义类型
         * @param propertyName unity定义属性
         * @returns 引擎定义属性
         */
        static converUnityTypeProperty(tyep: string, propertyName: string) {
            let result = propertyName;
            if (StringUtil.isNullOrEmptyObject(propertyName)) return "";
            if (tyep.indexOf("UnityEngine") != -1) {
                let strs = tyep.split(".");
                tyep = strs[strs.length - 1];
            }
            let obj = kFAniClipUtil._typePair[tyep];
            let cgProperty = propertyName;
            if (propertyName.lastIndexOf(".") != -1) {
                cgProperty = propertyName.substr(0, propertyName.lastIndexOf("."));
            }
            if (obj && obj[kFAniClipUtil.propTag] && obj[kFAniClipUtil.propTag][cgProperty]) {
                let str: string = obj[kFAniClipUtil.propTag][cgProperty];
                result = propertyName.replace(cgProperty, str);
            }
            return result;
        }

        /**
         * 注册转换 类型
         * @returns 注册数据字典对象
         */
        private static regType() {
            let result = {};
            result["Transform"] = { "type": transform["name"] };
            result["BoxCollider"] = { "type": boxcollider["name"] };
            result["MeshRenderer"] = { "type": meshRenderer["name"] };
            result["MeshFilter"] = { "type": meshFilter["name"] };
            result["SkinnedMeshRenderer"] = { "type": skinnedMeshRenderer["name"] };
            kFAniClipUtil.regProperty(result);
            return result;
        }
        
        /**
         * 注册转换 具体属性
         * @param obj 被注册的对象
         */
        private static regProperty(obj) {
            //Transform
            kFAniClipUtil.assemblyProp(obj, "Transform", "m_LocalPosition", "localTranslate");
            kFAniClipUtil.assemblyProp(obj, "Transform", "m_LocalScale", "localScale");
            kFAniClipUtil.assemblyProp(obj, "Transform", "m_LocalRotation", "localRotate");
        }
        /**
         * 装配挂载属性
         * @param obj 被装配对象
         * @param Type 类型
         * @param prop 属性
         * @param replaceProp 替换属性
         */
        private static assemblyProp(obj, Type: string, prop: string, replaceProp) {
            if (!obj["Transform"][kFAniClipUtil.propTag])
                obj["Transform"][kFAniClipUtil.propTag] = {};
            obj["Transform"][kFAniClipUtil.propTag][prop] = replaceProp;
        }
    }
}