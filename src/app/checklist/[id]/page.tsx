'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env.client'

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
})

type ChecklistItem = {
  _id: string
  label: string
  description?: string
  order?: number
}

type Checklist = {
  _id: string
  title: string
  type: string
  items: ChecklistItem[]
}

type CheckedMap = {
  [itemId: string]: boolean
}

export default function ChecklistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [checklist, setChecklist] = useState<Checklist | null>(null)
  const [checkedItems, setCheckedItems] = useState<CheckedMap>({})

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      const result = await client.fetch(
        `*[_type == "checklist" && _id == $id][0]{
          _id,
          title,
          type,
          "items": *[_type == "checklistItem" && checklist._ref == ^._id] | order(order asc){
            _id,
            label,
            description,
            order
          }
        }`,
        { id }
      )
      setChecklist(result)
    }

    fetchData()
  }, [id])

  const toggleChecked = (itemId: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  if (!checklist) return <div className="p-8 text-center">Đang tải checklist...</div>

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {checklist.title} [{checklist.type}] Checklist
      </h1>
      <ul className="space-y-6">
        {checklist.items.map((item, index) => (
          <li
            key={item._id}
            className="flex items-start gap-3 border-b pb-4"
          >
            <input
              type="checkbox"
              checked={checkedItems[item._id] || false}
              onChange={() => toggleChecked(item._id)}
              className="mt-1"
            />
            <div>
              <p className="font-semibold text-base">{index + 1}. {item.label}</p>
              {item.description && (
                <p className="text-sm text-gray-600 whitespace-pre-line mt-1">
                  {item.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
