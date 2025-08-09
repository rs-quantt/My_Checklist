import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '@/sanity/env.client';
import { NextRequest, NextResponse } from 'next/server';

// Define interfaces for the expected data structure
interface SummaryItem {
  _id: string;
  taskCode: string;
  totalItems: number;
  passedItems: number;
  user: {
    _id: string;
    name: string;
  };
  checklist: {
      _id: string;
      title: string;
  }
  _updatedAt: string;
}

interface GroupedChecklistSummary {
  _id: string;
  title: string;
  summaries: SummaryItem[];
}

const client = createClient({
  projectId, dataset, apiVersion, useCdn: true,
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const groupBy = searchParams.get('groupBy') || 'checklist';

    // Query to get all checklistSummary with user and checklist info
    const query = `*[_type == "checklistSummary"]{
      _id,
      _updatedAt,
      taskCode,
      totalItems,
      passedItems,
      user->{
        _id,
        name
      },
      checklist->{
        _id,
        title
      }
    }`;

    const summaries: SummaryItem[] = await client.fetch(query);

    let result: GroupedChecklistSummary[] = [];

    if (groupBy === 'updatedAt') {
      const groupedByDate: { [date: string]: GroupedChecklistSummary } = {};

      summaries.forEach((summary) => {
        const date = new Date(summary._updatedAt).toLocaleDateString('en-CA'); // YYYY-MM-DD
        if (!groupedByDate[date]) {
          groupedByDate[date] = {
            _id: date,
            title: date,
            summaries: [],
          };
        }
        groupedByDate[date].summaries.push(summary);
      });
      result = Object.values(groupedByDate).sort((a, b) => b.title.localeCompare(a.title)); // Sort by date descending
    } else {
      // Grouping data by checklist
      const groupedByChecklist: { [checklistId: string]: GroupedChecklistSummary } = {};

      summaries.forEach((summary) => {
        const checklistId = summary.checklist?._id || 'unassigned';
        const checklistTitle = summary.checklist?.title || 'Unassigned';

        if (!groupedByChecklist[checklistId]) {
          groupedByChecklist[checklistId] = {
            _id: checklistId,
            title: checklistTitle,
            summaries: [],
          };
        }
        groupedByChecklist[checklistId].summaries.push(summary);
      });

      result = Object.values(groupedByChecklist);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching checklist summary:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
