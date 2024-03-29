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
/// <reference path="../../io/reflect.ts" />
namespace m4m.framework
{
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * Vignetting后期效果 控制器
     * @version m4m 1.0
     */
    @m4m.reflect.nodeComponent
    export class vignettingCtr implements  INodeComponent
    {
        static readonly ClassName:string="vignettingCtr";

        private app:  application;
        private scene:  scene;
        private camera:  camera;
        private material: material;
        public material_1:  material;
        private material_2:  material;
        private material_3:  material;
        private readonly tag = "__vignettingtag__";
        /**
             * @public
             * @language zh_CN
             * @classdesc
             * 挂载的gameobject
             * @version m4m 1.0
             */
        gameObject:  gameObject;


        private _init = false;
        /**
         * 初始化
         */
        private init(){
            let sh = this.scene.app.getAssetMgr().getShader("vignetting.shader.json");
            if (!sh) {
                console.warn(`vignetting.shader.json not find`);
                return;
            }

            let psize = 1024;
            var color = new  cameraPostQueue_Color();
            color[this.tag] = true;
            color.renderTarget = new m4m.render.glRenderTarget(this.scene.webgl, psize, psize, true, false);
            if(!this.camera.postQueues) this.camera.postQueues = [];
            this.camera.postQueues.push(color);
            var textcolor = new  texture("_color");
            textcolor.glTexture = color.renderTarget;

            // Blur
            var texsize:number=512;

            var blur_post = new m4m.framework.cameraPostQueue_Quad();
            blur_post.renderTarget = new m4m.render.glRenderTarget(this.scene.webgl,texsize, texsize, true, false);
            blur_post.material.setShader(this.scene.app.getAssetMgr().getShader("separate_blur.shader.json"));
            blur_post.material.setTexture("_MainTex", textcolor);
            blur_post.material.setVector4("sample_offsets", new m4m.math.vector4(0,1.0,0,-1.0));
            blur_post.material.setVector4("_MainTex_TexelSize", new m4m.math.vector4(1.0/texsize,1.0/texsize,texsize,texsize));
            this.camera.postQueues.push(blur_post);

            var blur0= new m4m.framework.texture("_blur0");
            blur0.glTexture = blur_post.renderTarget;

            var blur_post1 = new m4m.framework.cameraPostQueue_Quad();
            blur_post1.renderTarget = new m4m.render.glRenderTarget(this.scene.webgl,texsize, texsize, true, false);
            blur_post1.material.setShader(this.scene.app.getAssetMgr().getShader("separate_blur.shader.json"));
            blur_post1.material.setTexture("_MainTex", blur0);
            blur_post1.material.setVector4("sample_offsets", new m4m.math.vector4(1.0,0,-1.0,0));
            blur_post1.material.setVector4("_MainTex_TexelSize", new m4m.math.vector4(1.0/texsize,1.0/texsize,texsize,texsize));
            this.camera.postQueues.push(blur_post1);

            var blur= new m4m.framework.texture("_blur0");
            blur.glTexture = blur_post1.renderTarget;

            // Vignetting

            var post0 = new  cameraPostQueue_Quad();

            // post0[this.tag] = true;
            this.material_1 = post0.material;
            post0.material.use();

            post0.material.setShader(sh);
            post0.material.setTexture("_MainTex", textcolor);
            post0.material.setTexture("_BlurTex", blur);

            post0.material.setFloat("_Vignetting", 0.3);
            post0.material.setFloat("_Blurred_Corners", 3.0);
            post0.material.setFloat("_Chromatic_Aberration", 3.0);
            // post0.material.setVector4("_MainTex_TexelSize",new m4m.math.vector4( 1/psize,1/psize,psize,psize));
            this.camera.postQueues.push(post0);


            this._init = true;
        }

        start()
        {
            this.app = this.gameObject.transform.scene.app;
            this.scene = this.app.getScene();

        }

        onPlay()
        {

        }

        update(delta: number)
        {
            if (this._init) return;
            if(!this.camera )  this.camera = this.gameObject.getComponent("camera") as  camera;
            if(this.camera) this.init();
        }
        /**
         * @private
         */
        remove()
        {
            this._init = false;
            if(this.camera){
                let arr = this.camera.postQueues;
                let dArr = [];
                for(var i=0;i<arr.length ;i++){
                    let temp = arr[i];
                    if(temp[this.tag]){
                        dArr.push(temp);
                    }
                }
                dArr.forEach(element => {
                    if(element) {
                        let idx = arr.indexOf(element);
                        if (idx != -1) {
                             arr.splice(idx,1);
                        }
                    }
                });
            }
            if (this.material) {
                this.material.unuse();
                this.material = null;
            }
            if (this.material_1) {
                this.material_1.unuse();
                this.material_1 = null;
            }
            if (this.material_2) {
                this.material_2.unuse();
                this.material_2 = null;
            }
            if (this.material_3) {
                this.material_3.unuse();
                this.material_3 = null;
            }
        }
        /**
         * @private
         */
        clone()
        {

        }
    }
}

