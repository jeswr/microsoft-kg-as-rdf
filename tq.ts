import dereference from 'rdf-dereference-store';
import { DataFactory, Store } from 'n3';
import { write } from "@jeswr/pretty-turtle";
import { write as shwrite } from "shaclc-write";
import { QueryEngine } from "@comunica/query-sparql";
import { shaclStoreToShexSchema, writeShexSchema } from '@jeswr/shacl2shex';
const { namedNode, quad, blankNode } = DataFactory;

const prefixes = `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX schema: <https://schema.org/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>

`;

const query = (cls: string) => prefixes + `
SELECT DISTINCT ?property ?comment ?label WHERE {
    GRAPH ?g {
        <${cls}> rdfs:subClassOf*/^schema:domainIncludes ?property .
        OPTIONAL { ?property rdfs:comment ?comment }
        OPTIONAL { ?property rdfs:label ?label }
    }
}
`

const prefixesRecord = { schema: 'https://schema.org/', owl: 'http://www.w3.org/2002/07/owl#', rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', rdfs: 'http://www.w3.org/2000/01/rdf-schema#', sh: 'http://www.w3.org/ns/shacl#' } as Record<string, string>;

const datatypeMapping = {
    'https://schema.org/Time': 'http://www.w3.org/2001/XMLSchema#time',
    'https://schema.org/Date': 'http://www.w3.org/2001/XMLSchema#date',
    'https://schema.org/DateTime': 'http://www.w3.org/2001/XMLSchema#dateTime',
    'https://schema.org/Number': 'http://www.w3.org/2001/XMLSchema#double',
    'https://schema.org/Boolean': 'http://www.w3.org/2001/XMLSchema#boolean',
    'https://schema.org/Text': 'http://www.w3.org/2001/XMLSchema#string',
}

async function main() {
    const shape = await dereference('https://schema.org/ScheduleAction');
}

main();
