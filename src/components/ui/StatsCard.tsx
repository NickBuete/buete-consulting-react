import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './index'

type Stats = {
  patients: number
  prescribers: number
  clinics: number
  reviews: number
}

export const StatsCard: React.FC<{ stats: Stats }> = ({ stats }) => (
  <div className="grid gap-4 md:grid-cols-4">
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Patients
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">{stats.patients}</div>
      </CardContent>
    </Card>
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Prescribers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">
          {stats.prescribers}
        </div>
      </CardContent>
    </Card>
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Clinics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">{stats.clinics}</div>
      </CardContent>
    </Card>
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          Reviews
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">{stats.reviews}</div>
      </CardContent>
    </Card>
  </div>
)
