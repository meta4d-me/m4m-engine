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
        static Ivec3Equal(a: math.Ivec3, b: math.Ivec3)
        {
            return a.x == b.x && a.y == b.y && a.z == b.z;
        }

        static Ivec2Equal(a: math.Ivec2, b: math.Ivec2)
        {
            return a.x == b.x && a.y == b.y;
        }

        static IQuatEqual(a: math.Iquat, b: math.Iquat)
        {
            return a.x == b.x && a.y == b.y && a.z == b.z && a.w == b.w;
        }

        static Ivec3Copy(from: math.Ivec3, to: math.Ivec3)
        {
            to.x = from.x;
            to.y = from.y;
            to.z = from.z;
        }

        static Ivec2Copy(from: math.Ivec2, to: math.Ivec2)
        {
            to.x = from.x;
            to.y = from.y;
        }

        static IQuatCopy(from: math.Iquat, to: math.Iquat)
        {
            to.x = from.x;
            to.y = from.y;
            to.z = from.z;
            to.w = from.w;
        }

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