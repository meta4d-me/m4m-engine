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
    @reflect.nodeComponent
    export class AudioPlayer implements INodeComponent
    {
        static readonly ClassName:string="AudioPlayer";

        public buffer: AudioBuffer;
        public beLoop: boolean;
        public be3DSound: boolean = true;
        private audioChannel: AudioChannel;
        gameObject: gameObject;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 播放声音
         * @param buffer 音源缓冲对象
         * @param beLoop 是循环播放
         * @param volume 音量 0-1
         * @param onended 音源播放结束回调
         */
        play(buffer: AudioBuffer, beLoop: boolean = false, volume: number = 0, onended?: Function)
        {
            if(this.audioChannel != null){
                if(this.audioChannel.isplay){
                    this.stop();
                }
                this.audioChannel = null;
            }
            
            if(!(this.audioChannel = AudioEx.instance().createAudioChannel(this.be3DSound)))
                return;
            
            this.buffer = buffer;
            this.volume = volume;
            
            var c = this.audioChannel;
            c.source.loop = this.beLoop;
            c.source.buffer = this.buffer;
            c.volume = this.volume;
            c.source.start();

            c.isplay = true;
            if (!this.beLoop)
            {
                c.source.onended = () =>
                {
                    c.isplay = false;
                    c.source = null;
                    if (onended != undefined)
                        onended();
                }
            }
            // //郭加的
            // if(this.beLoop)
            // {   
            //     c.source.onended=()=>
            //     {
            //         this.play(buffer, beLoop, volume);
            //     }
            // }
        }
        /**
        * @public
        * @language zh_CN
        * @classdesc
        * 停止播放
        * @version m4m 1.0
        */
        stop()
        {
            if (this.audioChannel != null)
            {
                this.audioChannel.stop();
            }
        }
        /**
        * @public
        * @language zh_CN
        * @classdesc
        * 获取音量大小
        * @version m4m 1.0
        */
        get volume(): number
        {
            return this.audioChannel == null ? -1 : this.audioChannel.volume;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 设置音量大小
         * @param value 音量值
         * @version m4m 1.0
         */
        set volume(val: number)//-1~1
        {
            this.audioChannel == null ? 0 : this.audioChannel.volume = val;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获得当前音频播放器是否在播放
         * @version m4m 1.0
         */
        isPlaying()
        {
            return this.audioChannel == undefined ? false : this.audioChannel.isplay;
        }
        start()
        {
            this.audioChannel = AudioEx.instance().createAudioChannel(this.be3DSound);
        }

        onPlay()
        {

        }

        private lastX: number = 0;
        private lastY: number = 0;
        private lastZ: number = 0;
        private curPos: m4m.math.vector3;
        update(delta: number)
        {
            this.curPos = this.gameObject.transform.getWorldTranslate();
            if (this.audioChannel && (this.curPos.x != this.lastX || this.curPos.y != this.lastY || this.curPos.z != this.lastZ))
            {
                this.audioChannel.pannerNode.setPosition(this.curPos.x, this.curPos.y, this.curPos.z);
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

