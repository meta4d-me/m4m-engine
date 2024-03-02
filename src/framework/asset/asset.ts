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
    //资源不能随意改名，否则药丸
    //资源需要有一个固定的名字，一个唯一的id
    //唯一的id 是定位的需求，他不需要assetMgr就能够满足
    //name 是我们做named的管理时，需要

    //资源的来源有三种，     
    //一，随意new，这个也可以用引用计数管理，随你
    //二，加载而来，也是这个使用引用计数管理
    //三，静态管理，这个是特殊的，不要为他设计
    export class resID {
        /**
         * 资源ID
         */
        constructor() {
            this.id = resID.next();
        }
        public static idAll: number = 100000000;    //从 100000000 开始累加ID， 避免 guidlist 冲突
        public static next(): number {
            var next = resID.idAll;
            resID.idAll++;
            return next;
        }
        private id: number;
        /** 获取资源的唯一ID */
        getID(): number {
            return this.id;
        }
    }
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 静态text 初始化后不可修改
     * @version m4m 1.0
     */
    @m4m.reflect.SerializeType
    export class constText {
        /**
         * 静态text
         * @param text text字符串数据
         */
        constructor(text: string) {
            this.name = text;
        }
        private name: string;
        /**
         * 获取文本字符串数据
         * @returns 文本字符串数据
         */
        getText(): string {
            return this.name;
        }
    }
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 资源接口 扩展资源需要继承此接口
     * @version m4m 1.0
     */
    export interface IAsset //
    {
        bundle?: assetBundle;

        defaultAsset: boolean;//是否为系统默认资源
        //setName(name: string);//名字只能设置一次
        /** 获取资源名称
         * @return 资源名称
         */
        getName(): string;//资源自己解决命名问题，比如构造函数，不能改资源的名字
        /**
         * 获取资源唯一id
         * @return 资源唯一id
         */
        getGUID(): number;
        // init(assetmgr: assetMgr, name: string, guid: number);
        /**
         * 引用计数加一
         */
        use(): void;
        /**
         * 引用计数减一
         * @param disposeNow 是否直接释放资源
         */
        unuse(disposeNow?: boolean): void;
        /**
         * 释放资源
         */
        dispose();
        /**
         * 计算资源字节大小
         * @return 资源字节大小
         */
        caclByteLength(): number;
        /**
         * 初始化
         */
        init?();
    }
}