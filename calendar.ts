import { write } from '@jeswr/pretty-turtle';
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import { Quad } from "@rdfjs/types";
import { createFromShape } from "./createFromShape";
import { iterate } from "./iterate";
import { ScheduleActionShapeShapeType } from './ldo/ScheduleActionShape.shapeTypes';

async function main() {
    const res = await fetch('https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=2021-09-01T00:00:00Z&endDateTime=2021-09-30T00:00:00Z');
    
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
            xsd: 'http://www.w3.org/2001/XMLSchema#',
        }
    }));
}

main();
