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
namespace m4m.framework
{
    /**
     * 让T中以及所有属性中的所有属性都是可选的
     */
    export type gPartial<T> = {
        [P in keyof T]?: gPartial<T[P]>;
    };

    export type Lazy<T> = T | (() => T);

    export type LazyObject<T> = { [P in keyof T]: Lazy<T[P]>; };

    export var lazy = {
        /**
         * 获取值
         * @param lazyItem 
         * @returns 
         */
        getvalue: function <T>(lazyItem: Lazy<T>): T
        {
            if (typeof lazyItem == "function")
                return (<any>lazyItem)();
            return lazyItem;
        }
    };

    /**
     * 可销毁对象
     */
    export interface IDisposable
    {
        /**
         * 是否已销毁
         */
        readonly disposed: boolean;

        /**
         * 销毁
         */
        dispose(): void;
    }
}
