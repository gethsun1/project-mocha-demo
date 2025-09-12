import { AdminHeader } from '@/components/admin-header'
import { CreateFarmForm } from '@/components/create-farm-form'
import { AdminFarmList } from '@/components/admin-farm-list'

export default function AdminPage() {
  return (
    <div className="min-h-screen coffee-gradient-light">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-coffee-espresso mb-2">Admin Dashboard</h1>
          <p className="text-coffee-mocha">Manage coffee farms and monitor investments</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-coffee-espresso">Create New Farm</h2>
            <CreateFarmForm />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4 text-coffee-espresso">Existing Farms</h2>
            <AdminFarmList />
          </div>
        </div>
      </main>
    </div>
  )
}
