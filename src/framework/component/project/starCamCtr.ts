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
    @reflect.nodeComponent
    export class starCamCtr implements INodeComponent {
        static readonly ClassName:string="starCamCtr";

        moveDuration:number=1;//移动速度
        minSpeed=5;//角速度

        relativelocation:math.vector3=new math.vector3(0,6,0);
        relativeEuler:math.vector3=new math.vector3(90,0,0);
        private relativeRot:math.quaternion=new math.quaternion();

        private starteCamRot:math.quaternion=new math.quaternion();
        private targetCamPos:math.vector3=new math.vector3();
        private targetCamRot:math.quaternion=new math.quaternion();
        
        private distance:number;
        private movedir:math.vector3=new math.vector3();
        private moveSpeed:number;
        private eulerSpeed:number;


        private active:boolean=false;
        start() {
            
        }

        onPlay()
        {

        }

        private moveDis:math.vector3=new math.vector3();
        update(delta: number) {
            if(!this.active) return;
            let pos=this.gameObject.transform.localTranslate
            let rot=this.gameObject.transform.localRotate;

            let distanc=math.vec3Distance(pos,this.targetCamPos);
            let movedis=this.moveSpeed*delta;
            if(distanc>movedis)
            {
                math.vec3ScaleByNum(this.movedir,movedis,this.moveDis);
                math.vec3Add(pos,this.moveDis,this.gameObject.transform.localTranslate);
                math.quatLerp(this.starteCamRot,this.targetCamRot,this.gameObject.transform.localRotate,(this.distance-distanc)/this.distance);

                this.gameObject.transform.markDirty();
                this.gameObject.transform.updateWorldTran();
            }else
            {
                this.active=false;
            }
        }

        gameObject: gameObject;

        remove() {
            
        }

        /** @deprecated [已弃用] */
        clone() {
            
        }

        /**
         * 移动到
         * @param to 到的位置
         */
        moveTo(to:transform)
        {
            m4m.math.quatClone(this.gameObject.transform.localRotate,this.starteCamRot);

            math.quatFromEulerAngles(this.relativeEuler.x,this.relativeEuler.y,this.relativeEuler.z,this.relativeRot);
            math.quatTransformVector(to.localRotate,this.relativelocation,this.targetCamPos);
            math.vec3Add(to.localTranslate,this.targetCamPos,this.targetCamPos);
            math.quatMultiply(to.localRotate,this.relativeRot,this.targetCamRot);

            let distanc=math.pool.new_vector3();
            math.vec3Subtract(this.targetCamPos,this.gameObject.transform.localTranslate,distanc);
            math.vec3Normalize(distanc,this.movedir);

            this.distance=math.vec3Length(distanc);
            this.moveSpeed=this.distance/this.moveDuration;

            m4m.math.pool.delete_vector3(distanc);
            this.active=true;
        }
    }
}