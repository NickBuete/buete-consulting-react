import React from 'react'
import { useCrudResource } from '../../hooks/useCrudResource'

export interface Prescriber {
  id: number
  firstName: string
  lastName: string
  honorific?: string
  providerNumber?: string
  contactEmail?: string
  contactPhone?: string
  notes?: string
}

export function PrescriberList({ ownerId }: { ownerId: number | string }) {
  const {
    data: prescribers,
    loading,
    error,
    create,
    update,
    remove,
  } = useCrudResource<Prescriber>({ ownerId, baseUrl: '/api/prescribers' })
  const [form, setForm] = React.useState<Partial<Prescriber>>({})

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Prescribers</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <ul className="mb-6">
        {prescribers.map((p) => (
          <li
            key={p.id}
            className="flex justify-between items-center py-2 border-b"
          >
            <span>
              {p.honorific ? p.honorific + ' ' : ''}
              {p.firstName} {p.lastName}
            </span>
            <div>
              <button className="text-blue-500 mr-2" onClick={() => setForm(p)}>
                Edit
              </button>
              <button className="text-red-500" onClick={() => remove(p.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault()
          form.id ? update(form.id, form) : create(form)
          setForm({})
        }}
      >
        <input
          className="border px-2 py-1 w-full"
          placeholder="Honorific"
          value={form.honorific || ''}
          onChange={(e) =>
            setForm((f) => ({ ...f, honorific: e.target.value }))
          }
        />
        <input
          className="border px-2 py-1 w-full"
          placeholder="First Name"
          value={form.firstName || ''}
          onChange={(e) =>
            setForm((f) => ({ ...f, firstName: e.target.value }))
          }
        />
        <input
          className="border px-2 py-1 w-full"
          placeholder="Last Name"
          value={form.lastName || ''}
          onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
        />
        {/* Add more fields as needed */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {form.id ? 'Update' : 'Create'} Prescriber
        </button>
        {form.id && (
          <button
            type="button"
            className="ml-2 text-gray-500"
            onClick={() => setForm({})}
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  )
}
