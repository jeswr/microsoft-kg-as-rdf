import dereference from 'rdf-dereference-store';
import { DataFactory, Store } from 'n3';
import { write } from "@jeswr/pretty-turtle";
import { write as shwrite } from "shaclc-write";
import { QueryEngine } from "@comunica/query-sparql";
import { shaclStoreToShexSchema, writeShexSchema } from '@jeswr/shacl2shex';
import * as fs from 'fs';
import * as path from 'path';
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
    const classIri = 'https://schema.org/ScheduleAction';
    const engine = new QueryEngine();

    const storeVal = new Store();
    const nm = classIri.split('/').slice(-1)[0] + 'Shape';
    const shapeName = namedNode('http://example.org/' + nm);

    storeVal.addQuad(quad(namedNode('https://schema.org/'), namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://www.w3.org/2002/07/owl#Ontology')));
    storeVal.addQuad(quad(shapeName, namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), namedNode('http://www.w3.org/ns/shacl#NodeShape')));
    storeVal.addQuad(quad(shapeName, namedNode('http://www.w3.org/ns/shacl#targetClass'), namedNode(classIri)));

    for await (const binding of await engine.queryBindings(query(classIri), { sources: [classIri] })) {
        const bn = blankNode();
        storeVal.addQuad(quad(shapeName, namedNode('http://www.w3.org/ns/shacl#property'), bn));
        const comment = binding.get('comment'), label = binding.get('label'), property = binding.get('property')!;

        if (comment && comment.termType === 'Literal') {
            storeVal.addQuad(quad(bn, namedNode('http://www.w3.org/ns/shacl#name'), comment));
        }
        if (label && label.termType === 'Literal') {
            storeVal.addQuad(quad(bn, namedNode('http://www.w3.org/ns/shacl#description'), label));
        }
        if (property.termType !== 'NamedNode') {
            throw new Error('Expected property to be a NamedNode');
        }
        storeVal.addQuad(quad(bn, namedNode('http://www.w3.org/ns/shacl#path'), property));
        
        // console.log(binding.get('property')?.value, binding.get('comment')?.value, binding.get('label')?.value);
        const range = await (await engine.queryBindings(prefixes + `SELECT DISTINCT ?range WHERE { GRAPH ?g { <${property.value}> schema:rangeIncludes ?range . } }`, { sources: [classIri] })).toArray();
        const rangeTerms = range.map(r => r.get('range')!);
        const literalType = rangeTerms.find(r => r.termType === 'NamedNode' && r.value in datatypeMapping);
        
        if (literalType) {
            storeVal.addQuad(quad(bn, namedNode('http://www.w3.org/ns/shacl#datatype'), namedNode(datatypeMapping[literalType.value as keyof typeof datatypeMapping])));
        } else if (rangeTerms.length === 1) {
            storeVal.addQuad(quad(bn, namedNode('http://www.w3.org/ns/shacl#class'), rangeTerms[0] as any));
        } else {
            storeVal.addQuad(quad(bn, namedNode('http://www.w3.org/ns/shacl#nodeKind'), namedNode('http://www.w3.org/ns/shacl#IRI')));
        }
    }

    const store = await dereference(classIri);
    fs.writeFileSync(path.join(__dirname, 'shex', nm + '.shex'), await writeShexSchema(await shaclStoreToShexSchema(storeVal), prefixesRecord))
    // console.log(await write([...storeVal], {
    //     prefixes: prefixesRecord,
    // }));
    // console.log(await writeShexSchema(await shaclStoreToShexSchema(storeVal), prefixesRecord));
    // console.log(await write([...store.store].map(q => quad(q.subject, q.predicate, q.object)), {
    //     prefixes: { schema: 'https://schema.org/', owl: 'http://www.w3.org/2002/07/owl#', rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', rdfs: 'http://www.w3.org/2000/01/rdf-schema#', sh: 'http://www.w3.org/ns/shacl#' },
    // }));
    // console.log(nm);
    // const { text } = await shwrite([...storeVal], {
    //     prefixes: { schema: 'https://schema.org/', owl: 'http://www.w3.org/2002/07/owl#', rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', rdfs: 'http://www.w3.org/2000/01/rdf-schema#', sh: 'http://www.w3.org/ns/shacl#' },
    // });
    // console.log(text);
}

main();
