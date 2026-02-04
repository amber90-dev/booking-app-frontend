import { useEffect, useState, FormEvent, useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import api from "../../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../components/toast/ToastProvider";

/* =========================
   Types & Validation Utils
   ========================= */

type Booking = {
  id?: string;

  // Booking / Company
  bookingRef?: string | null;
  accountNo?: string | null;
  costCentre?: string | null;
  companyName?: string | null;
  companyTelNo?: string | null;
  vip?: boolean;

  // Contact
  contactId?: string | null;
  contactForename?: string | null;
  contactSurname?: string | null;
  contactTelNo?: string | null;

  // Staff
  staffId?: string | null;
  staffForename?: string | null;
  staffSurname?: string | null;
  staffTelNo?: string | null;
  dateTaken?: string | null; // YYYY-MM-DD
  timeTaken?: string | null; // HH:mm

  // Client
  clientId?: string | null;
  clientForename?: string | null;
  clientSurname?: string | null;
  clientAddress1?: string | null;
  clientAddress2?: string | null;
  clientTown?: string | null;
  clientPostcode?: string | null;
  clientTelNo?: string | null;
  clientMobile?: string | null;

  // Driver
  driverNo?: string | null;
  driverForename?: string | null;
  driverSurname?: string | null;
  driverMobile?: string | null;

  // Trip
  date?: string | null; // YYYY-MM-DD
  time?: string | null; // HH:mm
  pickUpAddress?: string | null;
  dropOffAddress?: string | null;
  via?: string | null;
  extraInfo?: string | null;
  detailsGiven?: boolean;
  vehicle?: string | null;
  cancelled?: boolean;

  // Client Fare
  clientScheduledFare?: string | null;
  clientCharge?: string | null;
  clientMeetGreet?: string | null;
  clientWaitingTime?: string | null;
  clientWaitingTimePrice?: string | null;
  clientLhrGtwCharge?: string | null;
  // clientTelUsedMins?: number | null;
  // clientTelCharge?: string | null;
  clientViaPrice?: string | null;
  clientGratuity?: string | null;

  clientCarPark?: string | null;
  totalClient?: string | null;

  // Driver Fare
  driverScheduledFare?: string | null;
  driverCharge?: string | null;
  driverMeetGreet?: string | null;
  driverWaitingTime?: string | null;
  driverWaitingTimePrice?: string | null;
  driverLhrGtwCharge?: string | null;
  // driverTelUsedMins?: number | null;
  // driverTelCharge?: string | null;
  driverViaPrice?: string | null;
  driverGratuity?: string | null;

  driverCarPark?: string | null;
  totalDriver?: string | null;

  notes?: string | null;
};

type Errors = Partial<Record<keyof Booking, string>>;

const REQUIRED: (keyof Booking)[] = [
  "date",
  "time",
  "pickUpAddress",
  "dropOffAddress",
  "vehicle",
];

const STRING_FIELDS = new Set<keyof Booking>([
  "bookingRef",
  "accountNo",
  "costCentre",
  "companyName",
  "companyTelNo",
  "contactId",
  "contactForename",
  "contactSurname",
  "contactTelNo",
  "staffId",
  "staffForename",
  "staffSurname",
  "staffTelNo",
  "dateTaken",
  "timeTaken",
  "clientId",
  "clientForename",
  "clientSurname",
  "clientAddress1",
  "clientAddress2",
  "clientTown",
  "clientPostcode",
  "clientTelNo",
  "clientMobile",
  "driverNo",
  "driverForename",
  "driverSurname",
  "driverMobile",
  "date",
  "time",
  "pickUpAddress",
  "dropOffAddress",
  "via",
  "extraInfo",
  "vehicle",
  "clientScheduledFare",
  "clientCharge",
  "clientMeetGreet",
  "clientWaitingTime",
  "clientWaitingTimePrice",
  "clientLhrGtwCharge",
  // "clientTelCharge",
  "clientViaPrice",
  "clientGratuity",
  "clientCarPark",
  "totalClient",
  "driverScheduledFare",
  "driverCharge",
  "driverMeetGreet",
  "driverWaitingTime",
  "driverWaitingTimePrice",
  "driverLhrGtwCharge",
  // "driverTelCharge",
  "driverViaPrice",
  "driverGratuity",
  "driverCarPark",
  "totalDriver",
  "notes",
]);

const norm = (v: unknown) => String(v ?? "").trim();

function validate(m: Booking): Errors {
  const e: Errors = {};

  for (const k of REQUIRED) {
    if (!norm((m as any)[k])) e[k] = "Required";
  }

  // time (24h, H:mm or HH:mm)
  const t = norm(m.time);
  if (t && !/^(?:[01]?\d|2[0-3]):[0-5]\d$/.test(t)) e.time = "Use HH:mm";

  // dateTaken/timeTaken (optional but validate if present)
  if (m.dateTaken && !/^\d{4}-\d{2}-\d{2}$/.test(norm(m.dateTaken)))
    e.dateTaken = "Use YYYY-MM-DD";
  if (m.timeTaken && !/^(?:[01]?\d|2[0-3]):[0-5]\d$/.test(norm(m.timeTaken)))
    e.timeTaken = "Use HH:mm";

  // money fields (optional but numeric with up to 2 decimals)
  const money = [
    "clientScheduledFare",
    "clientCharge",
    "clientMeetGreet",
    "clientWaitingTime",
    "clientWaitingTimePrice",
    "clientLhrGtwCharge",
    // "clientTelCharge",
    "clientViaPrice",
    "clientGratuity",
    "clientCarPark",
    "totalClient",
    "driverScheduledFare",
    "driverCharge",
    "driverMeetGreet",
    "driverWaitingTime",
    "driverWaitingTimePrice",
    "driverLhrGtwCharge",
    // "driverTelCharge",
    "driverViaPrice",
    "driverGratuity",
    "driverCarPark",
    "totalDriver",
  ] as const;
  money.forEach((k) => {
    const v = norm(m[k]);
    if (v && !/^-?\d+(\.\d{1,2})?$/.test(v)) e[k] = "Invalid amount";
  });

  // integer mins - REMOVED
  // (["clientTelUsedMins", "driverTelUsedMins"] as const).forEach((k) => {
  //   const raw = (m as any)[k];
  //   if (
  //     raw !== null &&
  //     raw !== undefined &&
  //     raw !== "" &&
  //     !/^-?\d+$/.test(String(raw))
  //   ) {
  //     e[k] = "Must be an integer";
  //   }
  // });

  return e;
}

/* =========================
   Helper Components (module-scope!)
   ========================= */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="px-4 py-3 border-b font-medium">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid md:grid-cols-2 gap-4">{children}</div>;
}
function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm text-slate-600 mb-1">{label}</div>
      {children}
    </label>
  );
}

