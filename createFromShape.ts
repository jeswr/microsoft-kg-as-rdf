import { LdoBase, ShapeType, createLdoDataset, getDataset } from "@ldo/ldo";
import { Dataset } from "@rdfjs/types";

export function createFromShape<T extends LdoBase>(shape: ShapeType<T>, data: T): Dataset {
    return getDataset(createLdoDataset([]).usingType(shape).fromJson(data))
}
