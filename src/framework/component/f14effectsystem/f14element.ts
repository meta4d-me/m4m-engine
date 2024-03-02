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
    export enum F14TypeEnum
    {
        SingleMeshType,//单mesh
        particlesType,//发射器
        RefType//索引
    }
    export interface F14Element
    {
        type:F14TypeEnum;
        /**
         * 更新
         * @param deltaTime 上一帧用时 
         * @param frame 帧数
         * @param fps 帧率
         */
        update(deltaTime:number,frame:number, fps:number);
        /**
         * 销毁
         */
        dispose();
        /**
         * 重置
         */
        reset();
        /***
         * 当结束一次循环后执行函数
         */
        OnEndOnceLoop();
        /**
         * 改变颜色
         * @param value 颜色
         */
        changeColor(value:math.color);
        /**
         * 改变透明度
         * @param value 透明度
         */
        changeAlpha(value:number);
        layer:F14Layer;
        drawActive:boolean;
    }
}

