import { write } from '@jeswr/pretty-turtle';
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import { Quad } from "@rdfjs/types";
import { createFromShape } from "./createFromShape";
import { iterate } from "./iterate";
import { ScheduleActionShapeShapeType } from './ldo/ScheduleActionShape.shapeTypes';
import { authFetch } from './auth';

async function main() {
    // https://graph.microsoft.com/v1.0/users?$filter=mail eq 'jesse.wright@jesus.ox.ac.uk'
    const res = await authFetch('https://graph.microsoft.com/v1.0/users(\'jesse.wright@jesus.ox.ac.uk\')');
    console.log(res);
}

main();

