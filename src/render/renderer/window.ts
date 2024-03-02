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
﻿// namespace m4m.render
// {
//     /**
//      * @private
//      */
//     export class glWindow
//     {
//         renderTarget: m4m.render.glRenderTarget;
//         clearop_Color: boolean = false;
//         backColor: m4m.math.color = new m4m.math.color(1, 0, 1, 1);
//         clearop_Depth: boolean = false;
//         clearop_Stencil: boolean = false;
//         viewport: m4m.math.rect = new m4m.math.rect(0, 0, 1, 1);
//         use(webgl: WebGL2RenderingContext)
//         {
//             //rendertarget
//             if (this.renderTarget != null)
//             {
//                 this.renderTarget.use(webgl);
//             }
//             else
//             {
//                 m4m.render.glRenderTarget.useNull(webgl);
//             }

//             //clear
//             if (this.backColor != null)
//                 webgl.clearColor(this.backColor.r, this.backColor.g, this.backColor.b, this.backColor.a);
//             var n = 0;
//             if (this.clearop_Color) n |= webgl.COLOR_BUFFER_BIT;
//             if (this.clearop_Depth) n |= webgl.DEPTH_BUFFER_BIT;
//             if (this.clearop_Stencil) n |= webgl.STENCIL_BUFFER_BIT;
//             webgl.clear(n);

//             //viewport
//             if (this.renderTarget != null)
//             {
//                 webgl.viewport(this.renderTarget.width * this.viewport.x, this.renderTarget.height * this.viewport.y,
//                     this.renderTarget.width * this.viewport.w, this.renderTarget.height * this.viewport.h);
//             }
//             else
//             {
//                 webgl.viewport(webgl.canvas.width * this.viewport.x, webgl.canvas.height * this.viewport.y,
//                     webgl.canvas.width * this.viewport.w, webgl.canvas.height * this.viewport.h);
//             }
//         }
//     }
// }