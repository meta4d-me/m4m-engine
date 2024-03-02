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

namespace m4m.framework
{
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 进度条
     * @version m4m 1.0
     */
    @reflect.node2DComponent
    export class progressbar implements I2DComponent
    {
        static readonly ClassName:string="progressbar";

        private _cutPanel:transform2D;
        /**
         * 裁切容器
         */
        @reflect.Field("reference",null ,"transform2D")
        get cutPanel (){
            return this._cutPanel;
        }
        set cutPanel(trans:transform2D){
            this._cutPanel = trans;
            this.refreshBar();
        }

        private _barBg:image2D;
        /**
         * 进度条 背景图
         */
        @reflect.Field("reference",null ,"image2D")
        get barBg (){
            return this._barBg;
        }
        set barBg(img:image2D){
            this._barBg = img;
            this.refreshBar();
        }

        private _barOverImg:image2D;
        /**
         * 进度条 上层覆盖图
         */
        @reflect.Field("reference",null ,"image2D")
        get barOverImg (){
            return this._barOverImg;
        } 
        set barOverImg(img:image2D){
            this._barOverImg = img;
            this.refreshBar();
        }

        private _value:number = 0.6;
        /**
         * 进度值 0-1
         */
        @reflect.Field("number")
        get value (){
            return this._value;
        } 
        set value(value:number){
            this._value = value<0? 0: value>1? 1: value;
            if(!this._cutPanel || !this._barBg || !this._barBg.transform)return;
            this._cutPanel.width = this._value * this._barBg.transform.width;
            this._cutPanel.markDirty();
        }
        
        start()
        {

        }

        onPlay(){

        }

        update(delta: number)
        {
            this.adjustOverImg();

        }

        /**
         * 刷新调
         */
        private refreshBar(){
            this.adjustOverImg();
            this.value = this._value;
        }

        /** 调整overimg 宽高*/
        private adjustOverImg(){
            if(!this._barOverImg || !this._barBg) return;
            let tbg = this._barBg.transform;
            let tover = this._barOverImg.transform;
            if(!tbg || !tover) return;
            if(tbg.width != tover.width ){
                tover.width = tbg.width;
                tover.markDirty();
            }
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 当前组件的2d节点
         * @version m4m 1.0
         */
        transform: transform2D;

        remove()
        {
            this._barBg = null;
            this._barOverImg = null;
            this._cutPanel = null;

        }

    }
}