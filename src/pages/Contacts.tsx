
import Avatar from '../components/Avatar';

export default function Contacts() {
  const data = [
    { name: 'Ali Raza', company: 'Acme', email: 'ali@acme.com', status: 'Active' },
    { name: 'Sara Khan', company: 'Globex', email: 'sara@globex.com', status: 'Prospect' },
    { name: 'Hassan Bari', company: 'Umbrella', email: 'hassan@umb.com', status: 'Churn Risk' },
    { name: 'Zehra Tariq', company: 'Wayne Corp', email: 'zehra@wayne.com', status: 'Active' },
  ];
  return (
    <div className="card p-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
        <h3 className="font-semibold">Contacts</h3>
        <div className="flex gap-2">
          <input className="input w-64" placeholder="Search contacts..." />
          <button className="btn btn-primary">Add Contact</button>
        </div>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr><th className="py-2 pr-4">Name</th><th className="py-2 pr-4">Company</th><th className="py-2 pr-4">Email</th><th className="py-2 pr-4">Status</th></tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                <td className="py-2 pr-4 flex items-center gap-2"><Avatar name={r.name} /> {r.name}</td>
                <td className="py-2 pr-4">{r.company}</td>
                <td className="py-2 pr-4"><a className="link" href={`mailto:${r.email}`}>{r.email}</a></td>
                <td className="py-2 pr-4">
                  <span className={`badge ${r.status==='Active'?'badge-green': r.status==='Prospect'?'badge-amber':'badge-rose'}`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
