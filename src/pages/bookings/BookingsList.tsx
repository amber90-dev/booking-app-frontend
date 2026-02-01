import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";
import Swal from "sweetalert2";

type BookingRow = {
  id: string;
  date: string | null;
  time: string | null;
  bookingRef: string | null;
  clientId: string | null;
  clientForename: string | null;
  clientSurname: string | null;
  pickUpAddress: string | null;
  dropOffAddress: string | null;
  vehicle: string | null;
  cancelled: boolean;
  totalClient: string | null;
};

type TabKey = "all" | "active" | "cancelled";

export default function BookingsList() {
  const { error: toastError, success } = useToast();

  const [rows, setRows] = useState<BookingRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [params, setParams] = useSearchParams();

  const page = parseInt(params.get("page") || "1", 10);
  const [tab, setTab] = useState<TabKey>(() => {
    const t = params.get("tab");
    return t === "active" || t === "cancelled" ? t : "all";
  });

  useEffect(() => {
    void fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tab]);

  async function fetchList() {
    setLoading(true);
    try {
      // Only send cancelled=true for "cancelled" tab
      const query: Record<string, any> = {
        page,
        limit: 20,
        q: q || undefined,
      };
      if (tab === "cancelled") query.cancelled = true;

      const { data } = await api.get("/bookings", { params: query });
      setRows(data.items);
      setTotal(data.total);
    } catch (e: any) {
      toastError(
        e?.response?.data?.message || e.message || "Failed to load bookings"
      );
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    const result = await Swal.fire({
      title: "Delete Booking?",
      text: "Are you sure you want to delete this booking? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(id);
      await api.delete(`/bookings/${id}`);
      success("Booking deleted");
      await fetchList();
    } catch (e: any) {
      toastError(e?.response?.data?.message || e.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  // Client-side filtering for Active (and safety for Cancelled)
  const visibleRows = useMemo(() => {
    if (tab === "active") return rows.filter((r) => !r.cancelled);
    if (tab === "cancelled") return rows.filter((r) => r.cancelled);
    return rows;
  }, [rows, tab]);

  // Pagination notes:
  // - All/Cancelled: server total is correct
  // - Active: client-side filter → use current page length as effective total
  const effectiveTotal = tab === "active" ? visibleRows.length : total;
  const pages = Math.max(1, Math.ceil(effectiveTotal / 20));

  const changeTab = (next: TabKey) => {
    setTab(next);
    setParams({ page: "1", tab: next });
  };

  const onSearch = () => {
    setParams({ page: "1", tab });
    void fetchList();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Bookings</h2>
        <div className="flex gap-2">
          <input
            className="input w-64"
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
          <button className="btn border border-slate-200" onClick={onSearch}>
            Search
          </button>
          <Link to="/bookings/new" className="btn btn-primary">
            New
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <Tab
          label="All"
          active={tab === "all"}
          onClick={() => changeTab("all")}
        />
        <Tab
          label="Active"
          active={tab === "active"}
          onClick={() => changeTab("active")}
        />
        <Tab
          label="Cancelled"
          active={tab === "cancelled"}
          onClick={() => changeTab("cancelled")}
        />
      </div>

      {/* Table */}
      <div className="card p-0 overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <Th>Date</Th>
              <Th>Time</Th>
              <Th>Ref</Th>
              <Th>Client</Th>
              <Th>From</Th>
              <Th>To</Th>
              <Th>Vehicle</Th>
              <Th>Status</Th>
              <Th>Total</Th>
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
            ) : visibleRows.length === 0 ? (
              <tr>
                <td className="p-4" colSpan={10}>
                  No bookings
                </td>
              </tr>
            ) : (
              visibleRows.map((r) => (
                <tr key={r.id} className="border-t">
                  <Td>{r.date ?? "-"}</Td>
                  <Td>{r.time ?? "-"}</Td>
                  <Td>{r.bookingRef ?? "-"}</Td>
                  <Td>
                    {r.clientForename || r.clientSurname
                      ? `${r.clientForename || ""} ${r.clientSurname || ""}`.trim()
                      : r.clientId ?? "-"}
                  </Td>
                  <Td
                    className="max-w-[240px] truncate"
                    title={r.pickUpAddress ?? undefined}
                  >
                    {r.pickUpAddress ?? "-"}
                  </Td>
                  <Td
                    className="max-w-[240px] truncate"
                    title={r.dropOffAddress ?? undefined}
                  >
                    {r.dropOffAddress ?? "-"}
                  </Td>
                  <Td>{r.vehicle ?? "-"}</Td>
                  <Td>
                    {r.cancelled ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs border border-rose-200 text-rose-700 bg-rose-50">
                        Cancelled
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs border border-emerald-200 text-emerald-700 bg-emerald-50">
                        Active
                      </span>
                    )}
                  </Td>
                  <Td>{r.totalClient ?? "-"}</Td>
                  <Td className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        to={`/bookings/${r.id}`}
                        className="p-1 text-slate-600 hover:text-slate-900 transition"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </Link>
                      <button
                        onClick={() => onDelete(r.id)}
                        disabled={deletingId === r.id}
                        aria-disabled={deletingId === r.id}
                        className="p-1 text-rose-600 hover:text-rose-800 transition disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === r.id ? (
                          <svg
                            className="animate-spin h-4 w-4 text-rose-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 018 8h-2a6 6 0 00-6-6v2H9V6a6 6 0 00-6 6H4z"
                            ></path>
                          </svg>
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

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setParams({ page: String(n), tab })}
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

function Tab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "px-3 py-1.5 rounded-md text-sm border transition " +
        (active
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50")
      }
    >
      {label}
    </button>
  );
}
