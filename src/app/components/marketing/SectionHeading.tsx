export default function SectionHeading({
  badge,
  title,
  children,
  className = "",
}: {
  badge?: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-2xl text-center ${className}`}>
      {badge && <span className="badge">{badge}</span>}
      <h2 className="section-title text-gradient mt-5">{title}</h2>
      {children && <p className="lead mt-4">{children}</p>}
    </div>
  );
}