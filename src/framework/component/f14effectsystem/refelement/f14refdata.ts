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
    export class F14RefBaseData implements F14ElementData
    {

        public beLoop:boolean = false;
        public refdataName:string;
        public refData:F14EffectData;
        
        public localPos:math.vector3=new math.vector3();
        public localEuler:math.vector3=new math.vector3();
        public localScale:math.vector3=new math.vector3(1,1,1);

        parse(json: any, assetmgr: assetMgr, assetbundle: string) {
            this.beLoop=json.beLoop;
            this.refdataName=json.F14EffectData;
            m4m.math.vec3FormJson(json.localPos,this.localPos);
            m4m.math.vec3FormJson(json.localEuler,this.localEuler);
            m4m.math.vec3FormJson(json.localScale,this.localScale);
        }

    }
}

