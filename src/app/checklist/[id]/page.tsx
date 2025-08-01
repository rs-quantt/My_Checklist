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

type User = {
  _id: string
  name: string
}

type Status = 'OK' | 'notOK' | 'na'

type ItemState = {
  status: Status
  note: string
}

type ItemStateMap = {
  [itemId: string]: ItemState
}

export default function ChecklistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [checklist, setChecklist] = useState<Checklist | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [taskCode, setTaskCode] = useState<string>('')
  const [itemStates, setItemStates] = useState<ItemStateMap>({})

  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      const checklistResult = await client.fetch(
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

      const userResult = await client.fetch(
        `*[_type == "user"]{ _id, name }`
      )

      setChecklist(checklistResult)
      setUsers(userResult)
    }

    fetchData()
  }, [id])

  const handleStatusChange = async (itemId: string, status: Status) => {
    const newState = { ...itemStates[itemId], status }
    setItemStates((prev) => ({ ...prev, [itemId]: newState }))

    await trySave(itemId, newState.note || '', status)
  }

  const handleNoteChange = async (itemId: string, note: string) => {
    const newState = { ...itemStates[itemId], note }
    setItemStates((prev) => ({ ...prev, [itemId]: newState }))

    await trySave(itemId, note, newState.status || 'na')
  }

  const trySave = async (itemId: string, note: string, status: Status) => {
    if (!selectedUserId || !taskCode) {
      console.warn('Chưa chọn user hoặc chưa nhập mã task.')
      return
    }

    const res = await fetch('/api/save-checklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: selectedUserId,
        taskCode,
        itemId,
        note,
        status,
      }),
    })

    if (!res.ok) {
      console.error('Lưu thất bại:', await res.text())
    }
  }

  if (!checklist) return <div className="p-8 text-center">Đang tải checklist...</div>

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-center">
        {checklist.title} [{checklist.type}] Checklist
      </h1>

      {/* Select user */}
      <div>
        <label className="block font-medium mb-1">Chọn người làm:</label>
        <select
          className="border p-2 w-full rounded"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
        >
          <option value="">-- Chọn người --</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
        </select>
      </div>

      {/* Task code */}
      <div>
        <label className="block font-medium mb-1">Mã task:</label>
        <input
          className="border p-2 w-full rounded"
          type="text"
          placeholder="Nhập mã task (VD: TASK-001)"
          value={taskCode}
          onChange={(e) => setTaskCode(e.target.value)}
        />
      </div>

      {/* Checklist items */}
      <ul className="space-y-8">
        {checklist.items.map((item, index) => {
          const state = itemStates[item._id] || { status: 'na', note: '' }

          return (
            <li key={item._id} className="border-b pb-6">
              <p className="font-semibold mb-2">{index + 1}. {item.label}</p>
              {item.description && (
                <p className="text-sm text-gray-600 whitespace-pre-line mb-2">
                  {item.description}
                </p>
              )}
              <div className="flex gap-6 mb-2">
                {['OK', 'notOK', 'na'].map((status) => (
                  <label key={status} className="flex items-center gap-1">
                    <input
                      type="radio"
                      value={status}
                      checked={state.status === status}
                      onChange={() => handleStatusChange(item._id, status as Status)}
                    />
                    {status === 'OK' ? 'OK' : status === 'notOK' ? 'Not OK' : 'N/A'}
                  </label>
                ))}
              </div>
              {state.status !== 'OK' && (
                <textarea
                  value={state.note}
                  onChange={(e) => handleNoteChange(item._id, e.target.value)}
                  placeholder="Lý do / ghi chú"
                  className="w-full p-2 border rounded"
                />
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
