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
     * @public
     * @language zh_CN
     * @classdesc
     * UI画布容器组件
     * @version m4m 1.0
     */
    @reflect.nodeComponent
    export class canvascontainer implements INodeComponent
    {
        static readonly ClassName:string="canvascontainer";
        /**
         * canvas容器
         */
        constructor(){
            
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 挂载的gameobject
         * @version m4m 1.0
         */
        gameObject: gameObject;
        
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * UI canvas 
         * @version m4m 1.0
         */
        get canvas(){
            if(this._overlay2d && this._overlay2d.canvas) 
                return this._overlay2d.canvas;
        }

        //overlay2d
        @reflect.Field("reference")
        private _overlay2d:overlay2D;
        /**
         * 设置 OverLay
         * @param lay OverLay
         */
        setOverLay(lay:overlay2D){
            this._overlay2d = lay;
            this.canvasInit();
        }
        
        /**
         * 获取OverLay
         * @returns OverLay对象
         */
        getOverLay(){
            return this._overlay2d;
        }

        //渲染排序
        get sortOrder(){
            return this._overlay2d ? this._overlay2d.sortOrder: 0;         
        }
        set sortOrder(order:number){
            if(this._overlay2d)
                this._overlay2d.sortOrder = order;
        }

        private isCanvasinit = false;
        /**
         *  canvas初始化
         * @returns 
         */
        private canvasInit(){
            if(!this.gameObject || !this.gameObject.transform || !this.gameObject.transform.scene) return; 
            if(!this._overlay2d || !this._overlay2d.canvas) return;
            this._overlay2d.canvas.scene = this.gameObject.transform.scene;
            this._overlay2d.canvas.assetmgr = this._overlay2d.canvas.scene.app.getAssetMgr();
            this.isCanvasinit = true;
        }

        private _lastMode:canvasRenderMode = canvasRenderMode.ScreenSpaceOverlay;
        private _renderMode:canvasRenderMode = canvasRenderMode.ScreenSpaceOverlay;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * renderMode UI render模式
         * @version m4m 1.0
         */
        @reflect.Field("number")
        get renderMode(){return this._renderMode;}
        set renderMode(mode:canvasRenderMode){ 
            if(this._renderMode == mode) return;
            this._lastMode = this._renderMode;
            this._renderMode = mode;
            this.styleToMode();
        }
        /**
         * 设置样式模式
         * @returns 
         */
        private styleToMode(){
            switch(this._renderMode){
                case canvasRenderMode.ScreenSpaceOverlay:
                    if(!this._overlay2d) return;
                    let scene =this.gameObject.getScene();
                    scene.addScreenSpaceOverlay(this._overlay2d);
                break;
                case canvasRenderMode.ScreenSpaceOverlay:
                    console.warn(`not support now of ${canvasRenderMode[canvasRenderMode.ScreenSpaceOverlay]} mode`);
                break;
                case canvasRenderMode.WorldSpace:
                    console.warn(`not support now of ${canvasRenderMode[canvasRenderMode.WorldSpace]} mode`);
                break;
            }

        }

        start()
        {
            this.styleToMode();
        }

        onPlay()
        {

        }

        update(delta: number)
        {   
            if(!this.isCanvasinit) this.canvasInit();

        }
        /**
         * @private
         */
        remove()
        {
            if(this.gameObject.getScene())
                this.gameObject.getScene().removeScreenSpaceOverlay(this._overlay2d);
        }
        /**
         * @private
         */
        clone()
        {

        }
    }
    
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * UI画布容器RenderMode
     * @version m4m 1.0
     */
    export enum canvasRenderMode{
        ScreenSpaceOverlay,
        ScreenSpaceCamera,
        WorldSpace
    }

}