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
     * tool of physic
     */
    export class physicTool
    {
        /**
         * 判断两个三维向量是否想等
         * @param a 向量a
         * @param b 向量b
         * @returns 是相等？
         */
        static Ivec3Equal(a: math.Ivec3, b: math.Ivec3)
        {
            return a.x == b.x && a.y == b.y && a.z == b.z;
        }

        /**
         * 判断两个二维向量是否想等
         * @param a 向量a
         * @param b 向量b
         * @returns 是相等？
         */
        static Ivec2Equal(a: math.Ivec2, b: math.Ivec2)
        {
            return a.x == b.x && a.y == b.y;
        }

        /**
         * 判断两个四元数是否想等
         * @param a 四元数a
         * @param b 四元数b
         * @returns 是相等？
         */
        static IQuatEqual(a: math.Iquat, b: math.Iquat)
        {
            return a.x == b.x && a.y == b.y && a.z == b.z && a.w == b.w;
        }

        /**
         * 拷贝三维向量
         * @param from 源向量
         * @param to 输出向量
         */
        static Ivec3Copy(from: math.Ivec3, to: math.Ivec3)
        {
            to.x = from.x;
            to.y = from.y;
            to.z = from.z;
        }

        /**
         * 拷贝二维向量
         * @param from 源向量
         * @param to 输出向量
         */
        static Ivec2Copy(from: math.Ivec2, to: math.Ivec2)
        {
            to.x = from.x;
            to.y = from.y;
        }

        /**
         * 拷贝四元数
         * @param from 源四元数
         * @param to 输出四元数
         */
        static IQuatCopy(from: math.Iquat, to: math.Iquat)
        {
            to.x = from.x;
            to.y = from.y;
            to.z = from.z;
            to.w = from.w;
        }

        /**
         * 三维向量转数组数据
         * @param vec3 三维向量
         * @returns 数组数据
         */
        static vec3AsArray(vec3: math.vector3)
        {
            let result = [];
            // result[0] = vec3.rawData[0];
            // result[1] = vec3.rawData[1];
            // result[2] = vec3.rawData[2];
            result[0] = vec3.x;
            result[1] = vec3.y;
            result[2] = vec3.z;
            return result;
        }

    }

}