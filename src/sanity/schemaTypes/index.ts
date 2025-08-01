import { type SchemaTypeDefinition } from 'sanity';

import { userChecklistItemType } from './userChecklistItemType';
import { checklistType } from './checklistType';
import { checklistItemType } from './checklistItemType';
import { userType } from './userType';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [userChecklistItemType, checklistType, checklistItemType, userType],
};
