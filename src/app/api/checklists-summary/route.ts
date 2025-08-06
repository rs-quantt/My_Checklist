import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '@/sanity/env.client';
import { NextResponse } from 'next/server';

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
}

interface GroupedChecklistSummary {
  _id: string;
  title: string;
  summaries: SummaryItem[];
}

const client = createClient({
  projectId, dataset, apiVersion, useCdn: true,
});

export async function GET() {
  try {
    // Query để lấy tất cả checklistSummary cùng với thông tin user và checklist
    const query = `*[_type == "checklistSummary"]{
      _id,
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

    const summaries = await client.fetch(query);

    // Grouping data by checklist
    const groupedSummaries: { [checklistId: string]: GroupedChecklistSummary } = {};

 summaries.forEach((summary: SummaryItem & { checklist: { _id: string, title: string } }) => {
 const checklistId = summary.checklist._id;
      if (!groupedSummaries[checklistId]) {
        groupedSummaries[checklistId] = {
          _id: checklistId,
          title: summary.checklist.title,
          summaries: [],
        };
      }
      groupedSummaries[checklistId].summaries.push({
        _id: summary._id,
        taskCode: summary.taskCode,
        totalItems: summary.totalItems,
        passedItems: summary.passedItems,
        user: summary.user,
      });
    });

    // Convert groupedSummaries object to an array
    const result = Object.values(groupedSummaries);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching checklist summary:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
