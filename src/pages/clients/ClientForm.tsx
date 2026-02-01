import { useEffect, useState, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";

type Client = {
  id?: string;
  clientId: string;
  accountNo?: string | null;
  forename?: string | null;
  surname?: string | null;
  address1?: string | null;
  address2?: string | null;
  town?: string | null;
  county?: string | null;
  postcode?: string | null;
  telNo?: string | null;
  mobile?: string | null;
};

type Errors = Partial<Record<keyof Client, string>>;

const REQUIRED: (keyof Client)[] = ["clientId"];

const norm = (v: unknown) => String(v ?? "").trim();

function validate(m: Client): Errors {
  const e: Errors = {};
  REQUIRED.forEach((k) => {
    if (!norm((m as any)[k])) e[k] = "Required";
  });
  // simple sanity for phones/postcode (non-blocking if empty)
  if (m.postcode && !/^[A-Za-z0-9\s-]{3,10}$/.test(m.postcode))
    e.postcode = "Invalid";
  if (m.telNo && !/^[+0-9()\s-]{5,20}$/.test(m.telNo)) e.telNo = "Invalid";
  if (m.mobile && !/^[+0-9()\s-]{5,20}$/.test(m.mobile)) e.mobile = "Invalid";
  return e;
}

export default function ClientForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { success, error: toastError } = useToast();

  const [model, setModel] = useState<Client>({ clientId: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/clients/${id}`)
      .then((r) => setModel(r.data))
      .catch((e) => {
        toastError(e?.response?.data?.message || "Failed to load client");
      });
  }, [id, isEdit, toastError]);

  useEffect(() => {
    setErrors(validate(model));
  }, [model]);

  const set = (k: keyof Client) => (e: any) => {
    const v = e?.target?.value?.trim?.() ?? e?.target?.value;
    setModel((m) => ({ ...m, [k]: v }));
    setTouched((t) => ({ ...t, [k]: true }));
    setDirty((d) => ({ ...d, [k]: true }));
  };

  const onSubmit = async (e: FormEvent | MouseEvent) => {
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
        await api.put(`/clients/${id}`, model);
        success("Client updated");
      } else {
        await api.post("/clients", model);
        success("Client created");
      }
      nav("/clients");
    } catch (err: any) {
      toastError(err?.response?.data?.message || err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const E = (k: keyof Client) =>
    (submitted || touched[k] || dirty[k]) && errors[k] ? (
      <div className="text-rose-600 text-xs mt-1">{errors[k]}</div>
    ) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold">
          {isEdit ? "Edit Client" : "New Client"}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn border border-slate-200"
            onClick={() => nav("/clients")}
          >
            Cancel
          </button>
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
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b font-medium">Client</div>
          <div className="p-4 grid md:grid-cols-2 gap-4">
            <L label="Client ID *">
              <input
                className="input"
                value={model.clientId}
                onChange={set("clientId")}
              />
              {E("clientId")}
            </L>
            <L label="Account No">
              <input
                className="input"
                value={model.accountNo ?? ""}
                onChange={set("accountNo")}
              />
              {E("accountNo")}
            </L>

            <L label="Forename">
              <input
                className="input"
                value={model.forename ?? ""}
                onChange={set("forename")}
              />
              {E("forename")}
            </L>
            <L label="Surname">
              <input
                className="input"
                value={model.surname ?? ""}
                onChange={set("surname")}
              />
              {E("surname")}
            </L>

            <div className="md:col-span-2">
              <L label="Address 1">
                <input
                  className="input"
                  value={model.address1 ?? ""}
                  onChange={set("address1")}
                />
                {E("address1")}
              </L>
            </div>
            <div className="md:col-span-2">
              <L label="Address 2">
                <input
                  className="input"
                  value={model.address2 ?? ""}
                  onChange={set("address2")}
                />
                {E("address2")}
              </L>
            </div>

            <L label="Town">
              <input
                className="input"
                value={model.town ?? ""}
                onChange={set("town")}
              />
              {E("town")}
            </L>
            <L label="County">
              <input
                className="input"
                value={model.county ?? ""}
                onChange={set("county")}
              />
              {E("county")}
            </L>
            <L label="Postcode">
              <input
                className="input"
                value={model.postcode ?? ""}
                onChange={set("postcode")}
              />
              {E("postcode")}
            </L>

            <L label="Tel No">
              <input
                className="input"
                value={model.telNo ?? ""}
                onChange={set("telNo")}
              />
              {E("telNo")}
            </L>
            <L label="Client Mobile">
              <input
                className="input"
                value={model.mobile ?? ""}
                onChange={set("mobile")}
              />
              {E("mobile")}
            </L>
          </div>
        </div>

        {/* Hidden submit so Enter works */}
        <button type="submit" className="hidden" />
      </form>
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm text-slate-600 mb-1">{label}</div>
      {children}
    </label>
  );
}
