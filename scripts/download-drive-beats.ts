import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUT = join(process.cwd(), 'temp', 'drive-beats');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const FILE_IDS = [
  '19LtTuTqA7ez6TP1eaexM-cdHALmjlhlE','1FunlRJ4kcqIsBffceFzYKyAtOQ187qSz',
  '19D_SMxgVKLWNODYM3nAvEmsXRXifuOba','1pv5XxRC9veEneb6O919Otd_R0NfuhOmm',
  '1kYOOTyhYy7R7p_BXI3gD-V6had1jTjRf','1hZ0esA2pxKGjNX7JT--9SwhrGGGpPH15',
  '1ThcoIb2vadLmLLR7L3uXHbwfo3b-YeVL','1Sfyae6SOuLyiaPhorEpYekn9KoCIX21J',
  '1t2fkl-zlcMP4HMj4QT4B-8qXW1a9Pg6g','1jQynaCxQ16ubnNFzMJ99zFAqljL4A4Tt',
  '1MPGXsXDLwSrSs2tAYRJ1tGPBf5Cssx0l','1cooA1zcmGZBIQWU6FX_OEKQWZam9ygJe',
  '15WVtA4x7huHMHlpdVdXJ0lCmDb3EBWa6','1J2PybnuoP1c-ZUwDnS1T9cySUe6TYZ1u',
  '1SRHsFfByN6TfFqC6lH1fFoZo_wkQjvfp','1GGrdS8iMGdzVPx1dRPVKoc-Lvug0_cCT',
  '1t2LOtRspGHfTLEN9VOyWFfJgn3lPz01C','1bmRiiE9pY26Vd3Lo9ezj4Hk-iewBCs6Z',
  '1v2o5VmA1YbV5dPOWb_2fi2Nk4wvCHAkn','1ASgD-A4wL7wCYCYlhICcayngEJEFutj6',
  '1hmJhi30S9YmtFmbooxCqsVOqHmz7YaLR','1QLXutsF5UO9ZCwUTfQQsRKqsnOCR7kmm',
  '13maAeUIP7p3XiZ97NyQVyYCQxxrytdnF','1pKdtFzYXoGJ9r2LpCFAI4vtcr5sfkvng',
  '1yeRxilQywJ4gmpXySdHeFZFqKxCYjZXZ','1maip_xExqFLghvKtPXjVOX7gzfxkMHOR',
  '1HGIwZftUVK4E__E_ckh4TegOI2_zDJrt','1QXF7jwJ8OGGr8UPXZT-RQ1tSI83Y780P',
  '1l7SPObvXR1e2SqgNVRqbgOF8oDXsKD1s','1r5J663vIVfdk8IUYq4dqiqlZj1HoKoSU',
  '16KzQ8m5rxZUThW9kjq1wuL9jtqJFqI5O','1D9nJbXACU83rlHkgi2QRF7y4XPRyV5xo',
  '1V7vdIA03AXvg4JgnXe8_WJN4XJiFgcUw','1NyNBpo_JR-_WmaDqCSuYuIwPm4viwjyI',
  '1jPURHG6Na1KqvloaUTPJ3O1G9byJvFvl','14lOPQPDW4LN0OlLDC8-YzMeQMU2iov1j',
  '1uBTqzkX0tIX7F8Aycua0O-oLhHB8LRRN','1e20KiVsGR5WEIhpT_tXOnWkVucHF15zg',
  '18VD1FdYyYcoKKpfnpUv1NaRc05swUJiM','1iWK-D-y--n4wFfdejnyKDQGd1gJmdf-J',
  '1vSGO-WYDgSIGwjXUh_pe6r2UTci8p7He','1SiCXIB8uPGyEaFMZ8VrxYJOUULwMlroG',
  '1OI_OBb_vAxPJ_xoqtp3XNCyrYc4cSQsW','1tocNnnkfYIRV-jFQdwupAzmbFYZ3Ho_a',
  '16b1_1dap0opGBktTohXRRi61vImQNAfs','1DZvXw5LCX7u9Efw30YVrpAQ2VZcx_cm9',
  '1BbfdmOSc7nu8ZKpQLVQbhzS32RkU1_L3','17Mvclmt4NRoy1aOOGVxIN2q7zAb37Ywn',
  '1I09NaFYmWrdbK7EUIw4jpO1_So0O29uH','1JixWegMjnLKh1ubp5-1DNLJHkdqHq8F2',
  '1r6QBlx3y5q3i1mwu45SBt6Va8ivpAYlJ','1IPuhcFrCMqZ0NCt_GUn_fESW2GQbr3TU',
  '1X6xwufUSN_MJaoafEZ71h2cEwe1aq6Oo','1I43Zz1LvPZp79D_EgAtJ_1ey2tSY9p5m',
  '1vpMERrBMH0Y8NmjcxaXCJKec07kD8Jp9'
];

let success = 0;
let fail = 0;

for (const id of FILE_IDS) {
  try {
    execSync(`gdown "${id}"`, { cwd: OUT, stdio: 'pipe', timeout: 120000 });
    console.log(`✓ ${id}`);
    success++;
  } catch (e: any) {
    console.log(`✗ ${id}`);
    fail++;
  }
  await new Promise(r => setTimeout(r, 600));
}

console.log(`\nDone: ${success} downloaded, ${fail} failed`);
