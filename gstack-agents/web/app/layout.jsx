import '../src/styles.css'

export const metadata = {
  title: 'Dermasaathi AI — Your skin, understood',
  description: 'A calmer way to understand your skin with Dermasaathi AI.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
