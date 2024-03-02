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

    export class f14node
    {
        trans: transform;
        f14Effect: f14EffectSystem;
    }
    @m4m.reflect.SerializeType
    export class f14eff implements IAsset
    {
        static readonly ClassName:string="f14eff";
        
        defaultAsset: boolean = false;
        private name: constText = null;
        private id: resID = new resID();
        /**
         * F14特效 资源
         * @param assetName 资源名
         */
        constructor(assetName: string = null)
        {
            if (!assetName)
            {
                assetName = "f14eff_" + this.getGUID();
            }
            this.name = new constText(assetName);
        }
        assetbundle: string = null;
        getName(): string
        {
            if (this.name == undefined)
            {
                return null;
            }
            return this.name.getText();
        }
        getGUID(): number
        {
            return this.id.getID();
        }
        use(): void
        {

        }
        unuse(disposeNow?: boolean): void
        {

        }
        dispose()
        {

        }
        caclByteLength(): number
        {
            return 0;
        }
        data: F14EffectData;
        delayTime: number;
        // trans:transform;
        // f14Effect:f14EffectSystem;
        /**
         * 解析 f14 特效系统对象
         * @param jsonStr 字符串数据（josn）
         * @param assetmgr 资源管理器
         * @returns F14Data 
         */
        Parse(jsonStr: string, assetmgr: assetMgr)
        {

            let json = JSON.parse(jsonStr);
            this.data = new F14EffectData();
            return this.data.parsejson(json, assetmgr, this.assetbundle);


            // this.trans=new m4m.framework.transform();
            // this.f14Effect=this.trans.gameObject.addComponent("f14EffectSystem") as m4m.framework.f14EffectSystem;
            // this.f14Effect.setData(this.f14data);
        }
        // getCloneF14eff():f14node
        // {
        //     let f14node=new m4m.framework.f14node();
        //     f14node.trans=new m4m.framework.transform();
        //     f14node.f14Effect=f14node.trans.gameObject.addComponent("f14EffectSystem") as m4m.framework.f14EffectSystem;
        //     f14node.f14Effect.setData(this.f14data);
        //     return f14node;
        // }

        /** 获取依赖资源 （mesh 、material） */
        getDependents():IAsset[]{
            if(!this.data || !this.data.layers) return;
            let result = [];
            this.doSearch(this.data.layers,result);
            return result;
        }

        /**
         * 执行搜索
         * @param obj 对象
         * @param arr 数组
         * @returns 
         */
        private doSearch(obj:object, arr:any[]){
            if(!obj) return;
            if(obj instanceof material || obj instanceof framework.mesh || obj instanceof texture)
                arr.push(obj);

            if(obj instanceof Array){
                (obj as Array<any>).forEach(element => {
                    if(element && typeof(element) == "object"){
                        this.doSearch(element,arr);
                    }
                });

            }else{
                let keys = Reflect["ownKeys"](obj) as string[];
                for(var i=0;i< keys.length ;i++){
                    if(typeof(obj[keys[i]]) == "object"){
                        this.doSearch(obj[keys[i]],arr);
                    }
                }
            }
        }
    }

}