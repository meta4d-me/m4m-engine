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
    export class DeviceInfo
    {
        private static debuginfo;
        /**
         * 获取拓展
         */
        private static getExtension()
        {
            // this.debuginfo= sceneMgr.app.webgl.getExtension('WEBGL_debug_renderer_info');
            this.debuginfo= sceneMgr.app.webgl.extensions.WEBGL_debug_renderer_info;
            if(this.debuginfo==null)
            {
                console.warn("extension(WEBGL_debug_renderer_info) not support!");
            }
        }
        /**
         * GPU类型
         */
        public static get GraphDevice():string
        {
            if(this.debuginfo==null)
            {
                this.getExtension();
            }
            if(this.debuginfo)
            {
                let device:string=sceneMgr.app.webgl.getParameter(this.debuginfo.UNMASKED_RENDERER_WEBGL);
                return device;
            }else
            {
                return "unknown";
            }
        }
        /**
         * canvas 宽度
         */
        public static get CanvasWidth():number
        {
           if(sceneMgr.app)
           {
                return sceneMgr.app.webgl.canvas.width;
           }else
           {
               return null;
           }
        }
        /**
         * canvas 高度
         */
        public static get CanvasHeight():number
        {
            if(sceneMgr.app)
            {
                return sceneMgr.app.webgl.canvas.height;
            }else
            {
                return null;
            }
            
        }
        /**
         * 屏幕自适应方式
         */
        public static get ScreenAdaptiveType():string
        {
            if(sceneMgr.app)
            {
                return sceneMgr.app.screenAdaptiveType;
            }else
            {
                return "unknown";
            }
        }
        /**
         * 屏幕宽度
         */
        public static get ScreenWidth():number
        {
            return window.screen.width*(window.devicePixelRatio || 1);
        }
        /**
         * 屏幕高度
         */
        public static get ScreenHeight():number
        {
            return  window.screen.height*(window.devicePixelRatio || 1);
        }

    }

    export enum DrawCallEnum
    {
        UI,
        SKinrender,
        Meshrender,
        EffectSystem
    }

    export class DrawCallInfo
    {
        private static _inc:DrawCallInfo;
        static get inc():DrawCallInfo
        {
            if(this._inc==null)
            {
                this._inc=new DrawCallInfo();
            }
            return this._inc;
        }
        static BeActived:boolean=false;

        data:number[]=[];
        currentState:DrawCallEnum=DrawCallEnum.Meshrender;
        reset()
        {
            this.data[DrawCallEnum.UI]=0;
            this.data[DrawCallEnum.SKinrender]=0;
            this.data[DrawCallEnum.Meshrender]=0;
            this.data[DrawCallEnum.EffectSystem]=0;
        }

        add()
        {
            this.data[this.currentState]+=1;
        }

        private SKinrenderDraw:HTMLLIElement;
        private MeshrenderDraw:HTMLLIElement;
        private EffectrenderDraw:HTMLLIElement;
        private UIrenderDraw:HTMLLIElement;
        
        private rootdiv:HTMLDivElement;
        private initShowPlane()
        {
            let div = document.createElement("div");
            this.rootdiv=div;
            sceneMgr.app.container.appendChild(div);
            div.style.display="inline-block";
            div.style.background = "#00000085";
            div.style.position="absolute";
            div.style.left = "100px";
            div.style.top = "0px";
            div.style.height="60px";
            div.style.width = "170px";
    
            let li1 = document.createElement("li");
            li1.textContent="SkinMeshDrawcall: ";
            this.SKinrenderDraw=li1;
    
            let li3 = document.createElement("li");
            li3.textContent="MeshrenderDrawcall: ";
            this.MeshrenderDraw=li3;
    
            let li2 = document.createElement("li");
            li2.textContent="EffectrenderDrawcall: ";
            this.EffectrenderDraw=li2;

            let li4 = document.createElement("li");
            li4.textContent="UIrenderDrawcall: ";
            this.UIrenderDraw=li4;

            let list = [li1,li3,li2,li4];
            for(var i=0;i < list.length ;i++){
                let li = list[i];
                li.style.fontSize="10px";
                li.style.color="Aqua";
                li.style.height="12px";
                li.style.width="170px";
                li.style.left="0px";
                div.appendChild(li);
            }

        }

        showPerFrame()
        {
            this.MeshrenderDraw.textContent="MeshrenderDrawcall: "+this.data[DrawCallEnum.Meshrender];
            this.SKinrenderDraw.textContent="SkinMeshDrawcall: "+this.data[DrawCallEnum.SKinrender];
            this.EffectrenderDraw.textContent="EffectrenderDrawcall: "+this.data[DrawCallEnum.EffectSystem];
            this.UIrenderDraw.textContent="UIrenderDrawcall: "+this.data[DrawCallEnum.UI];
            
        }


        showDrawcallInfo()
        {
            if(this.SKinrenderDraw==null)
            {
                this.initShowPlane();
            }
            DrawCallInfo.BeActived=true;
            this.rootdiv.style.visibility="visible";
        }
        closeDrawCallInfo()
        {
            DrawCallInfo.BeActived=false;
            this.rootdiv.style.visibility="hidden";
        }
    }

}