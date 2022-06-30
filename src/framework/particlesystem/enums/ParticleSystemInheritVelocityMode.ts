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
     * How to apply emitter velocity to particles.
     * 
     * 如何将发射体速度应用于粒子。
     * 
     * @author feng3d
     */
    export enum ParticleSystemInheritVelocityMode
    {
        /**
         * Each particle inherits the emitter's velocity on the frame when it was initially emitted.
         * 
         * 每个粒子在最初发射时都继承了发射体在帧上的速度。
         */
        Initial,

        /**
         * Each particle's velocity is set to the emitter's current velocity value, every frame.
         * 
         * 每一帧，每个粒子的速度都设定为发射器的当前速度值。
         */
        Current,
    }
}