import { supabase } from '@/lib/supabase'
import MetricCard from './components/MetricCard'
import SalesChart from './components/SalesChart'
import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react'

interface Order {
  id: number
  external_id: string
  amount: number
  status: string
  customer_name: string
  created_at: string
}

async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return data as Order[]
}

function prepareChartData(orders: Order[]) {
  const dailySales = orders.reduce((acc, order) => {
    const date = new Date(order.created_at).toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit' 
    })
    
    if (!acc[date]) {
      acc[date] = 0
    }
    acc[date] += Number(order.amount)
    
    return acc
  }, {} as Record<string, number>)

  return Object.entries(dailySales).map(([date, amount]) => ({
    date,
    amount: Math.round(amount)
  }))
}

export default async function Home() {
  const orders = await getOrders()
  
  const totalSales = orders.reduce((sum, order) => sum + Number(order.amount), 0)
  const orderCount = orders.length
  const averageCheck = orderCount > 0 ? totalSales / orderCount : 0
  
  const chartData = prepareChartData(orders)

  return (
    <main className="min-h-screen bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Панель заказов</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Общая сумма"
            value={`${totalSales.toLocaleString('ru-RU')} ₸`}
            icon={DollarSign}
          />
          <MetricCard
            title="Количество заказов"
            value={orderCount.toString()}
            icon={ShoppingCart}
          />
          <MetricCard
            title="Средний чек"
            value={`${Math.round(averageCheck).toLocaleString('ru-RU')} ₸`}
            icon={TrendingUp}
          />
        </div>

        <SalesChart data={chartData} />
      </div>
    </main>
  )
}
