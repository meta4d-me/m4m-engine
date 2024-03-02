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
///// <reference path="../../lib/Reflect.d.ts"/>


namespace m4m {

    export var m4m_reflect_root:any = {};
    
    export namespace reflect {
        /**
         * 是组件？
         * @param type 类型字符串
         * @returns bool
         */
        export function isComp(type:string)
        {
           return m4m_reflect_root.__gdmeta__[type] && 
            m4m_reflect_root.__gdmeta__[type].__gdmeta__&&
            m4m_reflect_root.__gdmeta__[type].__gdmeta__.class.custom.nodecomp;
        }
        /**
         * 注册类型
         * @private
         */
        function regType(constructorObj: any, customInfo: { [id: string]: string }) {
            let target=constructorObj.prototype;
            if (target["__gdmeta__"] == undefined) target["__gdmeta__"] = {};
            if (target["__gdmeta__"]["class"] == undefined) target["__gdmeta__"]["class"] = {};
            var name = target["constructor"]["name"];
            if (name == null)//this is for ie
            {
                var fs: string = target["constructor"].toString();
                var i = fs.indexOf("(");
                name = fs.substring(9, i);
            }
            let classname=constructorObj["ClassName"];
            name=classname?classname:name;

            target["__gdmeta__"]["class"]["typename"] = name;

            //注册全局类型标记
            if (m4m_reflect_root["__gdmeta__"] == null)
                m4m_reflect_root["__gdmeta__"] = {};
            m4m_reflect_root["__gdmeta__"][name] = target;

            //fill custom info
            if (target["__gdmeta__"]["class"]["custom"] == null)
                target["__gdmeta__"]["class"]["custom"] = {};
            if (customInfo != null) {
                for (var key in customInfo) {
                    target["__gdmeta__"]["class"]["custom"][key] = customInfo[key];
                }
            }
        }
        /**
         * 注册函数
         * @private
         */
        function regFunc(target: any, funcname: string, customInfo: { [id: string]: string }) {
            //fill type
            if (target["__gdmeta__"] == undefined)
                target["__gdmeta__"] = {};
            if (target["__gdmeta__"][funcname] == null)
                target["__gdmeta__"][funcname] = {};

            target["__gdmeta__"][funcname]["type"] = "function";

            //fill meta
            // var tp = Reflect.getMetadata("design:paramtypes", target, funcname);
            // var tr = Reflect.getMetadata("design:returntype", target, funcname);
            // target["__gdmeta__"][funcname]["paramtypes"] = [];
            // for (var i in tp) {
            //     target["__gdmeta__"][funcname]["paramtypes"][i] = tp[i]["name"];
            // }
            // target["__gdmeta__"][funcname]["returntype"] = tr == null ? null : tr["name"];

            //fill custom info
            if (target["__gdmeta__"][funcname]["custom"] == null)
                target["__gdmeta__"][funcname]["custom"] = {};
            if (customInfo != null) {
                for (var key in customInfo) {
                    target["__gdmeta__"][funcname]["custom"][key] = customInfo[key];
                }
            }
        }
        /**
         * 注册字段
         * @private
         */
        function regField(target: Object, fieldName: string, customInfo: { [id: string]: any }) {
            //fill type
            if (target["__gdmeta__"] == undefined)
                target["__gdmeta__"] = {};
            if (target["__gdmeta__"][fieldName] == null)
                target["__gdmeta__"][fieldName] = {};


            target["__gdmeta__"][fieldName]["type"] = "field";

            //fill meta 
            // var t = Reflect.getMetadata("design:type", target, fieldName);
            // if (t == null)//ie.反射这套sb 机制 ，居然和ie不兼容
            // {
            //     target["__gdmeta__"][fieldName]["valuetype"] = null;
            // }
            // else
            // {
            //     target["__gdmeta__"][fieldName]["valuetype"] = t["name"];
            // }
            //fill custom info
            if (target["__gdmeta__"][fieldName]["custom"] == null)
                target["__gdmeta__"][fieldName]["custom"] = {};
            if (customInfo != null) {
                for (var key in customInfo) {
                    target["__gdmeta__"][fieldName]["custom"][key] = customInfo[key];
                }
            }
        }

