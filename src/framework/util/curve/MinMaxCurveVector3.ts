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
     * 
     * @author feng3d
     */
    export class MinMaxCurveVector3
    {
        /**
         * x 曲线
         */
        
        xCurve = new MinMaxCurve();

        /**
         * y 曲线
         */
        
        yCurve = new MinMaxCurve();

        /**
         * z 曲线
         */
        
        zCurve = new MinMaxCurve();

        /**
         * 获取值
         * @param time 时间
         */
        getValue(time: number, randomBetween: number = Math.random())
        {
            return new math.vector3(this.xCurve.getValue(time, randomBetween), this.yCurve.getValue(time, randomBetween), this.zCurve.getValue(time, randomBetween));
        }
    }
}