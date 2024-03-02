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
    export class thread
    {
        public static workerInstance: Worker;

        private static instance: thread;

        public static get Instance(): thread
        {
            if (!thread.instance)
                thread.instance = new thread();
            return thread.instance;
        }

        private worker: Worker;// = new Worker("lib/m4m.thread.js");
        private callID: number = 0;
        private callMap: { [id: number]: { callback: (result) => void } } = {};//new Map<number, { resolve: any }>();
        /**
         * 多线程
         */
        constructor()
        {
            if (!thread.workerInstance)
            {
                this.worker = new Worker("lib/th.js");
                this.worker.onmessage = (e: MessageEvent) =>
                {
                    //e.data.id
                    this.OnMessage(e);
                };

                this.worker.onerror = (e: ErrorEvent) =>
                {
                    console.error(e);
                };
            }
            else
            {
                this.worker = thread.workerInstance;
            }
        }

        /**
         * 当消息接收
         * @param e 
         */
        public OnMessage(e: MessageEvent)
        {
            if (e.data && this.callMap[e.data.id]){
                this.callMap[e.data.id].callback(e.data.result);
                delete this.callMap[e.data.id];
            }
        }

        /**
         * 执行
         * @param name 
         * @param data 
         * @param callback 
         */
        public Call(name: string, data: any, callback: (result) => void)
        {
            this.worker.postMessage({
                handle: name,
                data: data,
                id: ++this.callID
            });
            this.callMap[this.callID] = { callback: callback };

        }


    }
}