/* Money field */
type MoneyFieldProps = {
  name: keyof Booking;
  label: string;
  model: Booking;
  setField: (k: keyof Booking) => (e: any) => void;
  markTouched: (k: keyof Booking) => () => void;
  showError: boolean;
  error?: string;
};
function MoneyField({
  name,
  label,
  model,
  setField,
  markTouched,
  showError,
  error,
}: MoneyFieldProps) {
  return (
    <L label={label}>
      <input
        className="input"
        value={(model[name] as any) ?? ""}
        onChange={setField(name)}
        onBlur={markTouched(name)}
      />
      {showError && error && (
        <div className="text-rose-600 text-xs mt-1">{error}</div>
      )}
    </L>
  );
}

/* =========================
   Shared Lookup Utilities (Company/Contact/Staff/Client/Driver)
   ========================= */

type OptBase = { id: string; name: string; telNo?: string | null; _raw?: any };

function useDebouncedValue<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function useEntityLookup(endpoint: string, query: string, limit = 10) {
  const [opts, setOpts] = useState<OptBase[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dq = useDebouncedValue(query, 300);

  useEffect(() => {
    if (!dq) {
      setOpts([]);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(endpoint, { params: { q: dq, limit } });
        const items = Array.isArray(data?.items) ? data.items : [];
        setOpts(
          items.map((x: any) => ({
            id: String(x.id ?? x.code ?? x.employeeId ?? ""),
            name: String(
              x.name ??
                x.fullName ??
                (x.forename && x.surname
                  ? `${x.forename} ${x.surname}`
                  : x.companyName ?? "")
            ),
            telNo: x.telNo ?? x.phone ?? x.mobile ?? x.companyTelNo ?? null,
            _raw: x,
          }))
        );
        setOpen(true);
      } catch {
        setOpts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [dq, endpoint, limit]);

  return { opts, open, setOpen, loading };
}

function Dropdown({
  open,
  loading,
  options,
  onPick,
}: {
  open: boolean;
  loading: boolean;
  options: OptBase[];
  onPick: (o: any) => void;
}) {
  if (!open || (!loading && options.length === 0)) return null;
  return (
    <div className="absolute z-20 mt-1 w-full max-h-64 overflow-auto rounded-md border border-slate-200 bg-white shadow">
      {loading && (
        <div className="px-3 py-2 text-sm text-slate-500">Searching…</div>
      )}
      {!loading &&
        options.map((o: any) => (
          <button
            key={o.id}
            type="button"
            className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onPick(o)}
            title={o.name}
          >
            <span className="font-mono">{o.id}</span>
            <span className="mx-2 text-slate-400">—</span>
            <span className="truncate inline-block max-w-[70%] align-middle">
              {o.name || "Unnamed"}
            </span>
          </button>
        ))}
    </div>
  );
}

/* =========================
   Booking Form
   ========================= */

export default function BookingForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [model, setModel] = useState<Booking>({
    vip: false,
    cancelled: false,
    detailsGiven: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { success, error: toastError } = useToast();

  /* --- Lookup State & Locks --- */

  // Company (Account No)
  const [companyQuery, setCompanyQuery] = useState("");
  const companyBoxRef = useRef<HTMLDivElement>(null);
  const companyLookup = useEntityLookup("/companies", companyQuery);
  const [lockedCompany, setLockedCompany] = useState(false);

  // Contact
  const [contactQuery, setContactQuery] = useState("");
  const contactBoxRef = useRef<HTMLDivElement>(null);
  const contactLookup = useEntityLookup("/contacts", contactQuery);
  const [lockedContact, setLockedContact] = useState(false);

  // Staff
  const [staffQuery, setStaffQuery] = useState("");
  const staffBoxRef = useRef<HTMLDivElement>(null);
  const staffLookup = useEntityLookup("/staff", staffQuery);
  const [lockedStaff, setLockedStaff] = useState(false);

  // Client
  const [clientQuery, setClientQuery] = useState("");
  const clientBoxRef = useRef<HTMLDivElement>(null);
  const clientLookup = useEntityLookup("/clients", clientQuery);
  const [lockedClient, setLockedClient] = useState(false);

  // Driver
  const [driverQuery, setDriverQuery] = useState("");
  const driverBoxRef = useRef<HTMLDivElement>(null);
  const driverLookup = useEntityLookup("/drivers", driverQuery);
  const [lockedDriver, setLockedDriver] = useState(false);

  // click outside to close dropdowns
  useEffect(() => {
    const handler = (e: globalThis.MouseEvent) => {
      if (!(e.target instanceof Node)) return;
      const boxes = [
        companyBoxRef.current,
        contactBoxRef.current,
        staffBoxRef.current,
        clientBoxRef.current,
        driverBoxRef.current,
      ];
      const clickedInside = boxes.some(
        (n) => n && n.contains(e.target as Node)
      );
      if (!clickedInside) {
        companyLookup.setOpen(false);
        contactLookup.setOpen(false);
        staffLookup.setOpen(false);
        clientLookup.setOpen(false);
        driverLookup.setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load booking if edit
  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/bookings/${id}`)
      .then((r) => {
        setModel(r.data);
        if (
          r.data?.accountNo &&
          (r.data?.companyName ||
            r.data?.companyTelNo ||
            typeof r.data?.vip === "boolean")
        ) {
          setLockedCompany(true);
        }
        if (
          r.data?.contactId &&
          (r.data?.contactForename ||
            r.data?.contactSurname ||
            r.data?.contactTelNo)
        ) {
          setLockedContact(true);
        }
        if (
          r.data?.staffId &&
          (r.data?.staffForename || r.data?.staffSurname || r.data?.staffTelNo)
        ) {
          setLockedStaff(true);
        }
        if (
          r.data?.clientId &&
          (r.data?.clientForename || r.data?.clientSurname)
        ) {
          setLockedClient(true);
        }
        if (
          r.data?.driverNo &&
          (r.data?.driverForename || r.data?.driverSurname)
        ) {
          setLockedDriver(true);
        }
      })
      .catch((e) =>
        toastError(e?.response?.data?.message || "Failed to load booking")
      );
  }, [id, isEdit, toastError]);

  // validation
  useEffect(() => {
    setErrors(validate(model));
  }, [model]);

  // Auto-calculate Totals
  useEffect(() => {
    const sum = (...vals: (string | null | undefined)[]) => {
      return vals.reduce((acc, v) => {
        const n = parseFloat(v || "0");
        return acc + (isNaN(n) ? 0 : n);
      }, 0);
    };

    const cTotal = sum(
      model.clientScheduledFare,
      model.clientCharge,
      model.clientMeetGreet,
      model.clientWaitingTimePrice,
      model.clientLhrGtwCharge,
      model.clientViaPrice,
      model.clientGratuity,
      model.clientCarPark
    );
    
    const dTotal = sum(
      model.driverScheduledFare,
      model.driverCharge,
      model.driverMeetGreet,
      model.driverWaitingTimePrice,
      model.driverLhrGtwCharge,
      model.driverViaPrice,
      model.driverGratuity,
      model.driverCarPark
    );

    setModel(prev => {
      // Only update if changed to avoid loops (though float comparison can be tricky, toFixed(2) helps)
      const newCT = cTotal.toFixed(2);
      const newDT = dTotal.toFixed(2);
      if (prev.totalClient === newCT && prev.totalDriver === newDT) return prev;
      return { ...prev, totalClient: newCT, totalDriver: newDT };
    });
  }, [
    model.clientScheduledFare,
    model.clientCharge,
    model.clientMeetGreet,
    model.clientWaitingTimePrice,
    model.clientLhrGtwCharge,
    model.clientViaPrice,
    model.clientGratuity,
    model.clientCarPark,
    model.driverScheduledFare,
    model.driverCharge,
    model.driverMeetGreet,
    model.driverWaitingTimePrice,
    model.driverLhrGtwCharge,
    model.driverViaPrice,
    model.driverGratuity,
    model.driverCarPark,
  ]);

  // unlock and clear company-related fields if accountNo cleared
  useEffect(() => {
    if (!lockedCompany) return;
    if (!norm(model.accountNo)) {
      setLockedCompany(false);
      setModel((m) => ({
        ...m,
        companyName: "",
        companyTelNo: "",
        vip: false,
      }));
    }
  }, [model.accountNo, lockedCompany]);

  const setField = (k: keyof Booking) => (e: any) => {
    const el = e?.target;
    const type = el?.type;
    let v: any = type === "checkbox" ? !!el.checked : el?.value;

    // Lookups: open & unlock when user types IDs
    if (k === "accountNo") {
      setCompanyQuery(v ?? "");
      companyLookup.setOpen(true);
      if (lockedCompany) setLockedCompany(false);
    }
    if (k === "contactId") {
      setContactQuery(v ?? "");
      contactLookup.setOpen(true);
      if (lockedContact) setLockedContact(false);
    }
    if (k === "staffId") {
      setStaffQuery(v ?? "");
      staffLookup.setOpen(true);
      if (lockedStaff) setLockedStaff(false);
    }
    if (k === "clientId") {
      setClientQuery(v ?? "");
      clientLookup.setOpen(true);
      if (lockedClient) setLockedClient(false);
    }
    if (k === "driverNo") {
      setDriverQuery(v ?? "");
      driverLookup.setOpen(true);
      if (lockedDriver) setLockedDriver(false);
    }

    if (STRING_FIELDS.has(k) && typeof v === "string") {
      // v = v.trim(); // Do not trim while typing, it prevents spaces
    }
    // if ((k === "clientTelUsedMins" || k === "driverTelUsedMins") && v !== "") {
    //   v = Number.isNaN(Number(v)) ? v : Number(v);
    // }

    setModel((m) => ({ ...m, [k]: v }));
    setDirty((d) => ({ ...d, [k]: true }));
    setTouched((t) => ({ ...t, [k]: true }));
  };

  const markTouched = (k: keyof Booking) => () =>
    setTouched((t) => ({ ...t, [k]: true }));

  // pick handlers
  const pickCompany = (o: any) => {
    setModel((m) => ({
      ...m,
      accountNo: o.id,
      companyName: o._raw?.name ?? o.name ?? m.companyName ?? "",
      companyTelNo: o.telNo ?? m.companyTelNo ?? "",
      vip: !!(o._raw?.vip ?? m.vip),
    }));
    setLockedCompany(true);
    setCompanyQuery(o.id);
    companyLookup.setOpen(false);
  };
  const pickContact = (o: any) => {
    setModel((m) => ({
      ...m,
      contactId: o.id,
      contactForename: o._raw?.forename ?? m.contactForename ?? "",
      contactSurname: o._raw?.surname ?? m.contactSurname ?? "",
      contactTelNo: o.telNo ?? m.contactTelNo ?? "",
    }));
    setLockedContact(true);
    setContactQuery(o.id);
    contactLookup.setOpen(false);
  };
  const pickStaff = (o: any) => {
    setModel((m) => ({
      ...m,
      staffId: o.id,
      staffForename: o._raw?.forename ?? m.staffForename ?? "",
      staffSurname: o._raw?.surname ?? m.staffSurname ?? "",
      staffTelNo: o.telNo ?? m.staffTelNo ?? "",
    }));
    setLockedStaff(true);
    setStaffQuery(o.id);
    staffLookup.setOpen(false);
  };
  const pickClient = (o: any) => {
    setModel((m) => ({
      ...m,
      clientId: o.id,
      clientForename: o._raw?.forename ?? m.clientForename ?? "",
      clientSurname: o._raw?.surname ?? m.clientSurname ?? "",
      clientAddress1: o._raw?.address1 ?? m.clientAddress1 ?? "",
      clientAddress2: o._raw?.address2 ?? m.clientAddress2 ?? "",
      clientTown: o._raw?.town ?? m.clientTown ?? "",
      clientPostcode: o._raw?.postcode ?? m.clientPostcode ?? "",
      clientTelNo: o.telNo ?? m.clientTelNo ?? "",
      clientMobile: o._raw?.mobile ?? m.clientMobile ?? "",
    }));
    setLockedClient(true);
    setClientQuery(o.id);
    clientLookup.setOpen(false);
  };
  const pickDriver = (o: any) => {
    setModel((m) => ({
      ...m,
      driverNo: o.id,
      driverForename: o._raw?.forename ?? m.driverForename ?? "",
      driverSurname: o._raw?.surname ?? m.driverSurname ?? "",
      driverMobile: o.telNo ?? m.driverMobile ?? "",
    }));
    setLockedDriver(true);
    setDriverQuery(o.id);
    driverLookup.setOpen(false);
  };

  const onSubmit = async (e: FormEvent | ReactMouseEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const touchedAll = REQUIRED.reduce(
      (acc, k) => ((acc[k] = true), acc),
      {} as any
    );
    setTouched((t) => ({ ...t, ...touchedAll }));

    const errs = validate(model);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/bookings/${id}`, model);
        success("Booking updated");
      } else {
        await api.post("/bookings", model);
        success("Booking created");
      }
      nav("/bookings");
    } catch (err: any) {
      toastError(err?.response?.data?.message || err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!isEdit) return;
    if (!window.confirm("Delete this booking? This cannot be undone.")) return;
    try {
      await api.delete(`/bookings/${id}`);
      success("Booking deleted");
      nav("/bookings");
    } catch (err: any) {
      toastError(
        err?.response?.data?.message || err.message || "Delete failed"
      );
    }
  };

  const showErr = (k: keyof Booking) =>
    (submitted || touched[k] || dirty[k]) && !!errors[k];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold">
          {isEdit ? "Edit Booking" : "New Booking"}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn border border-slate-200"
            onClick={() => nav("/bookings")}
          >
            Cancel
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={onDelete}
              className="btn border border-rose-300 text-rose-700 hover:bg-rose-50"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={onSubmit as any}
            disabled={saving}
            className="btn btn-primary disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        {/* Booking / Company */}
        <Section title="Booking & Company">
          <Grid>
            <L label="Booking Ref">
              <input
                className="input"
                value={model.bookingRef ?? ""}
                onChange={setField("bookingRef")}
                onBlur={markTouched("bookingRef")}
              />
              {showErr("bookingRef") && (
                <div className="text-rose-600 text-xs mt-1">
                  {errors.bookingRef}
                </div>
              )}
            </L>

            {/* Account No + dropdown */}
            <div ref={companyBoxRef} className="relative">
              <L label="Account No">
                <input
                  className="input"
                  value={model.accountNo ?? ""}
                  onChange={setField("accountNo")}
                  onFocus={() =>
                    companyLookup.setOpen(!!(companyQuery || model.accountNo))
                  }
                />
              </L>
              {showErr("accountNo") && (
                <div className="text-rose-600 text-xs mt-1 px-1">
                  {errors.accountNo}
                </div>
              )}
              <Dropdown
                open={companyLookup.open}
                loading={companyLookup.loading}
                options={companyLookup.opts}
                onPick={pickCompany}
              />
            </div>

            <L label="Cost Centre">
              <input
                className="input"
                value={model.costCentre ?? ""}
                onChange={setField("costCentre")}
                onBlur={markTouched("costCentre")}
              />
            </L>

            <L label="Company Name">
              <input
                className={`input ${lockedCompany ? "bg-slate-50" : ""}`}
                value={model.companyName ?? ""}
                onChange={setField("companyName")}
                onBlur={markTouched("companyName")}
                disabled={lockedCompany}
              />
            </L>
            <L label="Company Tel No">
              <input
                className={`input ${lockedCompany ? "bg-slate-50" : ""}`}
                value={model.companyTelNo ?? ""}
                onChange={setField("companyTelNo")}
                onBlur={markTouched("companyTelNo")}
                disabled={lockedCompany}
              />
            </L>
            {/* VIP field hidden as per request */}
            {/* <L label="VIP">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={!!model.vip}
                onChange={setField("vip")}
                onBlur={markTouched("vip")}
                disabled={lockedCompany}
              />
            </L> */}
          </Grid>
        </Section>

        {/* Contact */}
        <Section title="Contact">
          <Grid>
            {/* Contact ID + dropdown */}
            <div ref={contactBoxRef} className="relative">
              <L label="Contact ID">
                <input
                  className="input"
                  value={model.contactId ?? ""}
                  onChange={setField("contactId")}
                  onFocus={() =>
                    contactLookup.setOpen(!!(contactQuery || model.contactId))
                  }
                />
              </L>
              <Dropdown
                open={contactLookup.open}
                loading={contactLookup.loading}
                options={contactLookup.opts}
                onPick={pickContact}
              />
            </div>
            <L label="Forename">
              <input
                className={`input ${lockedContact ? "bg-slate-50" : ""}`}
                value={model.contactForename ?? ""}
                onChange={setField("contactForename")}
                onBlur={markTouched("contactForename")}
                disabled={lockedContact}
              />
            </L>
            <L label="Surname">
              <input
                className={`input ${lockedContact ? "bg-slate-50" : ""}`}
                value={model.contactSurname ?? ""}
                onChange={setField("contactSurname")}
                onBlur={markTouched("contactSurname")}
                disabled={lockedContact}
              />
            </L>
            <L label="Tel No">
              <input
                className={`input ${lockedContact ? "bg-slate-50" : ""}`}
                value={model.contactTelNo ?? ""}
                onChange={setField("contactTelNo")}
                onBlur={markTouched("contactTelNo")}
                disabled={lockedContact}
              />
            </L>
          </Grid>
        </Section>

        {/* Staff & Client */}
        <Section title="Staff & Client">
          <Grid>
            {/* Staff ID + dropdown */}
            <div ref={staffBoxRef} className="relative">
              <L label="Staff ID">
                <input
                  className="input"
                  value={model.staffId ?? ""}
                  onChange={setField("staffId")}
                  onFocus={() =>
                    staffLookup.setOpen(!!(staffQuery || model.staffId))
                  }
                />
              </L>
              <Dropdown
                open={staffLookup.open}
                loading={staffLookup.loading}
                options={staffLookup.opts}
                onPick={pickStaff}
              />
            </div>
            <L label="Staff Forename">
              <input
                className={`input ${lockedStaff ? "bg-slate-50" : ""}`}
                value={model.staffForename ?? ""}
                onChange={setField("staffForename")}
                onBlur={markTouched("staffForename")}
                disabled={lockedStaff}
              />
            </L>
            <L label="Staff Surname">
              <input
                className={`input ${lockedStaff ? "bg-slate-50" : ""}`}
                value={model.staffSurname ?? ""}
                onChange={setField("staffSurname")}
                onBlur={markTouched("staffSurname")}
                disabled={lockedStaff}
              />
            </L>
            <L label="Staff Tel No">
              <input
                className={`input ${lockedStaff ? "bg-slate-50" : ""}`}
                value={model.staffTelNo ?? ""}
                onChange={setField("staffTelNo")}
                onBlur={markTouched("staffTelNo")}
                disabled={lockedStaff}
              />
            </L>

            <L label="Date Taken">
              <input
                type="date"
                className="input"
                value={model.dateTaken ?? ""}
                onChange={setField("dateTaken")}
                onBlur={markTouched("dateTaken")}
              />
              {showErr("dateTaken") && (
                <div className="text-rose-600 text-xs mt-1">
                  {errors.dateTaken}
                </div>
              )}
            </L>
            <L label="Time Taken">
              <input
                className="input"
                placeholder="HH:mm"
                value={model.timeTaken ?? ""}
                onChange={setField("timeTaken")}
                onBlur={markTouched("timeTaken")}
              />
              {showErr("timeTaken") && (
                <div className="text-rose-600 text-xs mt-1">
                  {errors.timeTaken}
                </div>
              )}
            </L>

            {/* Client ID + dropdown */}
            <div ref={clientBoxRef} className="relative">
              <L label="Client ID">
                <input
                  className="input"
                  value={model.clientId ?? ""}
                  onChange={setField("clientId")}
                  onFocus={() =>
                    clientLookup.setOpen(!!(clientQuery || model.clientId))
                  }
                />
              </L>
              <Dropdown
                open={clientLookup.open}
                loading={clientLookup.loading}
                options={clientLookup.opts}
                onPick={pickClient}
              />
            </div>

            <L label="Client Forename">
              <input
                className={`input ${lockedClient ? "bg-slate-50" : ""}`}
                value={model.clientForename ?? ""}
                onChange={setField("clientForename")}
                onBlur={markTouched("clientForename")}
                disabled={lockedClient}
              />
            </L>
            <L label="Client Surname">
              <input
                className={`input ${lockedClient ? "bg-slate-50" : ""}`}
                value={model.clientSurname ?? ""}
                onChange={setField("clientSurname")}
                onBlur={markTouched("clientSurname")}
                disabled={lockedClient}
              />
            </L>
            <L label="Client Address 1">
              <input
                className={`input ${lockedClient ? "bg-slate-50" : ""}`}
                value={model.clientAddress1 ?? ""}
                onChange={setField("clientAddress1")}
                onBlur={markTouched("clientAddress1")}
                disabled={lockedClient}
              />
            </L>
            <L label="Client Address 2">
              <input
                className={`input ${lockedClient ? "bg-slate-50" : ""}`}
                value={model.clientAddress2 ?? ""}
                onChange={setField("clientAddress2")}
                onBlur={markTouched("clientAddress2")}
                disabled={lockedClient}
              />
            </L>
            <L label="Client Town">
              <input
                className={`input ${lockedClient ? "bg-slate-50" : ""}`}
                value={model.clientTown ?? ""}
                onChange={setField("clientTown")}
                onBlur={markTouched("clientTown")}
                disabled={lockedClient}
              />
            </L>
            <L label="Client Postcode">
              <input
                className={`input ${lockedClient ? "bg-slate-50" : ""}`}
                value={model.clientPostcode ?? ""}
                onChange={setField("clientPostcode")}
                onBlur={markTouched("clientPostcode")}
                disabled={lockedClient}
              />
            </L>
            <L label="Client Tel No">
              <input
                className={`input ${lockedClient ? "bg-slate-50" : ""}`}
                value={model.clientTelNo ?? ""}
                onChange={setField("clientTelNo")}
                onBlur={markTouched("clientTelNo")}
                disabled={lockedClient}
              />
            </L>
            <L label="Client Mobile">
              <input
                className={`input ${lockedClient ? "bg-slate-50" : ""}`}
                value={model.clientMobile ?? ""}
                onChange={setField("clientMobile")}
                onBlur={markTouched("clientMobile")}
                disabled={lockedClient}
              />
            </L>
          </Grid>
        </Section>

        {/* Driver & Trip */}
        <Section title="Driver & Trip">
          <Grid>
            {/* Driver No + dropdown */}
            <div ref={driverBoxRef} className="relative">
              <L label="Driver No">
                <input
                  className="input"
                  value={model.driverNo ?? ""}
                  onChange={setField("driverNo")}
                  onFocus={() =>
                    driverLookup.setOpen(!!(driverQuery || model.driverNo))
                  }
                />
              </L>
              <Dropdown
                open={driverLookup.open}
                loading={driverLookup.loading}
                options={driverLookup.opts}
                onPick={pickDriver}
              />
            </div>

            <L label="Driver Forename">
              <input
                className={`input ${lockedDriver ? "bg-slate-50" : ""}`}
                value={model.driverForename ?? ""}
                onChange={setField("driverForename")}
                onBlur={markTouched("driverForename")}
                disabled={lockedDriver}
              />
            </L>
            <L label="Driver Surname">
              <input
                className={`input ${lockedDriver ? "bg-slate-50" : ""}`}
                value={model.driverSurname ?? ""}
                onChange={setField("driverSurname")}
                onBlur={markTouched("driverSurname")}
                disabled={lockedDriver}
              />
            </L>
            <L label="Driver Mobile">
              <input
                className={`input ${lockedDriver ? "bg-slate-50" : ""}`}
                value={model.driverMobile ?? ""}
                onChange={setField("driverMobile")}
                onBlur={markTouched("driverMobile")}
                disabled={lockedDriver}
              />
            </L>

            <L label="Date *">
              <input
                type="date"
                className="input"
                value={model.date ?? ""}
                onChange={setField("date")}
                onBlur={markTouched("date")}
              />
              {showErr("date") && (
                <div className="text-rose-600 text-xs mt-1">{errors.date}</div>
              )}
            </L>
            <L label="Time *">
              <input
                className="input"
                placeholder="HH:mm"
                value={model.time ?? ""}
                onChange={setField("time")}
                onBlur={markTouched("time")}
              />
              {showErr("time") && (
                <div className="text-rose-600 text-xs mt-1">{errors.time}</div>
              )}
            </L>
            <L label="Vehicle *">
              <input
                className="input"
                value={model.vehicle ?? ""}
                onChange={setField("vehicle")}
                onBlur={markTouched("vehicle")}
              />
              {showErr("vehicle") && (
                <div className="text-rose-600 text-xs mt-1">
                  {errors.vehicle}
                </div>
              )}
            </L>
            <L label="Details Given">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={!!model.detailsGiven}
                onChange={setField("detailsGiven")}
                onBlur={markTouched("detailsGiven")}
              />
            </L>
            <L label="Cancelled">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={!!model.cancelled}
                onChange={setField("cancelled")}
                onBlur={markTouched("cancelled")}
              />
            </L>

            <div className="md:col-span-2">
              <L label="Pick Up Address *">
                <textarea
                  className="input h-24"
                  value={model.pickUpAddress ?? ""}
                  onChange={setField("pickUpAddress")}
                  onBlur={markTouched("pickUpAddress")}
                />
                {showErr("pickUpAddress") && (
                  <div className="text-rose-600 text-xs mt-1">
                    {errors.pickUpAddress}
                  </div>
                )}
              </L>
            </div>
            <div className="md:col-span-2">
              <L label="Drop Off Address *">
                <textarea
                  className="input h-24"
                  value={model.dropOffAddress ?? ""}
                  onChange={setField("dropOffAddress")}
                  onBlur={markTouched("dropOffAddress")}
                />
                {showErr("dropOffAddress") && (
                  <div className="text-rose-600 text-xs mt-1">
                    {errors.dropOffAddress}
                  </div>
                )}
              </L>
            </div>
            <div className="md:col-span-2">
              <L label="Via">
                <textarea
                  className="input h-20"
                  value={model.via ?? ""}
                  onChange={setField("via")}
                  onBlur={markTouched("via")}
                />
              </L>
            </div>
            <div className="md:col-span-2">
              <L label="Extra Info">
                <textarea
                  className="input h-20"
                  value={model.extraInfo ?? ""}
                  onChange={setField("extraInfo")}
                  onBlur={markTouched("extraInfo")}
                />
              </L>
            </div>
          </Grid>
        </Section>

        {/* Fare Breakdown */}
        <details className="bg-white border border-slate-200 rounded-xl open:shadow-sm">
          <summary className="cursor-pointer select-none px-4 py-3 font-medium">
            Fare Breakdown
          </summary>
          <div className="p-4 border-t grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Client</h4>
              <Grid>
                <MoneyField
                  name="clientScheduledFare"
                  label="Scheduled Fare"
                  model={model}
                  setField={setField}
                  markTouched={markTouched}
                  showError={showErr("clientScheduledFare")}
                  error={errors.clientScheduledFare}
                />
                <MoneyField
                  name="clientCharge"
                  label="C Charge"
                  model={model}
                  setField={setField}
                  markTouched={markTouched}
                  showError={showErr("clientCharge")}
                  error={errors.clientCharge}
                />
                <MoneyField
                  name="clientMeetGreet"
                  label="Meet & Greet"
                  model={model}
                  setField={setField}
                  markTouched={markTouched}
                  showError={showErr("clientMeetGreet")}
                  error={errors.clientMeetGreet}
                />
                <MoneyField
                  name="clientLhrGtwCharge"
                  label="LHR/GTW Charge"
                  model={model}
                  setField={setField}
                  markTouched={markTouched}
                  showError={showErr("clientLhrGtwCharge")}
                  error={errors.clientLhrGtwCharge}
                />
                <MoneyField
                  name="clientViaPrice"
                  label="Via Price"
                  model={model}
                  setField={setField}
                  markTouched={markTouched}
                  showError={showErr("clientViaPrice")}
                  error={errors.clientViaPrice}
                />
                 <MoneyField
                  name="clientGratuity"
                  label="Gratuity"
                  model={model}
                  setField={setField}
                  markTouched={markTouched}
                  showError={showErr("clientGratuity")}
                  error={errors.clientGratuity}
                />
                <MoneyField
                  name="clientWaitingTime"
                  label="Waiting Time"
                  model={model}
                  setField={setField}
                  markTouched={markTouched}
                  showError={showErr("clientWaitingTime")}
                  error={errors.clientWaitingTime}
                />
                <MoneyField
                  name="clientWaitingTimePrice"
                  label="Waiting Time Price"
                  model={model}
                  setField={setField}
                  markTouched={markTouched}
                  showError={showErr("clientWaitingTimePrice")}
                  error={errors.clientWaitingTimePrice}
                />
                <MoneyField
                  name="clientCarPark"
                  label="Car Park"
                  model={model}
                  setField={setField}
                  markTouched={markTouched}
                  showError={showErr("clientCarPark")}
                  error={errors.clientCarPark}
                />
                <MoneyField
                  name="totalClient"
                  label="Total"
                  model={model}
                  setField={setField}
                  markTouched={markTouched}
                  showError={showErr("totalClient")}
                  error={errors.totalClient}
                />
              </Grid>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Driver</h4>
              <Grid>
                <MoneyField
                  name="driverScheduledFare"
                  label="Scheduled Fare"
                  model={model}
                  setField={setField}
                  markTouched={markTouched}
                  showError={showErr("driverScheduledFare")}
                  error={errors.driverScheduledFare}
                />
                <MoneyField
                  name="driverCharge"
                  label="C Charge"
                  model={model}
                  setField={setField}
                  markTouched={markTouched}
                  showError={showErr("driverCharge")}
                  error={errors.driverCharge}
                />
                <MoneyField
                  name="driverMeetGreet"
                  label="Meet & Greet"
                  model={model}
                  setField={setField}
                  markTouched={markTouched}
                  showError={showErr("driverMeetGreet")}
                  error={errors.driverMeetGreet}
                />
                <MoneyField
                  name="driverWaitingTime"
                  label="Waiting Time"
                  model={model}
                  setField={setField}
                  markTouched={markTouched}
                  showError={showErr("driverWaitingTime")}
                  error={errors.driverWaitingTime}
                />
                <MoneyField
                  name="driverWaitingTimePrice"
                  label="Waiting Time Price"
                  model={model}
                  setField={setField}
                  markTouched={markTouched}
                  showError={showErr("driverWaitingTimePrice")}
                  error={errors.driverWaitingTimePrice}
                />
                <MoneyField
                  name="driverLhrGtwCharge"
                  label="LHR/GTW Charge"
                  model={model}
                  setField={setField}
                  markTouched={markTouched}
                  showError={showErr("driverLhrGtwCharge")}
                  error={errors.driverLhrGtwCharge}
                />
                <MoneyField
                  name="driverViaPrice"
                  label="Via Price"
                  model={model}
                  setField={setField}
                  markTouched={markTouched}
                  showError={showErr("driverViaPrice")}
                  error={errors.driverViaPrice}
                />
                <MoneyField
                  name="driverGratuity"
                  label="Gratuity"
                  model={model}
                  setField={setField}
                  markTouched={markTouched}
                  showError={showErr("driverGratuity")}
                  error={errors.driverGratuity}
                />
                <MoneyField
                  name="driverCarPark"
                  label="Car Park"
                  model={model}
                  setField={setField}
                  markTouched={markTouched}
                  showError={showErr("driverCarPark")}
                  error={errors.driverCarPark}
                />
                <MoneyField
                  name="totalDriver"
                  label="Total"
                  model={model}
                  setField={setField}
                  markTouched={markTouched}
                  showError={showErr("totalDriver")}
                  error={errors.totalDriver}
                />
              </Grid>
            </div>
          </div>
        </details>

        <div className="md:col-span-2">
          <L label="Notes">
            <textarea
              className="input h-24"
              value={model.notes ?? ""}
              onChange={setField("notes")}
              onBlur={markTouched("notes")}
            />
          </L>
        </div>

        {/* Hidden submit so Enter works */}
        <button type="submit" className="hidden" />
      </form>
    </div>
  );
}
