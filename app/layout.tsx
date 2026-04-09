import './globals.css'

export const metadata = {
  title: 'Панель заказов',
  description: 'Панель управления заказами',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
