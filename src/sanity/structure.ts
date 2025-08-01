import type { StructureResolver } from 'sanity/structure';

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Genexus Checklist')
    .items([
      S.documentTypeListItem('checklist').title('Checklists'),
      S.documentTypeListItem('checklistItem').title('Check list items'),
      S.documentTypeListItem('userChecklistItem').title(
        'User Check list items',
      ),
      S.documentTypeListItem('checklistSummary').title('Checklist Summary'),
      S.documentTypeListItem('user').title('Users'),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) =>
          item.getId() &&
          ![
            'checklist',
            'checklistItem',
            'userChecklistItem',
            'checklistSummary',
            'user',
          ].includes(item.getId()!),
      ),
    ]);
