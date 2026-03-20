export const metadata = {
  title: 'Sanity Studio',
  description: 'Manage your website content',
}

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Hide global layouts to let Sanity Studio take full window */}
      <style dangerouslySetInnerHTML={{ __html: `
        .header-row, .crypto-ticker-container, .floating-bubbles-portal { display: none !important; }
        body > canvas { display: none !important; }
        main { min-height: auto !important; padding: 0 !important; margin: 0 !important; }
        body { margin: 0 !important; padding: 0 !important; overflow: hidden !important; }
      `}} />
      <div style={{ height: '100vh', width: '100vw' }}>
        {children}
      </div>
    </>
  )
}
