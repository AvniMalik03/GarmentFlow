// components/orders/StatusBadge.tsx

type OrderStatus = "active" | "delayed" | "completed" | "on_hold";

type Stage =
    | "cloth_received"
    | "cutting"
    | "stitching"
    | "finishing"
    | "ironing"
    | "packing"
    | "dispatch";

interface StatusBadgeProps {
    status: OrderStatus;
}

interface StageBadgeProps {
    stage: Stage;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
    OrderStatus,
    { label: string; className: string }
> = {
    active: {
        label: "Active",
        className:
            "bg-blue-50 text-blue-700 border border-blue-200",
    },
    delayed: {
        label: "Delayed",
        className:
            "bg-red-50 text-red-700 border border-red-200",
    },
    completed: {
        label: "Completed",
        className:
            "bg-green-50 text-green-700 border border-green-200",
    },
    on_hold: {
        label: "On Hold",
        className:
            "bg-amber-50 text-amber-700 border border-amber-200",
    },
};

const STAGE_CONFIG: Record<
    Stage,
    { label: string; className: string }
> = {
    cloth_received: {
        label: "Cloth Received",
        className: "bg-gray-100 text-gray-600 border border-gray-200",
    },
    cutting: {
        label: "Cutting",
        className: "bg-purple-50 text-purple-700 border border-purple-200",
    },
    stitching: {
        label: "Stitching",
        className: "bg-blue-50 text-blue-700 border border-blue-200",
    },
    finishing: {
        label: "Finishing",
        className: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    },
    ironing: {
        label: "Ironing",
        className: "bg-orange-50 text-orange-700 border border-orange-200",
    },
    packing: {
        label: "Packing",
        className: "bg-teal-50 text-teal-700 border border-teal-200",
    },
    dispatch: {
        label: "Dispatched",
        className: "bg-green-50 text-green-700 border border-green-200",
    },
};

// ── StatusBadge — shows order status (Active, Delayed, etc.) ─────────────────

export function StatusBadge({ status }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status];

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
        >
            {/* Dot indicator */}
            <span
                className={`w-1.5 h-1.5 rounded-full ${status === "active"
                        ? "bg-blue-500"
                        : status === "delayed"
                            ? "bg-red-500"
                            : status === "completed"
                                ? "bg-green-500"
                                : "bg-amber-500"
                    }`}
            />
            {config.label}
        </span>
    );
}

// ── StageBadge — shows current production stage ───────────────────────────────

export function StageBadge({ stage }: StageBadgeProps) {
    const config = STAGE_CONFIG[stage];

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
        >
            {config.label}
        </span>
    );
}

// ── Default export (StatusBadge) ──────────────────────────────────────────────

export default StatusBadge;