        /**
         * @deprecated [已弃用]
         * 获取原型列表 
         * @private
         */
        export function getPrototypes(): { [id: string]: any } {

            return m4m_reflect_root["__gdmeta__"];
        }
        /**
         * 获取原型列表
         * @private
         */
        export function getPrototype(name: string) {
            return m4m_reflect_root["__gdmeta__"][name];
        }
        /**
         * 创建实例对象
         * @private
         */
        export function createInstance(prototype: any, matchTag: { [id: string]: string }): any {
            // var type = getProtoTypes()[name];
            // if (type[name] == null)
            //     return null;
            if (matchTag == null) {
                var ctor = prototype.constructor;
                return new ctor();
            }
            else {
                var info = prototype["__gdmeta__"]["class"]["custom"];
                for (var key in matchTag) {
                    if (info[key] != matchTag[key]) {
                        console.warn("createInstance:" + name + ". tag do not match.");
                        return null;
                    }
                }
                var ctor = prototype.constructor;
                return new ctor();
            }
        }
        /**
         * 获取类名
         * @private
         */
        export function getClassName(prototype: any) {
            var info = prototype["__gdmeta__"]["class"]["typename"];
            return info;
        }
        /**
         * 获取类Tag
         * @private
         */
        export function getClassTag(prototype: any, tag: string) {
            var info = prototype["__gdmeta__"]["class"]["custom"];
            return info[tag];
        }
        /**
         * 获取引擎元标记数据
         * @private
         */
        export function getMeta(prototype: any): any {
            var meta = prototype.__gdmeta__;
            return meta;
        }
        /**
         * @deprecated [已弃用]
         * @private
         */
        export function attr_Class(constructorObj: any) {
            regType(constructorObj, null);
        }


        /**
         * @deprecated [已弃用]
         * @private
         */
        export function attr_Func(customInfo: { [id: string]: string } = null) {
            return function (target, propertyKey: string, value: any) {
                regFunc(target, propertyKey, customInfo);
            }
        }
        /**
         * @deprecated [已弃用]
         * @private
         */
        export function attr_Field(customInfo: { [id: string]: string } = null) {
            return function (target: Object, propertyKey: string) {
                regField(target, propertyKey, customInfo);
            }
        }

        /**
         * @deprecated [已弃用]
         * @private
         */
        export function userCode(constructorObj: any) {
            regType(constructorObj, { "usercode": "1" });
        }
        /**
         * @deprecated [已弃用]
         * @private
         */
        export function editorCode(constructorObj: any) {
            regType(constructorObj, { "editorcode": "1" });
        }
        /**
         * 装饰器 自我克隆
         * @private
         */
        export function selfClone(constructorObj: any) {
            regType(constructorObj, { "selfclone": "1" });
        }
        /**
         * 装饰器 组件
         * @private
         */
        export function nodeComponent(constructorObj: any) {
            regType(constructorObj, { "nodecomp": "1" });
        }
        /**
         * @deprecated [已弃用]
         * @private
         */
        export function nodeComponentInspector(constructorObj: any) {
            regType(constructorObj, { "nodecomp_inspector": "1" });
        }
        /**
         * 装饰器 可渲染节点对象
         * @private
         */
        export function nodeRender(constructorObj: any) {
            regType(constructorObj, { "renderer": "1" });
        }
        /**
         * 装饰器 相机
         * @private
         */
        export function nodeCamera(constructorObj: any) {
            regType(constructorObj, { "camera": "1" });
        }
        /**
         * 装饰器 光源
         * @private
         */
        export function nodeLight(constructorObj: any) {
            regType(constructorObj, { "light": "1" });
        }
        /**
         * 装饰器 box碰撞体
         * @private
         */
        export function nodeBoxCollider(constructorObj: any) {
            regType(constructorObj, { "boxcollider": "1" });
        }
        /**
         * 装饰器 2d Box碰撞体
         * @private
         */
        export function nodeBoxCollider2d(constructorObj: any) {
            regType(constructorObj, { "boxcollider2d": "1" });
        }
        /**
         * 装饰器 2D物理对象标记
         * @private
         */
        export function node2DPhysicsBody(constructorObj: any) {
            regType(constructorObj, { "node2dphysicsbody": "1" });
        }
        /**
         * 装饰器 球碰撞体
         * @private
         */
        export function nodeSphereCollider(constructorObj: any) {
            regType(constructorObj, { "spherecollider": "1" });
        }
        /**
         * 装饰器 特效合批
         * @private
         */
        export function nodeEffectBatcher(constructorObj: any) {
            regType(constructorObj, { "effectbatcher": "1" });
        }
        /**
         * 装饰器 网格碰撞体
         * @private
         */
        export function nodeMeshCollider(constructorObj: any) {
            regType(constructorObj, { "meshcollider": "1" });
        }
        /**
         * 装饰器 canvas渲染 碰撞体
         * @private
         */
        export function nodeCanvasRendererCollider(constructorObj: any) {
            regType(constructorObj, { "canvasRenderer": "1" });
        }
        /**
         * 装饰器 2D组件标记
         * @private
         */
        export function node2DComponent(constructorObj: any) {
            regType(constructorObj, { "2dcomp": "1" });
        }
        /**
         * @deprecated [已弃用]
         * @private
         */
        export function pluginMenuItem(constructorObj: any) {
            regType(constructorObj, { "plugin_menuitem": "1" });
        }
        /**
         * @deprecated [已弃用]
         * @private
         */
        export function pluginWindow(constructorObj: any) {
            regType(constructorObj, { "plugin_window": "1" });
        }
        /**
         * @deprecated [已弃用]
         * @private
         */
        export function pluginExt(constructorObj: any) {
            regType(constructorObj, { "plugin_ext": "1" });
        }
        /**
         * @deprecated [已弃用]
         * @private
         */
        export function compValue(integer: boolean = false, defvalue: number = 0, min: number = Number.MIN_VALUE, max: number = Number.MAX_VALUE) {
            return function (target: Object, propertyKey: string) {
                regField(target, propertyKey, {
                    "compValue": "1",
                    "integer": integer ? "1" : "0",
                    "defvalue": defvalue.toString(),
                    "min": min.toString(),
                    "max": max.toString(),
                });
            }
        }

