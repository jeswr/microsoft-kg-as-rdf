import { Client, AuthProvider } from "@microsoft/microsoft-graph-client";
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types"
import { ReadableWebToNodeStream } from "@smessie/readable-web-to-node-stream";
// @ts-ignore
import { parseEmail } from 'eml2pod/dist/input/parseEmail';
// @ts-ignore
import { emailToRdf } from 'eml2pod/dist/rdf/emailToRdf';
import { Store, DataFactory } from 'n3';
import { write } from '@jeswr/pretty-turtle';
import { authFetch } from './auth';
import { iterate } from "./iterate";

// async function* getMessages(): AsyncIterableIterator<MicrosoftGraph.Message> {
//     let link: string | undefined = 'https://graph.microsoft.com/v1.0/me/messages';

//     while (link) {
//         const res = await authFetch(link);
//         const firstMessage = (await res.json() as { value: MicrosoftGraph.Message[], '@odata.nextLink'?: string });
//         console.log(res, firstMessage)
//         yield* firstMessage.value;
//         link = firstMessage['@odata.nextLink'];
//     }
// }

const mail = 'http://www.w3.org/2000/10/swap/pim/email#'
const ml = (prop: string) => DataFactory.namedNode(`${mail}${prop}`);
// const Mail = new Proxy({}, {
//     get: (target, prop: string) => DataFactory.namedNode(`${mail}${prop}`)
// });

// Question: How do we store the body?
async function main() {
    let i = 0;

    for await (const message of iterate<MicrosoftGraph.Message>('https://graph.microsoft.com/v1.0/me/messages')) {
        const store = new Store();
        const email = DataFactory.namedNode(message.webLink!);
        store.addQuads([
            DataFactory.quad(
                email,
                DataFactory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                ml('Message')
            ),
            DataFactory.quad(
                email,
                ml('subject'),
                DataFactory.literal(message.subject!)
            ),
            DataFactory.quad(
                email,
                ml('from'),
                DataFactory.namedNode('mailto:' + message.from?.emailAddress?.address!)
            ),
            DataFactory.quad(
                email,
                ml('date'),
                DataFactory.literal(message.sentDateTime!, DataFactory.namedNode('http://www.w3.org/2001/XMLSchema#dateTime'))
            ),
            DataFactory.quad(
                email,
                ml('received_iso'),
                DataFactory.literal(message.receivedDateTime!, DataFactory.namedNode('http://www.w3.org/2001/XMLSchema#dateTime'))
            ),
        ]);

        for (const cc of message.ccRecipients!) {
            store.addQuad(
                email,
                ml('cc'),
                DataFactory.namedNode('mailto:' + cc.emailAddress!.address!)
            );
        }
        
        
        console.log(await write([...store], {
            prefixes: {
                mail: 'http://www.w3.org/2000/10/swap/pim/email#',
            }
        }));


        // message.ccRecipients

        // console.log(message.toRecipients);

        // const attach = message.attachments?.[0]
        // console.log(attach)

        // const webLinkResult = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${message.id}/$value`, {
        //     headers: {
        //         Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
        //     },
        // })
        // const store = new Store();
        // await emailToRdf(await parseEmail(new ReadableWebToNodeStream(webLinkResult.body!)), store);
        // // const res = await new Promise((resolve, reject) => {
        // //     await emailToRdf(await parseEmail(new ReadableWebToNodeStream(webLinkResult.body!)));
        // // });
        
        // // console.log(await webLinkResult.body);
        if (i++ > 35) {
            break;
        }
    }
}

main();