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
/// <reference path="../../io/reflect.ts" />

namespace m4m.framework
{
    @reflect.nodeComponent
    export class AudioListener implements INodeComponent
    {
        static readonly ClassName:string="AudioListener";

        private listener: any;
        start()
        {
            this.listener = AudioEx.instance().audioContext.listener;
        }

        onPlay()
        {

        }

        private lastX: number = 0;
        private lastY: number = 0;
        private lastZ: number = 0;
        private curPos: m4m.math.vector3;
        gameObject: gameObject;
        update(delta: number)
        {
            this.curPos = this.gameObject.transform.getWorldTranslate();
            if (this.curPos.x != this.lastX || this.curPos.y != this.lastY || this.curPos.z != this.lastZ)
            {
                this.listener.setPosition(this.curPos.x, this.curPos.y, this.curPos.z);
                this.lastX = this.curPos.x;
                this.lastY = this.curPos.y;
                this.lastZ = this.curPos.z;
            }
        }
        remove()
        {

        }
        clone()
        {

        }
    }
}