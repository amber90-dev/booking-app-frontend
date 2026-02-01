
export default function Settings() {
  return (
    <div className="card p-4 max-w-2xl">
      <h3 className="font-semibold mb-4">Settings</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Company Name</label>
          <input className="input" placeholder="Acme Inc." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Currency</label>
          <input className="input" placeholder="PKR" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Signature</label>
          <textarea className="input h-24" placeholder="Best regards, ..." />
        </div>
      </div>
      <div className="mt-4">
        <button className="btn btn-primary">Save changes</button>
      </div>
    </div>
  );
}
