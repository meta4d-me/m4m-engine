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
    export class F14RefElement implements F14Element
    {

        type: F14TypeEnum;
        layer: F14Layer;
        drawActive: boolean;
        public baseddata: F14RefBaseData;
        //-----------------life from to---------------------
        public startFrame: number;
        public endFrame: number;

        public effect: f14EffectSystem;
        /**
         * F14 引用元素
         * @param effect 特效系统
         * @param layer F14 层
         * @param bundleName 资源包名
         * @returns F14RefElement
         */
        public constructor(effect: f14EffectSystem, layer: F14Layer, bundleName: string )
        {

            this.type = F14TypeEnum.RefType;
            this.effect = effect;
            this.baseddata = layer.data.elementdata as F14RefBaseData;
            this.layer = layer;
            let f14Dat: f14eff = (sceneMgr.app.getAssetMgr().getAssetByName(this.baseddata.refdataName, bundleName) as f14eff);
            if (!f14Dat)
                return;
            this.refreshStartEndFrame();

            this.RefEffect = new f14EffectSystem(bundleName);
            this.RefEffect._root = new transform();
            this.RefEffect.enableDraw = true;
            this.RefEffect.gameObject = this.RefEffect._root.gameObject;
            //this.RefEffect.root.parent=this.effect.gameObject.transform;
            let data = layer.data.elementdata as F14RefBaseData;
            m4m.math.vec3Clone(data.localPos, this.RefEffect._root.localTranslate);
            m4m.math.vec3Clone(data.localScale, this.RefEffect._root.localScale);
            math.quatFromEulerAngles(data.localEuler.x, data.localEuler.y, data.localEuler.z, this.RefEffect._root.localRotate);
            this.RefEffect._root.markDirty();

            this.RefEffect.beref = true;
            this.baseddata.refData = f14Dat.data;
            this.RefEffect.setData(this.baseddata.refData,bundleName);
            //this.RefEffect.batchRoot = effect.player.transform;
        }
        public RefEffect: f14EffectSystem;

        //---------------------------------------reset-----------------------------------------------
        public reset()
        {
            this.RefEffect.reset();
        }
        //------------------------------------update----------------------------------------------
        private refreshStartEndFrame()
        {
            if (this.layer.frameList.length == 0)
            {
                this.startFrame = 0;
            }
            else
            {
                this.startFrame = this.layer.frameList[0];
            }
            if (this.layer.frameList.length > 1)
            {
                this.endFrame = this.layer.frameList[this.layer.frameList.length - 1];
            }
            else
            {
                this.endFrame = this.effect.data.lifeTime;
            }
        }
        update(deltaTime: number, frame: number, fps: number)
        {
            if (this.RefEffect && this.RefEffect._root.parent == null)
            {
                this.effect.gameObject.transform.addChild(this.RefEffect._root);
                //this.RefEffect._root.parent=this.effect.gameObject.transform;
                this.RefEffect._root.markDirty();
                this.RefEffect._root.updateWorldTran();
            }

            if (this.layer.frameList.length == 0)
            {
                this.drawActive = false;
                return;
            }
            if (this.effect.data.beloop)
            {
                frame = this.effect.restartFrame;
            }
            if (frame < this.startFrame || frame > this.endFrame)
            {
                this.drawActive = false;
                this.RefEffect["playState"] = PlayStateEnum.beReady;
                return;
            }
            else
            {
                this.drawActive = true;
                //this.RefEffect["playState"]=PlayStateEnum.play;
                this.RefEffect.enabletimeFlow = true;
            }
            this.RefEffect.update(deltaTime);
        }

        OnEndOnceLoop()
        {

        }
        changeColor(value: math.color)
        {
            this.RefEffect.changeColor(value);
        }
        changeAlpha(value: number)
        {
            this.RefEffect.changeAlpha(value);
        }
        dispose()
        {
            this.baseddata = null;
            this.RefEffect.remove();
            this.RefEffect = null;
        }
    }
}