import { AdminHeader } from '@/components/admin-header'
import { CreateFarmForm } from '@/components/create-farm-form'
import { AdminFarmList } from '@/components/admin-farm-list'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage coffee farms and monitor investments</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Create New Farm</h2>
            <CreateFarmForm />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Existing Farms</h2>
            <AdminFarmList />
          </div>
        </div>
      </main>
    </div>
  )
}
