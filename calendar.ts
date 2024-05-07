import { write } from '@jeswr/pretty-turtle';
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import { Quad } from "@rdfjs/types";
import { createFromShape } from "./createFromShape";
import { iterate } from "./iterate";
import { ScheduleActionShapeShapeType } from './ldo/ScheduleActionShape.shapeTypes';

async function main() {
    // const res = await authFetch(`https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=${new Date(Date.now()).toISOString()}&endDateTime=${new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()}`);
    // const res = await authFetch('https://graph.microsoft.com/v1.0/me/calendar/getSchedule', {
    //     method: 'POST',
    // });
    // const events = await res.json() as { value: MicrosoftGraph.Event[] };
    
    // Iterate through events in the past
    const result: Quad[] = [];
    for await (const event of iterate<MicrosoftGraph.Event>(`https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=${new Date(Date.now()).toISOString()}&endDateTime=${new Date(Date.now() + 1000 * 60 * 60 * 24 * 7 * 5).toISOString()}`)) {
        console.log(event.attendees)
        const calendar = createFromShape(ScheduleActionShapeShapeType, {
            '@id': event.webLink ?? event.id,
            name: event.subject ? [] : undefined,
            startTime: typeof event.start?.dateTime ==='string' ? [event.start!.dateTime] : undefined,
            endTime: typeof event.end?.dateTime ==='string' ? [event.end!.dateTime] : undefined,
            // TODO: Make these actual URIs
            participant: event.attendees ? event.attendees.map(a => a.emailAddress?.address).filter((a): a is string => typeof a === 'string').map(a => ({ '@id': 'mailto:' + a })) : undefined,
            description: event.bodyPreview ? [event.bodyPreview] : undefined,
            location: event.location?.displayName ? [event.location.displayName] : undefined,

        });
        result.push(...calendar);
    }

    console.log(await write(result, {
        prefixes: {
            schema: 'https://schema.org/',
        }
    }));

    // console.log(await res.json());
}

main();
