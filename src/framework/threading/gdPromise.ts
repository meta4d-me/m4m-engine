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
namespace m4m.threading
{
    export class gdPromise<T>
    {
        private execQueue: Array<(value?: T) => void> = new Array<(value?: T) => void>();
        /** 异常捕获函数 */
        private catchMethod: (val: T) => void;
        // private thenCall: (val: T) => void;
        /**
         * 自定义 Promise
         * @param executor 
         */
        constructor(executor: (resolve: (value?: T) => void, reject: (reason?: any) => void) => void)
        {
            setTimeout(() =>
            {
                executor(this.resolve.bind(this), this.reject.bind(this));
            }, 0);
        }

        /**
         * 执行决定
         * @param value 数据 
         */
        public resolve(value?: T)
        {
            try
            {
                // if (this.thenCall)
                //     this.thenCall(value);
                while (this.execQueue.length > 0)
                    this.execQueue.shift()(value);
            } catch (e)
            {
                this.reject(e);
            }


        }
        /**
         * 执行拒绝
         * @param reason 
         * @returns 
         */
        public reject(reason?: any)
        {
            console.error(reason);
            if (this.catchMethod)
                return this.catchMethod(reason);

        }

        /**
         * 执行完然后
         * @param thenCall 
         * @returns 
         */
        public then(thenCall: (value?: T) => void): gdPromise<T>
        {
            // this.thenCall = thenCall;
            this.execQueue.push(thenCall);
            return this;
        }

        /**
         * 异常捕获
         * @param callbcack 
         * @returns 
         */
        public catch(callbcack: (val: any) => void): gdPromise<T>
        {
            this.catchMethod = callbcack;
            return this;
        }
    }
}