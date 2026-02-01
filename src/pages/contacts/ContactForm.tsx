import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { useToast } from "../../components/toast/ToastProvider";

type Contact = {
  id?: string;
  contactId?: string | null;
  accountNo?: string | null;
  forename?: string | null;
  surname?: string | null;
  telNo?: string | null;
  email?: string | null;
};

type Errors = Partial<Record<keyof Contact, string>>;
const REQUIRED: (keyof Contact)[] = []; // none strictly required per legacy UI

const norm = (v: unknown) => String(v ?? "").trim();
function validate(m: Contact): Errors {
  const e: Errors = {};
  REQUIRED.forEach((k) => {
    if (!norm((m as any)[k])) e[k] = "Required";
  });
  if (m.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email))
    e.email = "Invalid";
  return e;
}

export default function ContactForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { success, error: toastError } = useToast();

  const [model, setModel] = useState<Contact>({});
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/contacts/${id}`)
      .then((r) => setModel(r.data))
      .catch((e) =>
        toastError(e?.response?.data?.message || "Failed to load contact")
      );
  }, [id, isEdit, toastError]);

  useEffect(() => {
    setErrors(validate(model));
  }, [model]);

  const set =
    (k: keyof Contact) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setModel((m) => ({ ...m, [k]: e.target.value }));
      setTouched((t) => ({ ...t, [k]: true }));
      setDirty((d) => ({ ...d, [k]: true }));
    };

  const E = (k: keyof Contact) =>
    (submitted || touched[k] || dirty[k]) && errors[k] ? (
      <div className="text-rose-600 text-xs mt-1">{errors[k]}</div>
    ) : null;

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(model);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/contacts/${id}`, model);
        success("Contact updated");
      } else {
        await api.post("/contacts", model);
        success("Contact created");
      }
      nav("/contacts");
    } catch (err: any) {
      toastError(err?.response?.data?.message || err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold">
          {isEdit ? "Edit Contact" : "New Contact"}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn border border-slate-200"
            onClick={() => nav("/contacts")}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="contact-form"
            disabled={saving}
            className="btn btn-primary disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <form
        id="contact-form"
        onSubmit={onSubmit}
        className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 grid md:grid-cols-2 gap-4"
      >
        <L label="Contact ID">
          <input
            className="input"
            value={model.contactId ?? ""}
            onChange={set("contactId")}
          />
          {E("contactId")}
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
        <L label="Tel No">
          <input
            className="input"
            value={model.telNo ?? ""}
            onChange={set("telNo")}
          />
          {E("telNo")}
        </L>
        <L label="Email">
          <input
            className="input"
            value={model.email ?? ""}
            onChange={set("email")}
          />
          {E("email")}
        </L>
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
