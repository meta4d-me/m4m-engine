/**
@license
Copyright 2022 meta4d.me Authors

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
namespace m4m.framework
{
    var CLASS_KEY = "__class__";

    /**
     * 类工具
     * 
     * @author feng3d
     */
    export class ClassUtils
    {
        /**
         * 返回对象的完全限定类名。
         * @param value 需要完全限定类名称的对象，可以将任何 JavaScript 值传递给此方法，包括所有可用的 JavaScript 类型、对象实例、原始类型
         * （如number)和类对象
         * @returns 包含完全限定类名称的字符串。
         */
        static getQualifiedClassName(value: any): string
        {
            if (value == null)
                return "null";
            var prototype: any = value.prototype ? value.prototype : Object.getPrototypeOf(value);
            if (prototype.hasOwnProperty(CLASS_KEY))
                return prototype[CLASS_KEY];

            var className: string = prototype.constructor.name;
            if (_global[className] == prototype.constructor)
                return className;
            //在可能的命名空间内查找
            for (var i = 0; i < _classNameSpaces.length; i++)
            {
                var tryClassName = _classNameSpaces[i] + "." + className;
                if (this.getDefinitionByName(tryClassName) == prototype.constructor)
                {
                    className = tryClassName;
                    registerClass(prototype.constructor, className);
                    return className;
                }
            }
            // console.warn(`未在给出的命名空间 ${_classNameSpaces} 内找到 ${value} 的定义`);
            return className;
        }

        /**
         * 返回 name 参数指定的类的类对象引用。
         * @param name 类的名称。
         */
        static getDefinitionByName(name: string, readCache = true): any
        {
            if (name == "null")
                return null;
            if (!name)
                return null;
            if (_global[name])
                return _global[name];
            if (readCache && _definitionCache[name])
                return _definitionCache[name];

            var paths = name.split(".");
            var length = paths.length;
            var definition = _global;
            for (var i = 0; i < length; i++)
            {
                var path = paths[i];
                definition = definition[path];
                if (!definition)
                {
                    return null;
                }
            }
            _definitionCache[name] = definition;
            return definition;
        }

        private static defaultInstMap: { [className: string]: any } = {};

        /**
         * 获取默认实例
         * 
         * @param name 类名称
         */
        static getDefaultInstanceByName(name: string)
        {
            var defaultInst = this.defaultInstMap[name];
            if (defaultInst) return defaultInst;
            //
            var cls = this.getDefinitionByName(name);
            if (!cls)
                return undefined;
            defaultInst = this.defaultInstMap[name] = new cls();

            // 冻结对象，防止被修改
            Object.freeze(defaultInst);

            return defaultInst;
        }

        /**
         * 获取实例
         * 
         * @param name 类名称
         */
        static getInstanceByName(name: string)
        {
            var cls = this.getDefinitionByName(name);
            if (!cls) return undefined;
            return new cls();
        }

        /**
         * 新增反射对象所在的命名空间，使得getQualifiedClassName能够得到正确的结果
         */
        static addClassNameSpace(namespace: string)
        {
            if (_classNameSpaces.indexOf(namespace) == -1)
            {
                _classNameSpaces.push(namespace);
            }
        }
    };

    var _definitionCache = {};
    var _global: Window;
    var global: any;
    if (typeof window != "undefined")
    {
        _global = window;
    } else if (typeof global != "undefined")
    {
        _global = <any>global;
    }

    var _classNameSpaces = ["m4m.framework"];


    /**
     * 为一个类定义注册完全限定类名
     * @param classDefinition 类定义
     * @param className 完全限定类名
     */
    function registerClass(classDefinition: any, className: string): void
    {
        var prototype = classDefinition.prototype;
        Object.defineProperty(prototype, CLASS_KEY, { value: className, writable: true });
    }
}