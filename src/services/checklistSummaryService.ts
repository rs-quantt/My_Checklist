import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';

const checklistSummaryCountQuery = groq`
  count(*[_type == "checklistSummary"])
`;

export async function getChecklistSummaryCount(): Promise<number> {
  try {
    const count = await client.fetch(checklistSummaryCountQuery);
    return count;
  } catch (error) {
    console.error('Error fetching checklist summary count:', error);
    throw new Error('Failed to fetch checklist summary count');
  }
}

const checklistSummaryDistributionQuery = groq`
  *[_type == "checklistSummary"]{
    "checklistTitle": checklist->title
  }
`;

export async function getChecklistSummaryDistribution() {
  try {
    const summaries: { checklistTitle: string }[] = await client.fetch(
      checklistSummaryDistributionQuery,
    );

    const distribution = summaries.reduce(
      (acc, summary) => {
        const title = summary.checklistTitle || 'Untitled';
        acc[title] = (acc[title] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
    }));
  } catch (error) {
    console.error('Error fetching checklist summary distribution:', error);
    throw new Error('Failed to fetch checklist summary distribution');
  }
}
