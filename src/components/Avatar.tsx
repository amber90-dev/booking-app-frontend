
export default function Avatar({ name }: { name: string }) {
  const letter = (name || 'U').slice(0,1).toUpperCase();
  return (
    <div className="h-8 w-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm">{letter}</div>
  );
}
