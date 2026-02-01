import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";
import { Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

type Row = {
  id: string;
  accountNo: string;
  name: string;
  address1: string | null;
  town: string | null;
  postcode: string | null;
  telNo: string | null;
  faxNo: string | null;
  daysToPay: number | null;
  surcharge: string | null;
};

export default function CompaniesList() {
  const { error: toastError, success } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [params, setParams] = useSearchParams();
  const page = parseInt(params.get("page") || "1", 10);

  useEffect(() => {
    void fetchList(); /* eslint-disable-next-line */
  }, [page]);

  async function fetchList() {
    setLoading(true);
    try {
      const { data } = await api.get("/companies", {
        params: { page, limit: 20, q: q || undefined },
      });
      setRows(data.items);
      setTotal(data.total);
    } catch (e: any) {
      toastError(
        e?.response?.data?.message || e.message || "Failed to load companies"
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
    const result = await Swal.fire({
      title: "Delete Company?",
      text: "Are you sure you want to delete this company record?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
    });
    if (!result.isConfirmed) return;

    try {
      setDeletingId(id);
      await api.delete(`/companies/${id}`);
      success("Company deleted");
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
        <h2 className="text-lg font-semibold">Companies</h2>
        <div className="flex gap-2">
          <input
            className="input w-72"
            placeholder="Search by account no, name, address..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
          <button className="btn border border-slate-200" onClick={onSearch}>
            Search
          </button>
          <Link to="/companies/new" className="btn btn-primary">
            New
          </Link>
        </div>
      </div>

      <div className="card p-0 overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <Th>Account No</Th>
              <Th>Name</Th>
              <Th>Address</Th>
              <Th>Town</Th>
              <Th>Postcode</Th>
              <Th>Tel</Th>
              <Th>Fax</Th>
              <Th>Days</Th>
              <Th>Surcharge</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4" colSpan={10}>
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="p-4" colSpan={10}>
                  No companies
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <Td>{r.accountNo}</Td>
                  <Td className="max-w-[220px] truncate" title={r.name}>
                    {r.name}
                  </Td>
                  <Td
                    className="max-w-[260px] truncate"
                    title={r.address1 ?? undefined}
                  >
                    {r.address1 ?? "—"}
                  </Td>
                  <Td>{r.town ?? "—"}</Td>
                  <Td>{r.postcode ?? "—"}</Td>
                  <Td>{r.telNo ?? "—"}</Td>
                  <Td>{r.faxNo ?? "—"}</Td>
                  <Td>{r.daysToPay ?? 0}</Td>
                  <Td>{r.surcharge ?? "0"}</Td>
                  <Td className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        to={`/companies/${r.id}`}
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
