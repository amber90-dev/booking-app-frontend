import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";
import { Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

type Row = {
  id: string;
  registrationNo: string;
  make: string | null;
  model: string | null;
  driverNo: string | null;
  colour: string | null;
  motExpiryDate: string | null;
  certOfInsExpiryDate: string | null;
};

export default function VehiclesList() {
  const { error: toastError, success } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [params, setParams] = useSearchParams();
  const page = parseInt(params.get("page") || "1", 10);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    void fetchList(); /* eslint-disable-next-line */
  }, [page]);

  async function fetchList() {
    setLoading(true);
    try {
      const { data } = await api.get("/vehicles", {
        params: { page, limit: 20, q: q || undefined },
      });
      setRows(data.items);
      setTotal(data.total);
    } catch (e: any) {
      toastError(
        e?.response?.data?.message || e.message || "Failed to load vehicles"
      );
    } finally {
      setLoading(false);
    }
  }

  const pages = Math.max(1, Math.ceil(total / 20));
  const onSearch = () => {
    setParams({ page: "1" });
    void fetchList();
  };

  async function onDelete(id: string) {
    const { isConfirmed } = await Swal.fire({
      title: "Delete Vehicle?",
      text: "This will permanently delete the record.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
    });
    if (!isConfirmed) return;

    try {
      setDeletingId(id);
      await api.delete(`/vehicles/${id}`);
      success("Vehicle deleted");
      await fetchList();
    } catch (e: any) {
      toastError(e?.response?.data?.message || e.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Vehicles</h2>
        <div className="flex gap-2">
          <input
            className="input w-72"
            placeholder="Search reg/make/model/driver"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
          <button className="btn border border-slate-200" onClick={onSearch}>
            Search
          </button>
          <Link to="/vehicles/new" className="btn btn-primary">
            New
          </Link>
        </div>
      </div>

      <div className="card p-0 overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <Th>Registration</Th>
              <Th>Make</Th>
              <Th>Model</Th>
              <Th>Driver No</Th>
              <Th>Colour</Th>
              <Th>MOT Expiry</Th>
              <Th>Insurance Expiry</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-4">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4">
                  No vehicles
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <Td>{r.registrationNo}</Td>
                  <Td>{r.make ?? "—"}</Td>
                  <Td>{r.model ?? "—"}</Td>
                  <Td>{r.driverNo ?? "—"}</Td>
                  <Td>{r.colour ?? "—"}</Td>
                  <Td>{r.motExpiryDate ?? "—"}</Td>
                  <Td>{r.certOfInsExpiryDate ?? "—"}</Td>
                  <Td className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        to={`/vehicles/${r.id}`}
                        className="p-1 text-slate-600 hover:text-slate-900"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </Link>
                      <button
                        onClick={() => onDelete(r.id)}
                        disabled={deletingId === r.id}
                        className="p-1 text-rose-600 hover:text-rose-800 disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === r.id ? (
                          <span className="text-xs">…</span>
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setParams({ page: String(n) })}
              className={`px-3 py-1 rounded border ${
                n === page ? "bg-slate-900 text-white" : "border-slate-200"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Th({ children, className = "" }: any) {
  return (
    <th className={`px-3 py-2 text-left font-medium ${className}`}>
      {children}
    </th>
  );
}
function Td({ children, className = "" }: any) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
