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
     * 数组工具
     */
    export class ArrayUtil
    {
        /**
         * 使用b元素替换数组中第一个a元素。
         * 
         * @param arr 被操作数组
         * @param a 被替换的元素
         * @param b 用于替换的元素
         * @param isAdd 当数组中没有找到a元素时，是否需要把b元素添加到数组尾部。默认值为true。
         */
        static replace<T>(arr: T[], a: T, b: T, isAdd = true): T[]
        {
            var isreplace = false;
            for (let i = 0; i < arr.length; i++)
            {
                if (arr[i] == a)
                {
                    arr[i] = b;
                    isreplace = true;
                    break;
                }
            }
            if (!isreplace && isAdd) arr.push(b);
            return arr;
        }

        /**
         * 连接一个或多个数组到自身
         * 
         * @param self 被操作数组
         * @param items 要添加到数组末尾的其他项。
         * @returns 返回自身
         */
        static concatToSelf<T>(self: T[], ...items: (T | ConcatArray<T>)[]): T[]
        {
            var arr = [];
            items.forEach(v => arr = arr.concat(v));
            arr.forEach(v => self.push(v));
            return self;
        }

        /**
         * 使数组变得唯一，不存在两个相等的元素
         * 
         * @param arr 被操作数组
         * @param compare 比较函数
         */
        static unique<T>(arr: T[], compare?: (a: T, b: T) => boolean): T[]
        {
            var keys = Object.keys(arr);
            var ids = keys.map(v => Number(v)).filter(v => !isNaN(v));
            var deleteMap: { [id: number]: true } = {};
            //
            for (let i = 0, n = ids.length; i < n; i++)
            {
                var ki = ids[i];
                if (deleteMap[ki]) continue;
                for (let j = i + 1; j < n; j++)
                {
                    var kj = ids[j];
                    if (compare(arr[ki], arr[kj])) deleteMap[kj] = true;
                }
            }
            //
            for (let i = ids.length - 1; i >= 0; i--)
            {
                var id = ids[i];
                if (deleteMap[id]) arr.splice(id, 1);
            }

            return arr;
        }


    }
}