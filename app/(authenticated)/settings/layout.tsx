export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Settings component provides its own Header/Main, so just return children
  // The parent authenticated layout will skip header for /settings/* routes
  return <>{children}</>
}













