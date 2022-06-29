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
    export enum F14TypeEnum
    {
        SingleMeshType,//单mesh
        particlesType,//发射器
        RefType//索引
    }
    export interface F14Element
    {
        type:F14TypeEnum;
        update(deltaTime:number,frame:number, fps:number);
        dispose();
        reset();
        OnEndOnceLoop();
        changeColor(value:math.color);
        changeAlpha(value:number);
        layer:F14Layer;
        drawActive:boolean;
    }
}

