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
﻿namespace m4m.math
{
    export function caclStringByteLength(value: string): number
    {
        let total = 0;
        for (let i = 0; i < value.length; i++)
        {
            let charCode = value.charCodeAt(i);
            if (charCode <= 0x007f)
            {
                total += 1;

            } else if (charCode <= 0x07ff)
            {
                total += 2;

            } else if (charCode <= 0xffff)
            {
                total += 3;

            } else
            {
                total += 4;
            }
        }
        return total;
    }
}