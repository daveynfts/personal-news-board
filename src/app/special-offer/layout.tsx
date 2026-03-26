// Force this route segment to always be dynamically rendered
export const dynamic = 'force-dynamic';

export default function SpecialOfferLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
