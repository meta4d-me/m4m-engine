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
    export class BeBillboard implements INodeComponent {
        static readonly ClassName:string="BeBillboard";

        start() {

        }

        onPlay()
        {

        }

        update(delta: number) {
            if(!this.beActive||this.target==null) return;
            this.gameObject.transform.lookat(this.target);
        }
        gameObject: gameObject;
        remove() {

        }
        clone() {

        }
        private beActive:boolean=true;
        /**
         * 设置是否激活
         * @param active 是否激活
         */
        setActive(active:boolean)
        {
            this.beActive=active;
        }
        private target:transform=null;
        /**
         * 设置目标
         * @param trans 目标
         */
        setTarget(trans:transform)
        {
            this.target=trans;
        }
    }
}