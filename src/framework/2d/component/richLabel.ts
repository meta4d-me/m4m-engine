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
/// <reference path="../../../io/reflect.ts" />

namespace m4m.framework {
    /**
     * 富文本版 lable 
     * 支持表情字符，自定义样式段落
     */
    @reflect.node2DComponent
    @reflect.nodeRender
    export class richLabel implements IRectRenderer {
        render(canvas: canvas)
        {
            throw new Error("Method not implemented.");
        }
        updateTran()
        {
            throw new Error("Method not implemented.");
        }
        getMaterial(): material
        {
            throw new Error("Method not implemented.");
        }
        getDrawBounds(): math.rect
        {
            throw new Error("Method not implemented.");
        }
        onPlay()
        {
            throw new Error("Method not implemented.");
        }
        start()
        {
            throw new Error("Method not implemented.");
        }
        update(delta: number)
        {
            throw new Error("Method not implemented.");
        }
        transform: transform2D;
        remove()
        {
            throw new Error("Method not implemented.");
        }
        
    }
}