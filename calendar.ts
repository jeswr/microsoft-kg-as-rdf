import * as MicrosoftGraph from "@microsoft/microsoft-graph-types"
import { authFetch } from './auth';
import { iterate } from "./iterate";

async function main() {
    // const res = await authFetch(`https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=${new Date(Date.now()).toISOString()}&endDateTime=${new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()}`);
    // const res = await authFetch('https://graph.microsoft.com/v1.0/me/calendar/getSchedule', {
    //     method: 'POST',
    // });
    // const events = await res.json() as { value: MicrosoftGraph.Event[] };
    
    // Iterate through events in the past
    for await (const event of iterate<MicrosoftGraph.Message>(`https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=${new Date(Date.now()).toISOString()}&endDateTime=${new Date(Date.now() + 1000 * 60 * 60 * 24 * 7 * 5).toISOString()}`)) {
        console.log(event.subject);
    }

    // console.log(await res.json());
}

main();