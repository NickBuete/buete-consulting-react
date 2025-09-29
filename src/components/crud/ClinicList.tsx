import React from 'react'
import { useCrudResource } from '../../hooks/useCrudResource'

export interface Clinic {
  id: number
  name: string
  contactEmail?: string
  contactPhone?: string
  addressLine1?: string
  addressLine2?: string
  suburb?: string
  state?: string
  postcode?: string
  notes?: string
}

export function ClinicList({ ownerId }: { ownerId: number | string }) {
  const {
    data: clinics,
    loading,
    error,
    create,
    update,
    remove,
  } = useCrudResource<Clinic>({ ownerId, baseUrl: '/api/clinics' })
  const [form, setForm] = React.useState<Partial<Clinic>>({})

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Clinics</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <ul className="mb-6">
        {clinics.map((c) => (
          <li
            key={c.id}
            className="flex justify-between items-center py-2 border-b"
          >
            <span>{c.name}</span>
            <div>
              <button className="text-blue-500 mr-2" onClick={() => setForm(c)}>
                Edit
              </button>
              <button className="text-red-500" onClick={() => remove(c.id)}>
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
          placeholder="Clinic Name"
          value={form.name || ''}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        {/* Add more fields as needed */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {form.id ? 'Update' : 'Create'} Clinic
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
