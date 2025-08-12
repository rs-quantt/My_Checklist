import { type SchemaTypeDefinition } from 'sanity';

import { checklistType } from './checklistType';
import { userType } from './userType';
import { userChecklistItemType } from './userChecklistItemType';
import { checklistItemType } from './checklistItemType';
import { checklistSummaryType } from './checklistSummaryType';
import { ruleType } from './ruleType';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    userChecklistItemType,
    checklistType,
    checklistItemType,
    checklistSummaryType,
    userType,
    ruleType,
  ],
};
