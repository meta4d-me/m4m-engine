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
     * @private
     * @language zh_CN
     * @classdesc
     * 给编辑器用的工具类，用eval方式获取enum对象
     * @version m4m 1.0
     */
    export class EnumUtil
    {
        /**
         * @deprecated [已弃用]
         */
        static getEnumObjByType(enumType: string): any
        {
            let index = enumType.indexOf("m4m.framework.");
            if (index == 0)
                enumType = enumType.substr(15);

            return eval("{result:" + enumType + "}");
        }
    }
}