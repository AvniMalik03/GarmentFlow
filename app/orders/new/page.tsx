'use client';

import React, { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

type OrderForm = {
  clientName: string;
  productName: string;
  quantity: string;
  deadline: string;
  priority: Priority;
  fabricType: string;
  assignedSupervisor: string;
  notes: string;
};

type SubmittedOrder = OrderForm & {
  orderId: string;
  createdAt: string;
};

type StoredOrder = {
  id: string;
  client_name: string;
  product_name: string;
  quantity: number;
  deadline: string;
  priority: Lowercase<Priority>;
  status: 'active';
  current_stage: 'cloth_received';
  notes: string;
  created_at: string;
};

const initialForm: OrderForm = {
  clientName: '',
  productName: '',
  quantity: '',
  deadline: '',
  priority: 'Medium',
  fabricType: '',
  assignedSupervisor: '',
  notes: '',
};

const priorities: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];

export default function NewOrderPage() {
  const [form, setForm] = useState<OrderForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof OrderForm, string>>>({});
  const [submittedOrder, setSubmittedOrder] = useState<SubmittedOrder | null>(null);

  const summary = useMemo(
    () => ({
      client: form.clientName || 'Not specified',
      product: form.productName || 'Not specified',
      quantity: form.quantity ? Number(form.quantity).toLocaleString() : '0',
      deadline: form.deadline || 'Not scheduled',
      priority: form.priority,
    }),
    [form]
  );

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
    setSubmittedOrder(null);

    if (errors[name as keyof OrderForm]) {
      setErrors((current) => ({
        ...current,
        [name]: undefined,
      }));
    }
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof OrderForm, string>> = {};

    if (!form.clientName.trim()) nextErrors.clientName = 'Client name is required.';
    if (!form.productName.trim()) nextErrors.productName = 'Product name is required.';
    if (!form.quantity.trim()) {
      nextErrors.quantity = 'Quantity is required.';
    } else if (Number(form.quantity) <= 0) {
      nextErrors.quantity = 'Quantity must be greater than 0.';
    }
    if (!form.deadline) nextErrors.deadline = 'Deadline is required.';
    if (!form.priority) nextErrors.priority = 'Priority is required.';
    if (!form.fabricType.trim()) nextErrors.fabricType = 'Fabric type is required.';
    if (!form.assignedSupervisor.trim()) {
      nextErrors.assignedSupervisor = 'Assigned supervisor is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const d = now.getDate();
    const m = months[now.getMonth()];
    const y = now.getFullYear();
    let h = now.getHours();
    const min = now.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    const createdAt = `${d} ${m} ${y}, ${h}:${min} ${ampm}`;

    const orderId = `PO-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: StoredOrder = {
      id: orderId,
      client_name: form.clientName.trim(),
      product_name: form.productName.trim(),
      quantity: Number(form.quantity),
      deadline: form.deadline,
      priority: form.priority.toLowerCase() as Lowercase<Priority>,
      status: 'active',
      current_stage: 'cloth_received',
      notes: form.notes.trim(),
      created_at: now.toISOString(),
    };

    let existingOrders: unknown = [];
    const storedOrders = localStorage.getItem('garment_orders');

    if (storedOrders) {
      try {
        existingOrders = JSON.parse(storedOrders) as unknown;
      } catch {
        existingOrders = [];
      }
    }

    const updatedOrders = Array.isArray(existingOrders)
      ? [...existingOrders, newOrder]
      : [newOrder];
    localStorage.setItem('garment_orders', JSON.stringify(updatedOrders));

    setSubmittedOrder({
      ...form,
      orderId,
      createdAt,
    });
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setSubmittedOrder(null);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen space-y-8 pb-12 text-slate-900 animate-fade-in">
        <header className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Create Production Order
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Initialize new bulk orders and define pipeline specifications.
          </p>
        </header>

        {submittedOrder && (
          <section className="rounded-xl border border-emerald-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                  Order Created
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {submittedOrder.orderId}
                </h2>
                <div className="mt-4">
                  <p className="text-sm text-slate-500">Created On</p>
                  <p className="text-sm text-slate-900">{submittedOrder.createdAt}</p>
                </div>
                <p className="mt-4 text-sm text-slate-500">
                  Production order has been initialized with mock frontend data.
                </p>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2 lg:min-w-[520px]">
                <SuccessDetail label="Client Name" value={submittedOrder.clientName} />
                <SuccessDetail label="Product Name" value={submittedOrder.productName} />
                <SuccessDetail
                  label="Quantity"
                  value={Number(submittedOrder.quantity).toLocaleString()}
                />
                <SuccessDetail label="Priority" value={submittedOrder.priority} />
                <SuccessDetail label="Deadline" value={submittedOrder.deadline} />
              </div>
            </div>
          </section>
        )}

        <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-950">Order Information</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Define the client, product scope, timeline, and order priority.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Client Name" error={errors.clientName}>
                  <input
                    name="clientName"
                    value={form.clientName}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Acme Retail"
                  />
                </Field>

                <Field label="Product Name" error={errors.productName}>
                  <input
                    name="productName"
                    value={form.productName}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Cotton work shirts"
                  />
                </Field>

                <Field label="Quantity" error={errors.quantity}>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="1200"
                  />
                </Field>

                <Field label="Deadline" error={errors.deadline}>
                  <input
                    name="deadline"
                    type="date"
                    value={form.deadline}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>

                <Field label="Priority" error={errors.priority}>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-950">Production Details</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add materials, owner, and useful production notes.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Fabric Type" error={errors.fabricType}>
                  <input
                    name="fabricType"
                    value={form.fabricType}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Organic cotton twill"
                  />
                </Field>

                <Field label="Assigned Supervisor" error={errors.assignedSupervisor}>
                  <input
                    name="assignedSupervisor"
                    value={form.assignedSupervisor}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Riya Sharma"
                  />
                </Field>

                <Field label="Notes" className="md:col-span-2" error={errors.notes}>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    className={`${inputClass} min-h-32 resize-y`}
                    placeholder="Add sizing, packaging, or inspection instructions."
                  />
                </Field>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-950">Order Summary</h2>
                <p className="mt-1 text-sm text-slate-500">Live production order preview.</p>
              </div>

              <div className="space-y-4">
                <SummaryRow label="Client" value={summary.client} />
                <SummaryRow label="Product" value={summary.product} />
                <SummaryRow label="Quantity" value={summary.quantity} />
                <SummaryRow label="Deadline" value={summary.deadline} />
                <SummaryRow label="Priority" value={summary.priority} accent />
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                >
                  Create Order
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                >
                  Reset Form
                </button>
              </div>
            </section>
          </aside>
        </form>
      </div>
    </DashboardLayout>
  );
}

function Field({
  label,
  error,
  className = '',
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>}
    </label>
  );
}

function SummaryRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span
        className={`text-right text-sm font-bold ${
          accent ? 'text-indigo-600' : 'text-slate-950'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function SuccessDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100';
