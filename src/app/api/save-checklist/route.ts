import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId, token } from '@/sanity/env.server';
import { NextResponse } from 'next/server';
import { groq } from 'next-sanity'; // Import groq

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: true,
});

// Define interfaces for better type checking
interface UserChecklistItemPayload {
  itemId: string;
  status: 'OK' | 'notOK' | 'na' | '';
  note: string;
}

interface SanityUserChecklistItemDocument {
  _type: 'userChecklistItem';
  checklistItem: { _ref: string; _type: 'reference' };
  status: 'OK' | 'notOK' | 'na' | '';
  note: string;
  checklistSummary: { _ref: string; _type: 'reference' };
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Handle user checklist items payload
    const { userId, taskCode, checklistId, items } = payload; // ✅ Lấy dữ liệu từ biến payload

    if (
      !userId ||
      !taskCode ||
      !checklistId ||
      !items ||
      !Array.isArray(items)
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required parameters or invalid items format in payload',
        },
        { status: 400 },
      );
    }

    // 1. Tìm kiếm checklistSummary hiện có
    const existingSummaryQuery = groq`*[_type == "checklistSummary" && user._ref == $userId && taskCode == $taskCode && checklist._ref == $checklistId][0]`;
    const existingSummary = await client.fetch(existingSummaryQuery, {
      userId,
      taskCode,
      checklistId,
    });

    let summaryId: string;
    const totalItems = items.length; // ✅ Sử dụng const
    const passedItems = items.filter(
      (item: UserChecklistItemPayload) => item.status === 'OK',
    ).length; // ✅ Sử dụng interface

    if (existingSummary) {
      // 2. Nếu checklistSummary đã tồn tại: Cập nhật và lấy _id
      summaryId = existingSummary._id;
      await client
        .patch(summaryId)
        .set({
          totalItems: totalItems,
          passedItems: passedItems,
        })
        .commit();

      // Xóa userChecklistItems cũ liên kết với summary này
      const oldItemsToDeleteQuery = groq`*[_type == "userChecklistItem" && checklistSummary._ref == $summaryId]._id`;
      const oldItemIdsToDelete = await client.fetch(oldItemsToDeleteQuery, {
        summaryId,
      });

      if (oldItemIdsToDelete.length > 0) {
        // Sử dụng transaction để xóa nhiều document hiệu quả hơn
        const transaction = client.transaction();
        oldItemIdsToDelete.forEach((id: string) => transaction.delete(id));
        await transaction.commit();
      }
    } else {
      // 3. Nếu checklistSummary chưa tồn tại: Tạo mới và lấy _id
      const newSummary = {
        _type: 'checklistSummary',
        user: { _ref: userId, _type: 'reference' },
        checklist: { _ref: checklistId, _type: 'reference' },
        taskCode: taskCode,
        totalItems: totalItems,
        passedItems: passedItems,
      };
      const createdSummary = await client.create(newSummary);
      summaryId = createdSummary._id;
    }

    // 4. Lưu userChecklistItems mới
    const itemsToCreate: SanityUserChecklistItemDocument[] = items.map(
      (item: UserChecklistItemPayload) => ({
        // ✅ Sử dụng interface
        _type: 'userChecklistItem',
        checklistItem: { _ref: item.itemId, _type: 'reference' },
        status: item.status,
        note: item.note || '',
        checklistSummary: { _ref: summaryId, _type: 'reference' }, // Liên kết với summary
      }),
    );

    // Sử dụng transaction để tạo nhiều document hiệu quả hơn
    const transaction = client.transaction();
    itemsToCreate.forEach((item: SanityUserChecklistItemDocument) =>
      transaction.create(item),
    ); // ✅ Sử dụng interface
    await transaction.commit();

    return NextResponse.json({ message: 'Checklist saved successfully!' });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