        /**
         * 装饰器 组件调用
         * @private
         */
        export function compCall(customInfo: { [id: string]: string } = null) {
            return function (target, propertyKey: string, value: any) {
                regFunc(target, propertyKey, { "compcall": "1" });
                regFunc(target, propertyKey, customInfo);
            }
        }

        /**
         * 装饰器 序列化类型
         * @private
         */
        export function SerializeType(constructorObj: any) {
            regType(constructorObj, { "SerializeType": "1" });
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 装饰器 Field （字段）标记 
         * @version m4m 1.0
         * @param valueType 值类型
         * @param defaultValue 默认值
         * @param referenceType valueType 为 reference类型时 的具体类型
         */
        export function Field(valueType: string, defaultValue: any = undefined, referenceType: string = undefined) {
            return function (target: Object, propertyKey: string) {
                regField(target, propertyKey, {
                    "SerializeField": true,
                    "valueType": valueType
                });
                if (defaultValue == undefined) {
                }
                else {
                    regField(target, propertyKey, {
                        "defaultValue": defaultValue
                    });
                }
                if (valueType == "reference" && referenceType != undefined) {
                    regField(target, propertyKey, {
                        "referenceType": referenceType
                    });
                }
            }
        }

        /**
         * Field的引用类型(修饰后，改字段将在 Inspector 中暴露 , 该函数是Field() 的封装 )
         * @param referenceType reference指定类型 支持:"transform"、"transform2D"、@reflect.node2DComponent、@reflect.nodeComponent
         * @param defaultValue 默认值
         */
        export function FieldRef(referenceType: string , defaultValue: any = undefined){
            return function (target: Object, propertyKey: string) {
                regField(target, propertyKey, {
                    "SerializeField": true,
                    "valueType": "reference",
                    "referenceType": referenceType
                });
                
                if(defaultValue != null) {
                    regField(target, propertyKey, {
                        "defaultValue": defaultValue
                    });
                }
            }
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 属性面板提示修饰
         * @version m4m 1.0
         */
        export function UIComment(comment: string) {
            return function (target: Object, propertyKey: string) {
                regField(target, propertyKey, {
                    "UIComment": comment
                });
            }
        }

        /**
         * @private
         */
        export enum FieldUIStyle {
            None = 0,
            RangeFloat = 1,
            MultiLineString = 2,
            Enum = 3//序列化的时候枚举获取不到具体类型。先占坑
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 装饰器 属性面板显示方式修饰
         * @version m4m 1.0
         */
        export function UIStyle(style: string, min?: number, max?: number, defvalue?: any) {
            return function (target: Object, propertyKey: string) {
                regField(target, propertyKey, {
                    "FieldUIStyle": style,
                    "min": min ? min : null,
                    "max": max ? max : null,
                    "defvalue": defvalue ? defvalue : null
                });
            }
        }

    }

}

